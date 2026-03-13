import { Categoria, CategoriaIngreso } from '../types';

export interface IconConfig {
  name: string;
  color: string;
  bgColor: string;
  label?: string;
}

export const categoryIconMap: Record<Categoria | CategoriaIngreso, IconConfig> = {
  // Gastos
  comida:         { name: 'silverware-fork-knife', color: '#F4A261', bgColor: '#FFF3E0' },
  transporte:     { name: 'car-outline',           color: '#0A2463', bgColor: '#E8EDFF' },
  negocio:        { name: 'briefcase-outline',     color: '#00C896', bgColor: '#E0FFF7' },
  entretenimiento:{ name: 'gamepad-variant-outline',color: '#A855F7', bgColor: '#F3E8FF' },
  servicios:      { name: 'lightning-bolt-outline', color: '#3B82F6', bgColor: '#EFF6FF' },
  salud:          { name: 'heart-pulse',            color: '#E63946', bgColor: '#FFE5E7' },
  educacion:      { name: 'book-open-outline',      color: '#0A2463', bgColor: '#E8EDFF' },
  ahorro:         { name: 'piggy-bank-outline',     color: '#00C896', bgColor: '#E0FFF7' },
  deuda:          { name: 'credit-card-outline',    color: '#E63946', bgColor: '#FFE5E7', label: '💳 Pago de cuota' },
  // Ingresos

  sueldo:         { name: 'briefcase-outline',     color: '#00C896', bgColor: '#E0FFF7', label: 'Sueldo' },
  ventas:         { name: 'storefront-outline',    color: '#0A2463', bgColor: '#E8EDFF', label: 'Ventas' },
  cobro:          { name: 'hand-coin-outline',     color: '#F4A261', bgColor: '#FFF3E0', label: 'Cobro' },
  freelance:      { name: 'laptop',                color: '#A855F7', bgColor: '#F3E8FF', label: 'Freelance' },
  regalo:         { name: 'gift-outline',          color: '#E63946', bgColor: '#FFE5E7', label: 'Regalo' },
  otro:           { name: 'dots-horizontal',       color: '#6B7A99', bgColor: '#F0F4FF', label: 'Otro' },
};

export const tipoIconMap = {
  ingreso: { name: 'arrow-down-circle-outline', color: '#00C896', bgColor: '#E0FFF7' },
  gasto:   { name: 'arrow-up-circle-outline',   color: '#E63946', bgColor: '#FFE5E7' },
};
