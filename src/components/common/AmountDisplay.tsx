import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import Theme from '../../theme';
import { formatMoney } from '../../utils/formatters';

interface AmountDisplayProps {
  amount: number;
  tipo?: 'ingreso' | 'gasto' | 'neutral';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  style?: TextStyle;
}

const AmountDisplay: React.FC<AmountDisplayProps> = ({
  amount, tipo = 'neutral', size = 'md', style,
}) => {
  const colors = {
    ingreso: Theme.colors.secondary,
    gasto: Theme.colors.danger,
    neutral: Theme.colors.text,
  };
  const sizes = { sm: 14, md: 18, lg: 24, xl: 32 };

  return (
    <Text style={[
      styles.amount,
      { color: colors[tipo], fontSize: sizes[size] },
      style,
    ]}>
      {tipo === 'gasto' ? '- ' : tipo === 'ingreso' ? '+ ' : ''}
      {formatMoney(amount)}
    </Text>
  );
};

const styles = StyleSheet.create({
  amount: { fontWeight: Theme.typography.fontWeight.bold },
});

export default AmountDisplay;
