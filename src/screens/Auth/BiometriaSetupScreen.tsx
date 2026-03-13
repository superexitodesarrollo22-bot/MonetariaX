import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Theme from '../../theme';
import Button from '../../components/common/Button';
import { useAuthStore } from '../../store/authStore';
import { useConfigStore } from '../../store/configStore';
import Input from '../../components/common/Input';

interface BiometriaSetupProps {
  onFinish: () => void;
}

const BiometriaSetupScreen: React.FC<BiometriaSetupProps> = ({ onFinish }) => {
  const { biometriaDisponible, activarBiometria } = useAuthStore();
  const { actualizarNombre, actualizarPin, config } = useConfigStore();
  const [nombre, setNombre] = React.useState('');
  const [pin, setPin] = React.useState('');

  const nombreRef = useRef<TextInput>(null);
  const pinRef = useRef<TextInput>(null);


  const handleActivar = async () => {
    if (!nombre.trim()) { Alert.alert('Error', 'Por favor ingresa tu nombre'); return; }
    await actualizarNombre(nombre.trim());
    if (biometriaDisponible) {
      await activarBiometria();
    }
    onFinish();
  };

  const handleGuardarConPin = async () => {
    if (!nombre.trim()) { Alert.alert('Error', 'Por favor ingresa tu nombre'); return; }
    if (pin.length !== 4) { Alert.alert('Error', 'El PIN debe ser de 4 dígitos'); return; }
    await actualizarNombre(nombre.trim());
    await actualizarPin(pin);
    onFinish();
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons
          name={biometriaDisponible ? "fingerprint" : "shield-lock-outline"}
          size={80}
          color={Theme.colors.primary}
        />
      </View>

      <Text style={styles.title}>
        {biometriaDisponible ? 'Protege tu cuenta' : 'Configura tu PIN'}
      </Text>
      <Text style={styles.subtitle}>
        Para asegurar tus finanzas, necesitamos que configures el acceso a la app.
      </Text>

      <View style={styles.form}>
        <Input
          ref={nombreRef}
          label="¿Cómo te llamas?"
          placeholder="Tu nombre"
          value={nombre}
          onChangeText={setNombre}
          leftIcon="account-outline"
          autoCapitalize="words"
          returnKeyType={biometriaDisponible && pin.length === 0 ? "done" : "next"}
          blurOnSubmit={biometriaDisponible && pin.length === 0}
          onSubmitEditing={() => {
            if (biometriaDisponible && pin.length === 0) {
              handleActivar();
            } else {
              pinRef.current?.focus();
            }
          }}
        />


        {!biometriaDisponible || pin.length > 0 ? (
          <Input
            ref={pinRef}
            label="PIN de seguridad (4 dígitos)"
            placeholder="0000"
            value={pin}
            onChangeText={v => setPin(v.replace(/[^0-9]/g, '').slice(0, 4))}
            keyboardType="number-pad"
            secureTextEntry
            leftIcon="lock-outline"
            returnKeyType="done"
            onSubmitEditing={handleGuardarConPin}
          />

        ) : null}

        {biometriaDisponible && pin.length === 0 && (
          <View style={styles.biometriaInfo}>
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={20}
              color={Theme.colors.secondary}
            />
            <Text style={styles.biometriaText}>
              Puedes entrar usando tu huella dactilar de forma rápida y segura.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        {biometriaDisponible && pin.length === 0 ? (
          <>
            <Button
              label="Usar huella dactilar"
              onPress={handleActivar}
              variant="primary"
              size="lg"
              fullWidth
            />
            <TouchableOpacity onPress={() => setPin(' ')} style={styles.skipBtn}>
              <Text style={styles.skipText}>Prefiero usar un PIN</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Button
            label="¡Comenzar!"
            onPress={handleGuardarConPin}
            variant="primary"
            size="lg"
            fullWidth
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    padding: Theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E8EDFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.xl,
  },
  title: {
    fontSize: Theme.typography.fontSize.xxl,
    fontWeight: Theme.typography.fontWeight.extrabold,
    color: Theme.colors.text,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
  },
  subtitle: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Theme.spacing.xl,
  },
  form: { width: '100%', marginBottom: Theme.spacing.lg },
  biometriaInfo: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.successLight,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    alignItems: 'flex-start',
    gap: 10,
  },
  biometriaText: {
    flex: 1,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.secondary,
    lineHeight: 20,
  },
  actions: { width: '100%' },
  skipBtn: { alignItems: 'center', marginTop: Theme.spacing.md, padding: Theme.spacing.sm },
  skipText: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.textLight,
    textDecorationLine: 'underline',
  },
});

export default BiometriaSetupScreen;
