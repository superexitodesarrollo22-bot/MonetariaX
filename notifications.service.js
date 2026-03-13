import Constants from 'expo-constants';
import * as Device from 'expo-device';

const isExpoGo = Constants.appOwnership === 'expo';

let Notifications = null;

if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
    
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (e) {
    console.warn('Failed to load expo-notifications:', e);
  }
}

export async function requestNotificationPermissions() {
  if (isExpoGo || !Notifications) {
    console.log('[DEV] Permisos de notificación omitidos en Expo Go');
    return false;
  }
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleNotification({ title, body, trigger }) {
  if (isExpoGo || !Notifications) {
    console.log('[DEV] Notificación omitida en Expo Go:', title, '-', body);
    return null;
  }
  try {
    return await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: trigger || null,
    });
  } catch (error) {
    console.warn('Error scheduling notification:', error);
    return null;
  }
}

export async function cancelAllNotifications() {
  if (isExpoGo || !Notifications) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Register for push notifications and set channel for Android
 */
export async function registerForPushNotificationsAsync() {
  if (isExpoGo || !Notifications) {
    console.log('[DEV] Registro de notificaciones omitido en Expo Go');
    return false;
  }
  if (!Device.isDevice) return false;
  
  const granted = await requestNotificationPermissions();
  if (!granted) return false;

  const { Platform } = require('react-native');
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  return true;
}

/**
 * Domain specific: Schedule payment alert
 * @param {string} name 
 * @param {number} date 
 * @param {number} amount 
 * @param {boolean} isDebt 
 * @param {number|null} cuota 
 */
export async function schedulePaymentAlert(name, date, amount, isDebt = false, cuota = null) {
  const title = isDebt ? "💳 Vencimiento de Cuota" : "📅 Recordatorio de Pago";
  const body = isDebt 
    ? `Vence cuota ${cuota} de ${name} el día ${date}. Monto: $${amount.toFixed(2)}.`
    : `Recuerda pagar ${name} antes del ${date}. Monto aproximado: $${amount.toFixed(2)}.`;

  return await scheduleNotification({
    title,
    body,
    trigger: {
      day: date - 3 > 0 ? date - 3 : 28,
      hour: 9,
      minute: 0,
      repeats: true,
    },
  });
}

/**
 * Domain specific: Schedule financial strategy
 * @param {'oro' | 'dia'} type 
 */
export async function scheduleFinancialStrategy(type) {
  const strategies = [
    "Divide tu salario el mismo día que lo recibes: separa comida, transporte, ahorros y emergencias.",
    "Autoriza un ahorro obligatorio del 10% de tu ingreso antes de gastar.",
    "Registra diariamente todo lo que gastas, sin excepción.",
    "Define un presupuesto fijo para comida, transporte y compras personales.",
    "Compra mañana lo que se te antoja hoy. Evita las compras impulsivas.",
    "Compra lo repetitivo al por mayor para reducir el gasto unitario.",
    "Elimina un pequeño gasto innecesario a la vez, poco a poco.",
    "Crea un fondo de emergencia equivalente a un sueldo completo.",
    "Si tu estilo de vida crece más rápido que tu salario, te empobrecerás.",
    "Invierte primero en conocimiento. Tu crecimiento personal impulsa tu dinero."
  ];

  const randomStrategy = strategies[Math.floor(Math.random() * strategies.length)];
  const title = type === 'oro' ? "💡 Estrategia de Oro" : "🎯 Estrategia del Día";

  return await scheduleNotification({
    title,
    body: randomStrategy,
    trigger: null,
  });
}
