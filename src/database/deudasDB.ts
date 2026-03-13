import { getDatabase } from './database';
import { Deuda } from '../types';

export const insertarDeuda = async (
  nombre: string,
  montoTotal: number,
  interesMensual: number,
  cuotaMensual: number,
  fechaInicio: string,
  fechaFinalizacion: string,
  totalCuotas: number,
  cuotaActual: number = 0,
  diaPagoMensual?: number
): Promise<number> => {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO deudas (nombre, montoTotal, interesMensual, cuotaMensual, fechaInicio, fechaFinalizacion, totalCuotas, pagosRealizados, cuotaActual, diaPagoMensual, activa, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 1, datetime('now'))`,
    [nombre, montoTotal, interesMensual, cuotaMensual, fechaInicio, fechaFinalizacion, totalCuotas, cuotaActual, diaPagoMensual || null]
  );
  return result.lastInsertRowId;
};


export const obtenerDeudas = async (): Promise<Deuda[]> => {
  const db = await getDatabase();
  return await db.getAllAsync<Deuda>(
    `SELECT * FROM deudas WHERE activa = 1 ORDER BY createdAt DESC`
  );
};

export const registrarPagoDeuda = async (id: number, numCuotas: number = 1): Promise<{ deuda: Deuda; terminada: boolean } | null> => {
  const db = await getDatabase();
  const deuda = await db.getFirstAsync<Deuda>(
    `SELECT * FROM deudas WHERE id = ?`, [id]
  );
  if (!deuda) return null;
  
  const nuevosPagosRealizados = deuda.pagosRealizados + numCuotas;
  const nuevaCuotaActual = deuda.cuotaActual + numCuotas;
  const terminada = nuevaCuotaActual >= deuda.totalCuotas;
  const activa = terminada ? 0 : 1;

  await db.runAsync(
    `UPDATE deudas SET pagosRealizados = ?, cuotaActual = ?, activa = ? WHERE id = ?`,
    [nuevosPagosRealizados, nuevaCuotaActual, activa, id]
  );
  
  const deudaActualizada = { 
    ...deuda, 
    pagosRealizados: nuevosPagosRealizados,
    cuotaActual: nuevaCuotaActual,
    activa: activa === 1 
  };
  return {
    deuda: deudaActualizada,
    terminada: terminada && Boolean(deuda.activa) === true
  };
};

export const eliminarDeuda = async (id: number): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(`UPDATE deudas SET activa = 0 WHERE id = ?`, [id]);
};

export const diffInMonths = (date1: Date, date2: Date): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  let months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth();
  months += d2.getMonth();
  return months <= 0 ? 0 : months;
};

