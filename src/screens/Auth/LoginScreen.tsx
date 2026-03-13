import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions, Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import Theme from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useConfigStore } from '../../store/configStore';

import PinPad from '../../components/common/PinPad';

const { height } = Dimensions.get('window');

interface LoginScreenProps {
  onSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess }) => {
  const {
    autenticar, biometriaDisponible, biometriaActiva,
    cargando, error, setAutenticado,
  } = useAuthStore();
  const { config } = useConfigStore();
  
  const [showPin, setShowPin] = React.useState(!biometriaActiva || !biometriaDisponible);
  const [pinError, setPinError] = React.useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1, duration: 600, useNativeDriver: true,
    }).start();

    if (biometriaDisponible && biometriaActiva && !showPin) {
      setTimeout(() => handleAuth(), 500);
    }
  }, [biometriaDisponible, biometriaActiva, showPin]);

  const pulseBtnAnim = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 0.92, duration: 100, useNativeDriver: true }),
      Animated.spring(pulseAnim, { toValue: 1, tension: 80, friction: 5, useNativeDriver: true }),
    ]).start();
  };

  const handleAuth = async () => {
    if (biometriaDisponible && biometriaActiva) {
      const success = await autenticar();
      if (success) {
        onSuccess();
      } else {
        // Fallback to PIN if biometric fails
        if (config.pin) setShowPin(true);
      }
    } else if (config.pin) {
      setShowPin(true);
    } else {
      // No security set? (shouldn't happen with new logic)
      setAutenticado(true);
      onSuccess();
    }
  };

  const onPinComplete = (enteredPin: string) => {
    if (enteredPin === config.pin) {
      setAutenticado(true);
      onSuccess();
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 1000);
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: opacityAnim }]}>
      <View style={styles.header}>
        <View style={styles.logoBox}>
          <MaterialCommunityIcons name="cash-fast" size={40} color={Theme.colors.secondary} />
        </View>
        <Text style={styles.appName}>MonetariaX</Text>
        <Text style={styles.greeting}>Hola, {config.nombre} 👋</Text>
      </View>

      <View style={styles.body}>
        {!showPin ? (
          <>
            <TouchableOpacity
              onPress={() => {
                pulseBtnAnim();
                handleAuth();
              }}
              disabled={cargando}
              activeOpacity={0.85}
            >
              <Animated.View style={[
                styles.fingerprintBtn,
                { transform: [{ scale: pulseAnim }] },
                cargando && styles.fingerprintBtnLoading,
              ]}>
                <MaterialCommunityIcons
                  name="fingerprint"
                  size={64}
                  color={cargando ? Theme.colors.textLight : Theme.colors.primary}
                />
              </Animated.View>
            </TouchableOpacity>
            <Text style={styles.instruction}>Toca para usar biometría</Text>
            {config.pin && (
              <TouchableOpacity onPress={() => setShowPin(true)} style={styles.altBtn}>
                <Text style={styles.altBtnText}>Usar PIN de seguridad</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={{ width: '100%', alignItems: 'center' }}>
            <Text style={styles.instruction}>Ingresa tu PIN de 4 dígitos</Text>
            <View style={{ height: 20 }} />
            <PinPad onComplete={onPinComplete} error={pinError} />
            {biometriaDisponible && biometriaActiva && (
              <TouchableOpacity onPress={() => setShowPin(false)} style={styles.altBtn}>
                <Text style={styles.altBtnText}>Regresar a biometría</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {(error || pinError) && (
          <View style={styles.errorWrap}>
            <MaterialCommunityIcons name="alert-circle-outline" size={16} color={Theme.colors.danger} />
            <Text style={styles.errorText}>{pinError ? 'PIN incorrecto' : error}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.secureRow}>
          <MaterialCommunityIcons name="shield-check-outline" size={14} color={Theme.colors.secondary} />
          <Text style={styles.secureText}>Acceso seguro y privado</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: Theme.spacing.xl,
  },
  header: { alignItems: 'center' },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.md,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: Theme.colors.primary,
    letterSpacing: 0.5,
  },
  greeting: {
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.textLight,
    marginTop: Theme.spacing.xs,
  },
  body: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  fingerprintBtn: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Theme.colors.border,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  fingerprintBtnLoading: {
    borderColor: Theme.colors.secondary,
    backgroundColor: Theme.colors.successLight,
  },
  instruction: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.textLight,
    marginTop: Theme.spacing.lg,
    textAlign: 'center',
  },
  errorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.md,
    backgroundColor: Theme.colors.dangerLight,
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
  },
  errorText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.danger,
    marginLeft: 6,
  },
  altBtn: {
    marginTop: Theme.spacing.xl,
    padding: Theme.spacing.sm,
  },
  altBtnText: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.primary,
    fontWeight: Theme.typography.fontWeight.medium,
    textDecorationLine: 'underline',
  },
  footer: { alignItems: 'center' },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  secureText: {
    fontSize: 12,
    color: Theme.colors.textLight,
    marginLeft: 4,
  },
});

export default LoginScreen;
