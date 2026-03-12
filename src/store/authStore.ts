import { create } from 'zustand';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { obtenerConfig, actualizarConfig } from '../database/configDB';

interface AuthState {
  autenticado: boolean;
  biometriaDisponible: boolean;
  biometriaActiva: boolean;
  cargando: boolean;
  error: string | null;
  verificarBiometriaDisponible: () => Promise<void>;
  autenticar: () => Promise<boolean>;
  activarBiometria: () => Promise<void>;
  cerrarSesion: () => void;
  setAutenticado: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  autenticado: false,
  biometriaDisponible: false,
  biometriaActiva: false,
  cargando: false,
  error: null,

  verificarBiometriaDisponible: async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    const config = await obtenerConfig();
    set({
      biometriaDisponible: compatible && enrolled,
      biometriaActiva: config.biometriaActiva,
    });
  },

  autenticar: async () => {
    const { biometriaDisponible, biometriaActiva } = get();
    if (!biometriaDisponible || !biometriaActiva) {
      set({ autenticado: true });
      return true;
    }
    set({ cargando: true, error: null });
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Usa tu huella dactilar para ingresar a MonetariaX',
        fallbackLabel: 'Usar PIN',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
      });
      if (result.success) {
        set({ autenticado: true, cargando: false });
        return true;
      } else {
        set({ error: 'Autenticación fallida', cargando: false });
        return false;
      }
    } catch (e) {
      set({ error: 'Error al autenticar', cargando: false });
      return false;
    }
  },

  activarBiometria: async () => {
    await actualizarConfig('biometriaActiva', '1');
    set({ biometriaActiva: true });
  },

  cerrarSesion: () => set({ autenticado: false }),

  setAutenticado: (val: boolean) => set({ autenticado: val }),
}));
