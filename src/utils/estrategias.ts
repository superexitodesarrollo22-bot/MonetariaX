export const ESTRATEGIAS_DE_ORO = [
  {
    numero: 1,
    titulo: 'Divide tu salario el mismo día',
    descripcion: 'Separa tu salario en partes: comida, transporte, ahorros y emergencias el mismo día que lo recibes.',
    icono: 'scissors-cutting',
    color: '#0A2463',
  },
  {
    numero: 2,
    titulo: 'Ahorro obligatorio del 10%',
    descripcion: 'Aparta el 10% de cada ingreso como ahorro obligatorio antes de gastar. No es opcional.',
    icono: 'piggy-bank-outline',
    color: '#00C896',
  },
  {
    numero: 3,
    titulo: 'Registro diario',
    descripcion: 'Anota todo lo que gastas cada día. Lo que no se mide, no se controla.',
    icono: 'notebook-outline',
    color: '#F4A261',
  },
  {
    numero: 4,
    titulo: 'Define tu presupuesto',
    descripcion: 'Establece cuánto puedes gastar en comida, transporte y compras. Y respétalo.',
    icono: 'clipboard-list-outline',
    color: '#0A2463',
  },
  {
    numero: 5,
    titulo: 'Compra mañana lo de hoy',
    descripcion: 'Si se te antoja algo hoy, espera hasta mañana para comprarlo. Elimina las compras impulsivas.',
    icono: 'clock-outline',
    color: '#A855F7',
  },
  {
    numero: 6,
    titulo: 'Compra al por mayor',
    descripcion: 'Lo que consumes repetidamente, cómpralo al por mayor. Ahorras más a largo plazo.',
    icono: 'shopping-outline',
    color: '#3B82F6',
  },
  {
    numero: 7,
    titulo: 'Elimina gastos pequeños',
    descripcion: 'Identifica y elimina los pequeños gastos uno a uno, poco a poco. Se acumulan más de lo que crees.',
    icono: 'bug-outline',
    color: '#E63946',
  },
  {
    numero: 8,
    titulo: 'Fondo de emergencia',
    descripcion: 'Crea un fondo de emergencia equivalente a un sueldo completo. Protégete de lo inesperado.',
    icono: 'shield-outline',
    color: '#00C896',
  },
  {
    numero: 9,
    titulo: 'No dejes que tu vida supere tu salario',
    descripcion: 'Si tu estilo de vida crece más rápido que tus ingresos, te empobrecerás aunque ganes más.',
    icono: 'trending-up',
    color: '#F4A261',
  },
  {
    numero: 10,
    titulo: 'Invierte en ti primero',
    descripcion: 'Crece tú primero para que luego crezca el dinero. Invierte en conocimiento y habilidades.',
    icono: 'school-outline',
    color: '#0A2463',
  },
];

export const getEstrategiaDelDia = () => {
  const index = (new Date().getDate() - 1) % ESTRATEGIAS_DE_ORO.length;
  return ESTRATEGIAS_DE_ORO[index];
};
