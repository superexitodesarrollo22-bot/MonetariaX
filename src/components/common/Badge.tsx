import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Theme from '../../theme';

interface BadgeProps {
  label: string;
  color?: string;
  bgColor?: string;
  size?: 'sm' | 'md';
}

const Badge: React.FC<BadgeProps> = ({
  label,
  color = Theme.colors.primary,
  bgColor = Theme.colors.background,
  size = 'md',
}) => (
  <View style={[styles.badge, { backgroundColor: bgColor }, size === 'sm' && styles.badgeSm]}>
    <Text style={[styles.text, { color }, size === 'sm' && styles.textSm]}>
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  badgeSm: { paddingHorizontal: 7, paddingVertical: 2 },
  text: { fontSize: 13, fontWeight: Theme.typography.fontWeight.medium },
  textSm: { fontSize: 11 },
});

export default Badge;
