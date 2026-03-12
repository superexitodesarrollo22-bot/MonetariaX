import { getDatabase } from './database';
import { ConfigUsuario } from '../types';

export const obtenerConfig = async (): Promise<ConfigUsuario> => {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ key: string; value: string }>(
    `SELECT key, value FROM config`
  );
  const map: Record<string, string> = {};
  rows.forEach(r => { map[r.key] = r.value; });
  return {
    nombre: map['nombre'] || 'Usuario',
    moneda: map['moneda'] || '$',
    onboardingCompletado: map['onboardingCompletado'] === '1',
    biometriaActiva: map['biometriaActiva'] === '1',
  };
};

export const actualizarConfig = async (key: string, value: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)`,
    [key, value]
  );
};
