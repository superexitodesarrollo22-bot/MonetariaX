import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Theme from '../../theme';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox-outline', title, description,
}) => (
  <View style={styles.container}>
    <MaterialCommunityIcons
      name={icon as any}
      size={64}
      color={Theme.colors.border}
    />
    <Text style={styles.title}>{title}</Text>
    {description && <Text style={styles.desc}>{description}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.xxl,
  },
  title: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.textLight,
    marginTop: Theme.spacing.md,
    textAlign: 'center',
  },
  desc: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textLight,
    marginTop: Theme.spacing.xs,
    textAlign: 'center',
    paddingHorizontal: Theme.spacing.xl,
  },
});

export default EmptyState;
