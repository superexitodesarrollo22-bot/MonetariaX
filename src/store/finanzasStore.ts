import { create } from 'zustand';
import { Movimiento, Deuda, Categoria, TipoMovimiento, CategoriaIngreso, Recurrencia } from '../types';
import {
  insertarMovimiento,
  actualizarMovimiento,
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
    categoria: Categoria | CategoriaIngreso,
    nota: string,
    fecha: string,
    recurrencia?: Recurrencia,
    fechaLimitePago?: string
  ) => Promise<void>;

  actualizarMovimiento: (
    id: number,
    tipo: TipoMovimiento,
    monto: number,
    categoria: Categoria | CategoriaIngreso,
    nota: string,
    fecha: string,
    recurrencia?: Recurrencia,
    fechaLimitePago?: string
  ) => Promise<void>;

  borrarMovimiento: (id: number) => Promise<void>;

  agregarDeuda: (
    nombre: string,
    montoTotal: number,
    interesMensual: number,
    cuotaMensual: number,
    fechaInicio: string,
    cuotaActual?: number,
    diaPagoMensual?: number
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

    agregarMovimiento: async (tipo: TipoMovimiento, monto: number, categoria: Categoria | CategoriaIngreso, nota: string, fecha: string, recurrencia?: Recurrencia, fechaLimite?: string) => {
      await insertarMovimiento(tipo, monto, categoria, nota, fecha, recurrencia, fechaLimite);
      await get().cargarTodo();
    },

    actualizarMovimiento: async (id: number, tipo: TipoMovimiento, monto: number, categoria: Categoria | CategoriaIngreso, nota: string, fecha: string, recurrencia?: Recurrencia, fechaLimite?: string) => {
      await actualizarMovimiento(id, tipo, monto, categoria, nota, fecha, recurrencia, fechaLimite);
      await get().cargarTodo();
    },

    borrarMovimiento: async (id: number) => {
      await eliminarMovimiento(id);
      await get().cargarTodo();
    },

    agregarDeuda: async (nombre: string, montoTotal: number, interesMensual: number, cuotaMensual: number, fechaInicio: string, cuotaActual?: number, diaPago?: number) => {
      await insertarDeuda(nombre, montoTotal, interesMensual, cuotaMensual, fechaInicio, cuotaActual, diaPago);
      await get().cargarDeudas();
    },

    pagarCuotaDeuda: async (id: number) => {
      await registrarPagoDeuda(id);
      await get().cargarDeudas();
    },

    borrarDeuda: async (id: number) => {
      await eliminarDeuda(id);
      await get().cargarDeudas();
    },
  };
});
