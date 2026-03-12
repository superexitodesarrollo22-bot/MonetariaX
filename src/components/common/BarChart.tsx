import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Theme from '../../theme';
import { formatMoney } from '../../utils/formatters';

interface BarChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  maxValue?: number;
}

const BarChart: React.FC<BarChartProps> = ({ data, maxValue }) => {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);
  return (
    <View style={styles.container}>
      {data.map((item, i) => (
        <View key={i} style={styles.row}>
          <Text style={styles.label} numberOfLines={1}>{item.label}</Text>
          <View style={styles.barBg}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${Math.max((item.value / max) * 100, 2)}%`,
                  backgroundColor: item.color,
                },
              ]}
            />
          </View>
          <Text style={styles.value}>{formatMoney(item.value)}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    width: 90,
    fontSize: 12,
    color: Theme.colors.textLight,
    textTransform: 'capitalize',
  },
  barBg: {
    flex: 1,
    height: 12,
    backgroundColor: Theme.colors.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  value: {
    width: 72,
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.text,
    textAlign: 'right',
  },
});

export default BarChart;
