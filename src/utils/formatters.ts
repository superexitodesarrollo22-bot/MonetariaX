export const formatMoney = (amount: number, currency = '$'): string => {
  return `${currency}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateShort = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-EC', { day: '2-digit', month: 'short' });
};

export const getCurrentMonth = (): { mes: number; anio: number } => {
  const now = new Date();
  return { mes: now.getMonth() + 1, anio: now.getFullYear() };
};
