import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
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
  const { actualizarNombre, config } = useConfigStore();
  const [nombre, setNombre] = React.useState('');

  const handleActivar = async () => {
    if (nombre.trim()) await actualizarNombre(nombre.trim());
    if (biometriaDisponible) await activarBiometria();
    onFinish();
  };

  const handleOmitir = async () => {
    if (nombre.trim()) await actualizarNombre(nombre.trim());
    onFinish();
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons
          name="fingerprint"
          size={80}
          color={Theme.colors.primary}
        />
      </View>

      <Text style={styles.title}>Personaliza tu app</Text>
      <Text style={styles.subtitle}>
        Antes de empezar, dinos tu nombre y si quieres proteger la app con tu huella dactilar.
      </Text>

      <View style={styles.form}>
        <Input
          label="¿Cómo te llamas?"
          placeholder="Tu nombre"
          value={nombre}
          onChangeText={setNombre}
          leftIcon="account-outline"
          autoCapitalize="words"
        />

        {biometriaDisponible && (
          <View style={styles.biometriaInfo}>
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={20}
              color={Theme.colors.secondary}
            />
            <Text style={styles.biometriaText}>
              Tu dispositivo tiene huella dactilar disponible.
              Actívala para proteger tus datos financieros.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        {biometriaDisponible ? (
          <>
            <Button
              label="Activar huella dactilar"
              onPress={handleActivar}
              variant="primary"
              size="lg"
              fullWidth
            />
            <TouchableOpacity onPress={handleOmitir} style={styles.skipBtn}>
              <Text style={styles.skipText}>Continuar sin huella</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Button
            label="¡Comenzar!"
            onPress={handleOmitir}
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
