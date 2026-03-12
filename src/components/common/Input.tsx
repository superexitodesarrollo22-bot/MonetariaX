import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  TextInputProps, ViewStyle, TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Theme from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

const Input: React.FC<InputProps> = ({
  label, error, leftIcon, rightIcon, onRightIconPress,
  containerStyle, ...props
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputWrap,
        focused && styles.inputFocused,
        !!error && styles.inputError,
      ]}>
        {leftIcon && (
          <MaterialCommunityIcons
            name={leftIcon as any}
            size={20}
            color={focused ? Theme.colors.primary : Theme.colors.textLight}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          {...props}
          style={[styles.input, leftIcon && { paddingLeft: 0 }]}
          placeholderTextColor={Theme.colors.textLight}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <MaterialCommunityIcons name={rightIcon as any} size={20} color={Theme.colors.textLight} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: Theme.spacing.md },
  label: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.text,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.background,
    paddingHorizontal: Theme.spacing.sm,
    height: 52,
  },
  inputFocused: { borderColor: Theme.colors.primary },
  inputError: { borderColor: Theme.colors.danger },
  input: {
    flex: 1,
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text,
    paddingVertical: 0,
  },
  leftIcon: { marginRight: Theme.spacing.xs },
  rightIcon: { marginLeft: Theme.spacing.xs },
  error: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.danger,
    marginTop: 4,
  },
});

export default Input;
