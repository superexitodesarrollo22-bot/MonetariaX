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
  onEdit?: () => void;
  onDelete?: () => void;
}

const MovimientoItem: React.FC<MovimientoItemProps> = ({
  movimiento, onPress, onEdit, onDelete,
}) => {
  const iconKey = movimiento.categoria as keyof typeof categoryIconMap;
  const iconCfg = categoryIconMap[iconKey] || categoryIconMap.otro;
  const isIngreso = movimiento.tipo === 'ingreso';

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
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
        <View style={styles.catRow}>
          <Text style={styles.cat} numberOfLines={1}>
            {iconCfg.label || (movimiento.categoria.charAt(0).toUpperCase() + movimiento.categoria.slice(1))}
          </Text>
          {!isIngreso && movimiento.monto < 10 && (
            <View style={styles.hormigaTag}>
              <MaterialCommunityIcons name="bug-outline" size={10} color={Theme.colors.warning} />
              <Text style={styles.hormigaTagText}>HORMIGA</Text>
            </View>
          )}
        </View>
        <Text style={styles.nota} numberOfLines={1}>
          {movimiento.nota || formatDateShort(movimiento.fecha)}
        </Text>
      </View>

      
      <View style={styles.rightContent}>
        <View style={styles.amountWrap}>
          <Text style={[
            styles.amount,
            { color: isIngreso ? Theme.colors.secondary : Theme.colors.danger },
          ]}>
            {isIngreso ? '+' : '-'} {formatMoney(movimiento.monto)}
          </Text>
          <Text style={styles.date}>{formatDateShort(movimiento.fecha)}</Text>
        </View>

        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity onPress={onEdit} style={styles.actionBtn}>
              <MaterialCommunityIcons name="pencil-outline" size={18} color={Theme.colors.textLight} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.actionBtn}>
              <MaterialCommunityIcons name="trash-can-outline" size={18} color={Theme.colors.danger} />
            </TouchableOpacity>
          )}
        </View>
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
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cat: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text,
  },
  hormigaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.warningLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  hormigaTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: Theme.colors.accent,
  },
  nota: {

    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textLight,
    marginTop: 2,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountWrap: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  amount: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  date: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textLight,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F0F4FF',
  },
});

export default MovimientoItem;
