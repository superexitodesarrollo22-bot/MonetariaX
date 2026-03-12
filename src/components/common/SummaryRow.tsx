import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Theme from '../../theme';
import { formatMoney } from '../../utils/formatters';

interface SummaryRowProps {
  label: string;
  amount: number;
  icon: string;
  iconColor: string;
  iconBg: string;
  style?: ViewStyle;
}

const SummaryRow: React.FC<SummaryRowProps> = ({
  label, amount, icon, iconColor, iconBg, style,
}) => (
  <View style={[styles.row, style]}>
    <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
      <MaterialCommunityIcons name={icon as any} size={22} color={iconColor} />
    </View>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.amount, { color: iconColor }]}>{formatMoney(amount)}</Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.sm,
  },
  label: {
    flex: 1,
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  amount: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.bold,
  },
});

export default SummaryRow;
