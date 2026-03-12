import { create } from 'zustand';
import { Movimiento, Deuda, Categoria, TipoMovimiento } from '../types';
import {
  insertarMovimiento,
  obtenerMovimientos,
  obtenerResumenMes,
  obtenerGastosPorCategoria,
  obtenerMovimientosPorMes,
  eliminarMovimiento,
  obtenerGastosHormiga,
} from '../database/movimientosDB';
import {
  insertarDeuda,
  obtenerDeudas,
  registrarPagoDeuda,
  eliminarDeuda,
} from '../database/deudasDB';
import { getCurrentMonth } from '../utils/formatters';

interface ResumenMes {
  totalIngresos: number;
  totalGastos: number;
  balance: number;
}

interface FinanzasState {
  movimientos: Movimiento[];
  deudas: Deuda[];
  resumenMes: ResumenMes;
  gastosPorCategoria: Array<{ categoria: string; total: number }>;
  gastosHormiga: Array<{
    categoria: string;
    totalMesActual: number;
    totalMesAnterior: number;
    diferencia: number;
  }>;
  cargando: boolean;
  mesActual: number;
  anioActual: number;

  cargarTodo: () => Promise<void>;
  cargarMovimientos: () => Promise<void>;
  cargarDeudas: () => Promise<void>;
  cargarResumen: () => Promise<void>;
  cargarGastosHormiga: () => Promise<void>;

  agregarMovimiento: (
    tipo: TipoMovimiento,
    monto: number,
    categoria: Categoria,
    nota: string,
    fecha: string
  ) => Promise<void>;

  borrarMovimiento: (id: number) => Promise<void>;

  agregarDeuda: (
    nombre: string,
    montoTotal: number,
    interesMensual: number,
    cuotaMensual: number,
    fechaInicio: string
  ) => Promise<void>;

  pagarCuotaDeuda: (id: number) => Promise<void>;
  borrarDeuda: (id: number) => Promise<void>;
}

export const useFinanzasStore = create<FinanzasState>((set, get) => {
  const { mes, anio } = getCurrentMonth();
  return {
    movimientos: [],
    deudas: [],
    resumenMes: { totalIngresos: 0, totalGastos: 0, balance: 0 },
    gastosPorCategoria: [],
    gastosHormiga: [],
    cargando: false,
    mesActual: mes,
    anioActual: anio,

    cargarTodo: async () => {
      set({ cargando: true });
      await Promise.all([
        get().cargarMovimientos(),
        get().cargarDeudas(),
        get().cargarResumen(),
        get().cargarGastosHormiga(),
      ]);
      set({ cargando: false });
    },

    cargarMovimientos: async () => {
      const { mesActual, anioActual } = get();
      const data = await obtenerMovimientosPorMes(mesActual, anioActual);
      const catData = await obtenerGastosPorCategoria(mesActual, anioActual);
      set({ movimientos: data, gastosPorCategoria: catData });
    },

    cargarDeudas: async () => {
      const data = await obtenerDeudas();
      set({ deudas: data });
    },

    cargarResumen: async () => {
      const { mesActual, anioActual } = get();
      const resumen = await obtenerResumenMes(mesActual, anioActual);
      set({ resumenMes: resumen });
    },

    cargarGastosHormiga: async () => {
      const data = await obtenerGastosHormiga();
      set({ gastosHormiga: data });
    },

    agregarMovimiento: async (tipo, monto, categoria, nota, fecha) => {
      await insertarMovimiento(tipo, monto, categoria, nota, fecha);
      await get().cargarTodo();
    },

    borrarMovimiento: async (id) => {
      await eliminarMovimiento(id);
      await get().cargarTodo();
    },

    agregarDeuda: async (nombre, montoTotal, interesMensual, cuotaMensual, fechaInicio) => {
      await insertarDeuda(nombre, montoTotal, interesMensual, cuotaMensual, fechaInicio);
      await get().cargarDeudas();
    },

    pagarCuotaDeuda: async (id) => {
      await registrarPagoDeuda(id);
      await get().cargarDeudas();
    },

    borrarDeuda: async (id) => {
      await eliminarDeuda(id);
      await get().cargarDeudas();
    },
  };
});
