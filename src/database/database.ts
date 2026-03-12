import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('monetariax.db');
    await initDatabase(db);
  }
  return db;
};

const initDatabase = async (database: SQLite.SQLiteDatabase): Promise<void> => {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS movimientos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT NOT NULL CHECK(tipo IN ('ingreso','gasto')),
      monto REAL NOT NULL,
      categoria TEXT NOT NULL,
      nota TEXT,
      fecha TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS deudas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      montoTotal REAL NOT NULL,
      interesMensual REAL NOT NULL DEFAULT 0,
      cuotaMensual REAL NOT NULL,
      fechaInicio TEXT NOT NULL,
      pagosRealizados INTEGER NOT NULL DEFAULT 0,
      activa INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS presupuestos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      categoria TEXT NOT NULL,
      montoLimite REAL NOT NULL,
      mes INTEGER NOT NULL,
      anio INTEGER NOT NULL,
      UNIQUE(categoria, mes, anio)
    );

    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    INSERT OR IGNORE INTO config (key, value) VALUES
      ('nombre', 'Usuario'),
      ('moneda', '$'),
      ('onboardingCompletado', '0'),
      ('biometriaActiva', '0');
  `);
};
