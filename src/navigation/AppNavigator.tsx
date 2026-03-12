import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';

import SplashScreen from '../screens/Auth/SplashScreen';
import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';
import BiometriaSetupScreen from '../screens/Auth/BiometriaSetupScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import TabNavigator from './TabNavigator';

import { useConfigStore } from '../store/configStore';
import { useAuthStore } from '../store/authStore';
import { useFinanzasStore } from '../store/finanzasStore';
import Theme from '../theme';

type AppState =
  | 'splash'
  | 'loading'
  | 'onboarding'
  | 'biometria_setup'
  | 'login'
  | 'app';

const AppNavigator: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('splash');
  const { cargarConfig, config } = useConfigStore();
  const { verificarBiometriaDisponible, autenticado } = useAuthStore();
  const { cargarTodo } = useFinanzasStore();

  const initApp = async () => {
    setAppState('loading');
    await cargarConfig();
    await verificarBiometriaDisponible();
    const cfg = useConfigStore.getState().config;

    if (!cfg.onboardingCompletado) {
      setAppState('onboarding');
    } else if (!cfg.biometriaActiva) {
      setAppState('biometria_setup');
    } else {
      setAppState('login');
    }
  };

  useEffect(() => {
    if (appState === 'app') {
      cargarTodo();
    }
  }, [appState]);

  if (appState === 'splash') {
    return <SplashScreen onFinish={initApp} />;
  }

  if (appState === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.background }}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  if (appState === 'onboarding') {
    return (
      <OnboardingScreen
        onFinish={() => setAppState('biometria_setup')}
      />
    );
  }

  if (appState === 'biometria_setup') {
    return (
      <BiometriaSetupScreen
        onFinish={() => {
          const cfg = useConfigStore.getState().config;
          setAppState(cfg.biometriaActiva ? 'login' : 'app');
        }}
      />
    );
  }

  if (appState === 'login') {
    return (
      <LoginScreen
        onSuccess={() => setAppState('app')}
      />
    );
  }

  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator;
