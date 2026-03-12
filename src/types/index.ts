export type TipoMovimiento = 'ingreso' | 'gasto';

export type Categoria =
  | 'comida'
  | 'transporte'
  | 'negocio'
  | 'entretenimiento'
  | 'servicios'
  | 'salud'
  | 'educacion'
  | 'ahorro'
  | 'otro';

export interface Movimiento {
  id: number;
  tipo: TipoMovimiento;
  monto: number;
  categoria: Categoria;
  nota?: string;
  fecha: string; // ISO string
  createdAt: string;
}

export interface Deuda {
  id: number;
  nombre: string;
  montoTotal: number;
  interesMensual: number;
  cuotaMensual: number;
  fechaInicio: string;
  pagosRealizados: number;
  activa: boolean;
  createdAt: string;
}

export interface Presupuesto {
  id: number;
  categoria: Categoria;
  montoLimite: number;
  mes: number;
  anio: number;
}

export interface ConfigUsuario {
  nombre: string;
  moneda: string;
  onboardingCompletado: boolean;
  biometriaActiva: boolean;
}
