import React from 'react';
import {
  TouchableOpacity, Text, ActivityIndicator,
  StyleSheet, ViewStyle, TextStyle,
} from 'react-native';
import Theme from '../../theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const Button: React.FC<ButtonProps> = ({
  label, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false, fullWidth = false, style,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'primary':   return { bg: Theme.colors.primary,    text: '#fff' };
      case 'secondary': return { bg: Theme.colors.secondary,  text: '#fff' };
      case 'outline':   return { bg: 'transparent',           text: Theme.colors.primary };
      case 'danger':    return { bg: Theme.colors.danger,     text: '#fff' };
      case 'ghost':     return { bg: 'transparent',           text: Theme.colors.textLight };
      default:          return { bg: Theme.colors.primary,    text: '#fff' };
    }
  };

  const heights = { sm: 38, md: 48, lg: 56 };
  const fontSizes = { sm: 13, md: 15, lg: 17 };
  const { bg, text } = getColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        { backgroundColor: bg, height: heights[size] },
        variant === 'outline' && { borderWidth: 1.5, borderColor: Theme.colors.primary },
        fullWidth && { width: '100%' },
        (disabled || loading) && { opacity: 0.5 },
        Theme.shadows.sm as ViewStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={text} size="small" />
      ) : (
        <Text style={[styles.label, { color: text, fontSize: fontSizes[size] }]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  label: {
    fontWeight: Theme.typography.fontWeight.semibold,
    letterSpacing: 0.3,
  },
});

export default Button;
