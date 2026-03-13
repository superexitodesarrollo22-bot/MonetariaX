import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const registerForPushNotificationsAsync = async () => {
  if (!Device.isDevice) return false;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return false;

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  return true;
};

export const scheduleFinancialStrategy = async (type: 'oro' | 'dia') => {
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

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body: randomStrategy,
    },
    trigger: null, // Send now for testing, but we'll schedule properly
  });
};

export const schedulePaymentAlert = async (name: string, date: number, amount: number, isDebt: boolean = false, cuota?: number) => {
  const title = isDebt ? "💳 Vencimiento de Cuota" : "📅 Recordatorio de Pago";
  const body = isDebt 
    ? `Vence cuota ${cuota} de ${name} el día ${date}. Monto: $${amount.toFixed(2)}.`
    : `Recuerda pagar ${name} antes del ${date}. Monto aproximado: $${amount.toFixed(2)}.`;

  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: {
      day: date - 3 > 0 ? date - 3 : 28, // Simplified logic for day
      hour: 9,
      minute: 0,
      repeats: true,
    } as any,
  });
};
