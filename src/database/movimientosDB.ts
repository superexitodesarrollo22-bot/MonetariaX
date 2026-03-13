import { getDatabase } from './database';
import { Movimiento, TipoMovimiento, Categoria, CategoriaIngreso, Recurrencia } from '../types';

export const insertarMovimiento = async (
  tipo: TipoMovimiento,
  monto: number,
  categoria: Categoria | CategoriaIngreso,
  nota: string,
  fecha: string,
  recurrencia: Recurrencia = 'ninguna',
  fechaLimitePago?: string
): Promise<number> => {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO movimientos (tipo, monto, categoria, nota, fecha, recurrencia, fechaLimitePago, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    [tipo, monto, categoria, nota || '', fecha, recurrencia, fechaLimitePago || null]
  );
  return result.lastInsertRowId;
};

export const actualizarMovimiento = async (
  id: number,
  tipo: TipoMovimiento,
  monto: number,
  categoria: Categoria | CategoriaIngreso,
  nota: string,
  fecha: string,
  recurrencia: Recurrencia = 'ninguna',
  fechaLimitePago?: string
): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE movimientos 
     SET tipo = ?, monto = ?, categoria = ?, nota = ?, fecha = ?, recurrencia = ?, fechaLimitePago = ?
     WHERE id = ?`,
    [tipo, monto, categoria, nota || '', fecha, recurrencia, fechaLimitePago || null, id]
  );
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

export const eliminarMovimientosPorDeuda = async (nombreDeuda: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    `DELETE FROM movimientos WHERE categoria = 'deuda' AND nota LIKE ?`,
    [`% - ${nombreDeuda}`]
  );
};

export const eliminarMovimiento = async (id: number): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM movimientos WHERE id = ?`, [id]);
};



export const obtenerAnalisisHormiga = async (
  mes: number,
  anio: number
): Promise<{ total: number; cantidad: number }> => {
  const db = await getDatabase();
  const mesStr = String(mes).padStart(2, '0');
  const anioStr = String(anio);

  const mesAnt = mes === 1 ? 12 : mes - 1;
  const anioAnt = mes === 1 ? anio - 1 : anio;
  const mesAntStr = String(mesAnt).padStart(2, '0');
  const anioAntStr = String(anioAnt);

  // 1. Obtener gastos del mes anterior para detectar categorías nuevas
  const anterior = await db.getAllAsync<{ categoria: string }>(
    `SELECT DISTINCT categoria FROM movimientos 
     WHERE tipo = 'gasto' AND strftime('%m', fecha) = ? AND strftime('%Y', fecha) = ?`,
    [mesAntStr, anioAntStr]
  );
  const catsPrevias = new Set(anterior.map(r => r.categoria));

  // 2. Obtener todos los gastos del mes actual que sean menores a $10
  const actual = await db.getAllAsync<Movimiento>(
    `SELECT * FROM movimientos 
     WHERE tipo = 'gasto' AND monto < 10 AND strftime('%m', fecha) = ? AND strftime('%Y', fecha) = ?`,
    [mesStr, anioStr]
  );

  const hormigaCategories = ['comida', 'ocio', 'compras', 'transporte', 'otro'];

  // 3. Filtrar los que cumplen con la lógica de gasto hormiga
  const hormigaMovs = actual.filter(m => {
    const esCategoriaHormiga = hormigaCategories.includes(m.categoria);
    const esCategoriaNueva = !catsPrevias.has(m.categoria);
    return esCategoriaHormiga || esCategoriaNueva;
  });

  const total = hormigaMovs.reduce((acc, m) => acc + m.monto, 0);

  return { total, cantidad: hormigaMovs.length };
};
