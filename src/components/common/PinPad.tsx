import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Theme from '../../theme';

interface PinPadProps {
  onComplete: (pin: string) => void;
  error?: boolean;
}

const PinPad: React.FC<PinPadProps> = ({ onComplete, error }) => {
  const [pin, setPin] = useState('');

  const handlePress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        onComplete(newPin);
        // We don't clear here, parent handles it
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const renderDot = (index: number) => {
    const active = pin.length > index;
    return (
      <View
        key={index}
        style={[
          styles.dot,
          active && styles.dotActive,
          error && styles.dotError,
        ]}
      />
    );
  };

  const renderButton = (num: string) => (
    <TouchableOpacity
      key={num}
      style={styles.button}
      onPress={() => handlePress(num)}
    >
      <Text style={styles.buttonText}>{num}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.dotsRow}>
        {[0, 1, 2, 3].map(renderDot)}
      </View>

      <View style={styles.pad}>
        <View style={styles.row}>
          {[1, 2, 3].map(n => renderButton(String(n)))}
        </View>
        <View style={styles.row}>
          {[4, 5, 6].map(n => renderButton(String(n)))}
        </View>
        <View style={styles.row}>
          {[7, 8, 9].map(n => renderButton(String(n)))}
        </View>
        <View style={styles.row}>
          <View style={styles.buttonPlaceholder} />
          {renderButton('0')}
          <TouchableOpacity style={styles.button} onPress={handleBackspace}>
            <MaterialCommunityIcons name="backspace-outline" size={24} color={Theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 40,
    height: 20,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Theme.colors.border,
  },
  dotActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  dotError: {
    borderColor: Theme.colors.danger,
    backgroundColor: Theme.colors.danger,
  },
  pad: {
    width: '100%',
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPlaceholder: {
    width: 70,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '600',
    color: Theme.colors.text,
  },
});

export default PinPad;
