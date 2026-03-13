import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Theme from '../../theme';

interface AlertCardProps {
  type: 'warning' | 'danger' | 'success' | 'info';
  title: string;
  message: string;
  compact?: boolean;
}

const CONFIGS = {
  warning: { icon: 'alert-outline',         bg: Theme.colors.warningLight, color: Theme.colors.accent  },
  danger:  { icon: 'alert-circle-outline',  bg: Theme.colors.dangerLight,  color: Theme.colors.danger  },
  success: { icon: 'check-circle-outline',  bg: Theme.colors.successLight, color: Theme.colors.secondary },
  info:    { icon: 'information-outline',   bg: '#E8EDFF',                 color: Theme.colors.primary },
};

const AlertCard: React.FC<AlertCardProps> = ({ type, title, message, compact }) => {
  const cfg = CONFIGS[type];
  return (
    <View style={[styles.card, { backgroundColor: cfg.bg }, compact && styles.compactCard]}>
      <MaterialCommunityIcons name={cfg.icon as any} size={compact ? 18 : 22} color={cfg.color} />
      <View style={styles.body}>
        <Text style={[styles.title, { color: cfg.color }, compact && styles.compactTitle]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.message} numberOfLines={compact ? 1 : 2}>
          {message}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    alignItems: 'flex-start',
    gap: 10,
  },
  compactCard: {
    padding: Theme.spacing.sm,
    marginBottom: 6,
    alignItems: 'center',
  },
  body: { flex: 1, marginLeft: 8 },
  title: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: 4,
  },
  compactTitle: {
    marginBottom: 0,
    fontSize: 12,
  },
  message: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text,
    lineHeight: 20,
  },
});


export default AlertCard;
