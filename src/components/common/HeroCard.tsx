import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Theme from '../../theme';
import { formatMoney } from '../../utils/formatters';

interface HeroCardProps {
  balance: number;
  nombre: string;
  mes: string;
}

const HeroCard: React.FC<HeroCardProps> = ({ balance, nombre, mes }) => (
  <View style={styles.card}>
    <View style={styles.bgCircle} />
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>Hola, {nombre}</Text>
        <Text style={styles.period}>{mes}</Text>
      </View>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name="cash-fast" size={28} color={Theme.colors.secondary} />
      </View>
    </View>
    <Text style={styles.balanceLabel}>Balance disponible</Text>
    <Text style={[styles.balance, { color: balance >= 0 ? '#FFFFFF' : '#FFB3B8' }]}>
      {formatMoney(balance)}
    </Text>
    <View style={styles.statusRow}>
      <MaterialCommunityIcons
        name={balance >= 0 ? 'trending-up' : 'trending-down'}
        size={16}
        color={balance >= 0 ? Theme.colors.secondary : '#FFB3B8'}
      />
      <Text style={[styles.statusText, { color: balance >= 0 ? Theme.colors.secondary : '#FFB3B8' }]}>
        {balance >= 0 ? 'Finanzas saludables este mes' : 'Gastos superan ingresos'}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    overflow: 'hidden',
  },
  bgCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    right: -40,
    top: -40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.lg,
  },
  greeting: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: 'rgba(255,255,255,0.85)',
  },
  period: {
    fontSize: Theme.typography.fontSize.sm,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 2,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceLabel: {
    fontSize: Theme.typography.fontSize.sm,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 4,
  },
  balance: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.sm,
    gap: 6,
  },
  statusText: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.medium,
    marginLeft: 4,
  },
});

export default HeroCard;
