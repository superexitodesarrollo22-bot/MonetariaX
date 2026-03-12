import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Theme from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
}

const Card: React.FC<CardProps> = ({ children, style, padding = Theme.spacing.md }) => (
  <View style={[styles.card, { padding }, Theme.shadows.md as any, style]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.sm,
  },
});

export default Card;
