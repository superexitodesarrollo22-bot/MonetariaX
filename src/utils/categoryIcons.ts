import { Categoria } from '../types';

export interface IconConfig {
  name: string;
  color: string;
  bgColor: string;
}

export const categoryIconMap: Record<Categoria, IconConfig> = {
  comida:         { name: 'silverware-fork-knife', color: '#F4A261', bgColor: '#FFF3E0' },
  transporte:     { name: 'car-outline',           color: '#0A2463', bgColor: '#E8EDFF' },
  negocio:        { name: 'briefcase-outline',     color: '#00C896', bgColor: '#E0FFF7' },
  entretenimiento:{ name: 'gamepad-variant-outline',color: '#A855F7', bgColor: '#F3E8FF' },
  servicios:      { name: 'lightning-bolt-outline', color: '#3B82F6', bgColor: '#EFF6FF' },
  salud:          { name: 'heart-pulse',            color: '#E63946', bgColor: '#FFE5E7' },
  educacion:      { name: 'book-open-outline',      color: '#0A2463', bgColor: '#E8EDFF' },
  ahorro:         { name: 'piggy-bank-outline',     color: '#00C896', bgColor: '#E0FFF7' },
  otro:           { name: 'dots-horizontal-circle-outline', color: '#6B7A99', bgColor: '#F0F4FF' },
};

export const tipoIconMap = {
  ingreso: { name: 'arrow-down-circle-outline', color: '#00C896', bgColor: '#E0FFF7' },
  gasto:   { name: 'arrow-up-circle-outline',   color: '#E63946', bgColor: '#FFE5E7' },
};
