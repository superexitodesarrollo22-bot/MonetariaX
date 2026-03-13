export type TipoMovimiento = 'ingreso' | 'gasto';

export type Recurrencia = 'ninguna' | 'semanal' | 'quincenal' | 'mensual' | 'anual';

export type CategoriaIngreso =
  | 'sueldo'
  | 'ventas'
  | 'cobro'
  | 'freelance'
  | 'negocio'
  | 'regalo'
  | 'otro';

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
  categoria: Categoria | CategoriaIngreso | string;
  nota?: string;
  fecha: string; // ISO string
  recurrencia?: Recurrencia;
  fechaLimitePago?: string; // Solo para gastos recurrentes
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
  cuotaActual: number; // Nueva: 3 de 12
  diaPagoMensual?: number; // Nueva: Día del mes (1-31)
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
  notificacionesActivas: boolean;
  pin?: string; // PIN de 4 dígitos
}

