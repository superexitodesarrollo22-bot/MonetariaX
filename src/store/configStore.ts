import { create } from 'zustand';
import { ConfigUsuario } from '../types';
import { obtenerConfig, actualizarConfig } from '../database/configDB';

interface ConfigState {
  config: ConfigUsuario;
  cargando: boolean;
  cargarConfig: () => Promise<void>;
  actualizarNombre: (nombre: string) => Promise<void>;
  marcarOnboardingCompletado: () => Promise<void>;
}

export const useConfigStore = create<ConfigState>((set) => ({
  config: {
    nombre: 'Usuario',
    moneda: '$',
    onboardingCompletado: false,
    biometriaActiva: false,
  },
  cargando: false,

  cargarConfig: async () => {
    set({ cargando: true });
    const config = await obtenerConfig();
    set({ config, cargando: false });
  },

  actualizarNombre: async (nombre: string) => {
    await actualizarConfig('nombre', nombre);
    set(state => ({ config: { ...state.config, nombre } }));
  },

  marcarOnboardingCompletado: async () => {
    await actualizarConfig('onboardingCompletado', '1');
    set(state => ({
      config: { ...state.config, onboardingCompletado: true },
    }));
  },
}));
