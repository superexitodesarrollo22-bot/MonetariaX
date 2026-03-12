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

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1, duration: 600, useNativeDriver: true,
    }).start();

    if (biometriaDisponible && biometriaActiva) {
      setTimeout(() => handleAuth(), 500);
    }
  }, []);

  const pulseBtnAnim = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 0.92, duration: 100, useNativeDriver: true }),
      Animated.spring(pulseAnim, { toValue: 1, tension: 80, friction: 5, useNativeDriver: true }),
    ]).start();
  };

  const handleAuth = async () => {
    pulseBtnAnim();
    if (!biometriaDisponible || !biometriaActiva) {
      setAutenticado(true);
      onSuccess();
      return;
    }
    const success = await autenticar();
    if (success) onSuccess();
  };

  const getBiometriaIcon = () => {
    return 'fingerprint';
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
        <TouchableOpacity
          onPress={handleAuth}
          disabled={cargando}
          activeOpacity={0.85}
        >
          <Animated.View style={[
            styles.fingerprintBtn,
            { transform: [{ scale: pulseAnim }] },
            cargando && styles.fingerprintBtnLoading,
          ]}>
            <MaterialCommunityIcons
              name={getBiometriaIcon() as any}
              size={64}
              color={cargando ? Theme.colors.textLight : Theme.colors.primary}
            />
          </Animated.View>
        </TouchableOpacity>

        <Text style={styles.instruction}>
          {biometriaDisponible && biometriaActiva
            ? 'Toca para usar tu huella dactilar'
            : 'Toca para ingresar'}
        </Text>

        {error && (
          <View style={styles.errorWrap}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={16}
              color={Theme.colors.danger}
            />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {(!biometriaDisponible || !biometriaActiva) && (
          <TouchableOpacity onPress={handleAuth} style={styles.altBtn}>
            <Text style={styles.altBtnText}>Ingresar sin biometría</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.secureRow}>
          <MaterialCommunityIcons
            name="shield-check-outline"
            size={14}
            color={Theme.colors.secondary}
          />
          <Text style={styles.secureText}>Datos guardados solo en tu dispositivo</Text>
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
