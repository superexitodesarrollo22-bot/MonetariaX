import { getDatabase } from './database';
import { Deuda } from '../types';

export const insertarDeuda = async (
  nombre: string,
  montoTotal: number,
  interesMensual: number,
  cuotaMensual: number,
  fechaInicio: string,
  cuotaActual: number = 0,
  diaPagoMensual?: number
): Promise<number> => {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO deudas (nombre, montoTotal, interesMensual, cuotaMensual, fechaInicio, pagosRealizados, cuotaActual, diaPagoMensual, activa, createdAt)
     VALUES (?, ?, ?, ?, ?, 0, ?, ?, 1, datetime('now'))`,
    [nombre, montoTotal, interesMensual, cuotaMensual, fechaInicio, cuotaActual, diaPagoMensual || null]
  );
  return result.lastInsertRowId;
};

export const obtenerDeudas = async (): Promise<Deuda[]> => {
  const db = await getDatabase();
  return await db.getAllAsync<Deuda>(
    `SELECT * FROM deudas WHERE activa = 1 ORDER BY createdAt DESC`
  );
};

export const registrarPagoDeuda = async (id: number): Promise<void> => {
  const db = await getDatabase();
  const deuda = await db.getFirstAsync<Deuda>(
    `SELECT * FROM deudas WHERE id = ?`, [id]
  );
  if (!deuda) return;
  const totalCuotas = calcularTotalCuotas(
    deuda.montoTotal, deuda.interesMensual, deuda.cuotaMensual
  );
  const nuevosPagos = deuda.pagosRealizados + 1;
  const activa = nuevosPagos < totalCuotas ? 1 : 0;
  await db.runAsync(
    `UPDATE deudas SET pagosRealizados = ?, activa = ? WHERE id = ?`,
    [nuevosPagos, activa, id]
  );
};

export const eliminarDeuda = async (id: number): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(`UPDATE deudas SET activa = 0 WHERE id = ?`, [id]);
};

export const calcularTotalCuotas = (
  montoTotal: number,
  interesMensual: number,
  cuotaMensual: number
): number => {
  if (interesMensual === 0) {
    if (cuotaMensual <= 0) return 1;
    return Math.ceil(montoTotal / cuotaMensual);
  }
  const tasa = interesMensual / 100;
  const interesMinimo = montoTotal * tasa;
  // Si la cuota no cubre ni el interés, la deuda nunca se pagaría
  if (cuotaMensual <= interesMinimo) {
    return 9999; // valor seguro para evitar crash
  }
  const n = Math.log(cuotaMensual / (cuotaMensual - montoTotal * tasa)) / Math.log(1 + tasa);
  if (!isFinite(n) || isNaN(n) || n <= 0) return 9999;
  return Math.ceil(n);
};

export const calcularTotalIntereses = (
  montoTotal: number,
  interesMensual: number,
  cuotaMensual: number
): number => {
  const totalCuotas = calcularTotalCuotas(montoTotal, interesMensual, cuotaMensual);
  return (cuotaMensual * totalCuotas) - montoTotal;
};

export const calcularFechaFinalizacion = (
  fechaInicio: string,
  totalCuotas: number,
  pagosRealizados: number
): string => {
  const cuotasRestantes = Math.max(totalCuotas - pagosRealizados, 0);
  const fecha = new Date(fechaInicio);
  if (isNaN(fecha.getTime())) return new Date().toISOString();
  const mesesASumar = Math.min(cuotasRestantes, 1200); // máximo 100 años
  fecha.setMonth(fecha.getMonth() + mesesASumar);
  if (isNaN(fecha.getTime())) return new Date().toISOString();
  return fecha.toISOString();
};
