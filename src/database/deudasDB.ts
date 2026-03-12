import { getDatabase } from './database';
import { Deuda } from '../types';

export const insertarDeuda = async (
  nombre: string,
  montoTotal: number,
  interesMensual: number,
  cuotaMensual: number,
  fechaInicio: string
): Promise<number> => {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO deudas (nombre, montoTotal, interesMensual, cuotaMensual, fechaInicio, pagosRealizados, activa, createdAt)
     VALUES (?, ?, ?, ?, ?, 0, 1, datetime('now'))`,
    [nombre, montoTotal, interesMensual, cuotaMensual, fechaInicio]
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
  if (interesMensual === 0) return Math.ceil(montoTotal / cuotaMensual);
  const tasa = interesMensual / 100;
  const n = Math.log(cuotaMensual / (cuotaMensual - montoTotal * tasa)) / Math.log(1 + tasa);
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
  const cuotasRestantes = totalCuotas - pagosRealizados;
  const fecha = new Date(fechaInicio);
  fecha.setMonth(fecha.getMonth() + cuotasRestantes);
  return fecha.toISOString();
};
