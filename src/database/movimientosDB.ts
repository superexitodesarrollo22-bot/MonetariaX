import { getDatabase } from './database';
import { Movimiento, TipoMovimiento, Categoria, CategoriaIngreso } from '../types';

export const insertarMovimiento = async (
  tipo: TipoMovimiento,
  monto: number,
  categoria: Categoria | CategoriaIngreso,
  nota: string,
  fecha: string
): Promise<number> => {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO movimientos (tipo, monto, categoria, nota, fecha, createdAt)
     VALUES (?, ?, ?, ?, ?, datetime('now'))`,
    [tipo, monto, categoria, nota || '', fecha]
  );
  return result.lastInsertRowId;
};

export const obtenerMovimientos = async (limite = 50): Promise<Movimiento[]> => {
  const db = await getDatabase();
  return await db.getAllAsync<Movimiento>(
    `SELECT * FROM movimientos ORDER BY fecha DESC, createdAt DESC LIMIT ?`,
    [limite]
  );
};

export const obtenerMovimientosPorMes = async (
  mes: number,
  anio: number
): Promise<Movimiento[]> => {
  const db = await getDatabase();
  const mesStr = String(mes).padStart(2, '0');
  return await db.getAllAsync<Movimiento>(
    `SELECT * FROM movimientos
     WHERE strftime('%m', fecha) = ? AND strftime('%Y', fecha) = ?
     ORDER BY fecha DESC`,
    [mesStr, String(anio)]
  );
};

export const obtenerResumenMes = async (
  mes: number,
  anio: number
): Promise<{ totalIngresos: number; totalGastos: number; balance: number }> => {
  const db = await getDatabase();
  const mesStr = String(mes).padStart(2, '0');
  const rows = await db.getAllAsync<{ tipo: string; total: number }>(
    `SELECT tipo, SUM(monto) as total FROM movimientos
     WHERE strftime('%m', fecha) = ? AND strftime('%Y', fecha) = ?
     GROUP BY tipo`,
    [mesStr, String(anio)]
  );
  let totalIngresos = 0;
  let totalGastos = 0;
  rows.forEach(r => {
    if (r.tipo === 'ingreso') totalIngresos = r.total;
    else totalGastos = r.total;
  });
  return { totalIngresos, totalGastos, balance: totalIngresos - totalGastos };
};

export const obtenerGastosPorCategoria = async (
  mes: number,
  anio: number
): Promise<Array<{ categoria: string; total: number }>> => {
  const db = await getDatabase();
  const mesStr = String(mes).padStart(2, '0');
  return await db.getAllAsync<{ categoria: string; total: number }>(
    `SELECT categoria, SUM(monto) as total FROM movimientos
     WHERE tipo = 'gasto'
       AND strftime('%m', fecha) = ?
       AND strftime('%Y', fecha) = ?
     GROUP BY categoria
     ORDER BY total DESC`,
    [mesStr, String(anio)]
  );
};

export const eliminarMovimiento = async (id: number): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM movimientos WHERE id = ?`, [id]);
};

export const obtenerGastosHormiga = async (): Promise<
  Array<{ categoria: string; totalMesActual: number; totalMesAnterior: number; diferencia: number }>
> => {
  const db = await getDatabase();
  const ahora = new Date();
  const mesActual = String(ahora.getMonth() + 1).padStart(2, '0');
  const anioActual = String(ahora.getFullYear());
  const fechaAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
  const mesAnterior = String(fechaAnterior.getMonth() + 1).padStart(2, '0');
  const anioAnterior = String(fechaAnterior.getFullYear());

  const actual = await db.getAllAsync<{ categoria: string; total: number }>(
    `SELECT categoria, SUM(monto) as total FROM movimientos
     WHERE tipo='gasto' AND strftime('%m',fecha)=? AND strftime('%Y',fecha)=?
     GROUP BY categoria`,
    [mesActual, anioActual]
  );
  const anterior = await db.getAllAsync<{ categoria: string; total: number }>(
    `SELECT categoria, SUM(monto) as total FROM movimientos
     WHERE tipo='gasto' AND strftime('%m',fecha)=? AND strftime('%Y',fecha)=?
     GROUP BY categoria`,
    [mesAnterior, anioAnterior]
  );

  const anteriorMap: Record<string, number> = {};
  anterior.forEach(r => { anteriorMap[r.categoria] = r.total; });

  return actual
    .map(r => ({
      categoria: r.categoria,
      totalMesActual: r.total,
      totalMesAnterior: anteriorMap[r.categoria] || 0,
      diferencia: r.total - (anteriorMap[r.categoria] || 0),
    }))
    .filter(r => r.diferencia > 0)
    .sort((a, b) => b.diferencia - a.diferencia);
};
