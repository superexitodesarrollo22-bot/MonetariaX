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
  obtenerAnalisisHormiga,
  eliminarMovimientosPorDeuda,
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
  gastosHormiga: {
    total: number;
    cantidad: number;
  };
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
    fechaFinalizacion: string,
    totalCuotas: number,
    cuotaActual: number,
    diaPagoMensual?: number
  ) => Promise<void>;

  pagarCuotaDeuda: (id: number, numCuotas?: number) => Promise<any>;

  borrarDeuda: (id: number, nombre?: string, borrarMovimientos?: boolean) => Promise<void>;

}

export const useFinanzasStore = create<FinanzasState>((set, get) => {
  const { mes, anio } = getCurrentMonth();
  return {
    movimientos: [],
    deudas: [],
    resumenMes: { totalIngresos: 0, totalGastos: 0, balance: 0 },
    gastosPorCategoria: [],
    gastosHormiga: { total: 0, cantidad: 0 },
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
      const { mesActual, anioActual } = get();
      const data = await obtenerAnalisisHormiga(mesActual, anioActual);
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

    agregarDeuda: async (nombre, montoTotal, interesMensual, cuotaMensual, fechaInicio, fechaFinalizacion, totalCuotas, cuotaActual, diaPago) => {
      console.log('[STORE] agregarDeuda iniciando persistencia...');
      try {
        await insertarDeuda(nombre, montoTotal, interesMensual, cuotaMensual, fechaInicio, fechaFinalizacion, totalCuotas, cuotaActual, diaPago);
        console.log('[STORE] agregarDeuda base de datos OK');
        await get().cargarDeudas();
        console.log('[STORE] agregarDeuda lista actualizada');
      } catch (err: any) {
        console.log('[STORE] Error en agregarDeuda:', err.message, err);
        throw err;
      }
    },



    pagarCuotaDeuda: async (id: number, numCuotas: number = 1): Promise<{ terminada: boolean; nombre: string } | null> => {
      const result = await registrarPagoDeuda(id, numCuotas);
      if (!result) return null;
      
      const { deuda, terminada } = result;
      
      // Registro automático como movimiento de gasto para CADA cuota
      // La cuotas pagadas en esta operación van desde (deuda.cuotaActual - numCuotas + 1) hasta deuda.cuotaActual
      for (let i = 0; i < numCuotas; i++) {
        const numCuota = deuda.cuotaActual - numCuotas + 1 + i;
        await insertarMovimiento(
          'gasto',
          deuda.cuotaMensual,
          'deuda',
          `Cuota ${numCuota} - ${deuda.nombre}`,
          new Date().toISOString().split('T')[0]
        );
      }
      
      await get().cargarTodo();
      return { terminada, nombre: deuda.nombre };
    },



    borrarDeuda: async (id: number, nombre?: string, borrarMovimientos: boolean = false) => {
      await eliminarDeuda(id);
      if (borrarMovimientos && nombre) {
        await eliminarMovimientosPorDeuda(nombre);
      }
      await get().cargarTodo();
    },

  };
});
