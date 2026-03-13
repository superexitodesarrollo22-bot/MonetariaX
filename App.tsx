import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { registerForPushNotificationsAsync } from './notifications.service';
import { processRecurringMovements } from './src/utils/recurringMovs';
import { useFinanzasStore } from './src/store/finanzasStore';

export default function App() {
  const cargarTodo = useFinanzasStore(state => state.cargarTodo);

  useEffect(() => {
    const init = async () => {
      await registerForPushNotificationsAsync();
      await processRecurringMovements();
      await cargarTodo();
    };
    init();
  }, [cargarTodo]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" backgroundColor="#F0F4FF" />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
