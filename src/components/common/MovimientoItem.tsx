import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Theme from '../../theme';
import { Movimiento } from '../../types';
import { formatMoney, formatDateShort } from '../../utils/formatters';
import { categoryIconMap, tipoIconMap } from '../../utils/categoryIcons';

interface MovimientoItemProps {
  movimiento: Movimiento;
  onPress?: () => void;
  onLongPress?: () => void;
}

const MovimientoItem: React.FC<MovimientoItemProps> = ({
  movimiento, onPress, onLongPress,
}) => {
  const iconCfg = categoryIconMap[movimiento.categoria] || categoryIconMap.otro;
  const isIngreso = movimiento.tipo === 'ingreso';

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.75}
    >
      <View style={[styles.iconWrap, { backgroundColor: iconCfg.bgColor }]}>
        <MaterialCommunityIcons
          name={iconCfg.name as any}
          size={22}
          color={iconCfg.color}
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.cat} numberOfLines={1}>
          {movimiento.categoria.charAt(0).toUpperCase() + movimiento.categoria.slice(1)}
        </Text>
        <Text style={styles.nota} numberOfLines={1}>
          {movimiento.nota || formatDateShort(movimiento.fecha)}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={[
          styles.amount,
          { color: isIngreso ? Theme.colors.secondary : Theme.colors.danger },
        ]}>
          {isIngreso ? '+' : '-'} {formatMoney(movimiento.monto)}
        </Text>
        <Text style={styles.date}>{formatDateShort(movimiento.fecha)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borderRadius.md,
    marginBottom: 6,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.sm,
  },
  info: { flex: 1 },
  cat: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text,
  },
  nota: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textLight,
    marginTop: 2,
  },
  right: { alignItems: 'flex-end' },
  amount: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  date: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textLight,
    marginTop: 2,
  },
});

export default MovimientoItem;
