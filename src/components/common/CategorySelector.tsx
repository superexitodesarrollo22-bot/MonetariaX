import React from 'react';
import {
  ScrollView, TouchableOpacity, View, Text, StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Theme from '../../theme';
import { Categoria } from '../../types';
import { categoryIconMap } from '../../utils/categoryIcons';

const categorias: Categoria[] = [
  'comida','transporte','negocio','entretenimiento',
  'servicios','salud','educacion','ahorro','otro',
];

interface CategorySelectorProps {
  selected: Categoria | null;
  onSelect: (cat: Categoria) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ selected, onSelect }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
    {categorias.map(cat => {
      const cfg = categoryIconMap[cat];
      const isSelected = cat === selected;
      return (
        <TouchableOpacity
          key={cat}
          onPress={() => onSelect(cat)}
          style={[
            styles.item,
            isSelected && { borderColor: cfg.color, borderWidth: 2, backgroundColor: cfg.bgColor },
          ]}
          activeOpacity={0.75}
        >
          <View style={[styles.iconWrap, { backgroundColor: isSelected ? cfg.bgColor : '#F0F4FF' }]}>
            <MaterialCommunityIcons
              name={cfg.name as any}
              size={22}
              color={isSelected ? cfg.color : Theme.colors.textLight}
            />
          </View>
          <Text style={[
            styles.label,
            isSelected && { color: cfg.color, fontWeight: '600' },
          ]}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  scroll: { marginBottom: Theme.spacing.md },
  item: {
    alignItems: 'center',
    marginRight: 10,
    padding: 8,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.card,
    minWidth: 70,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    color: Theme.colors.textLight,
    textAlign: 'center',
  },
});

export default CategorySelector;
