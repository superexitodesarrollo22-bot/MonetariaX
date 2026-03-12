import React from 'react';
import {
  ScrollView, TouchableOpacity, View, Text, StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Theme from '../../theme';
import { Categoria, CategoriaIngreso } from '../../types';
import { categoryIconMap } from '../../utils/categoryIcons';

const categoriasGasto: Categoria[] = [
  'comida','transporte','negocio','entretenimiento',
  'servicios','salud','educacion','ahorro','otro',
];

const categoriasIngreso: CategoriaIngreso[] = [
  'sueldo','ventas','cobro','freelance','negocio','regalo','otro',
];

interface CategorySelectorProps {
  selected: Categoria | CategoriaIngreso | null;
  onSelect: (cat: Categoria | CategoriaIngreso) => void;
  tipo?: 'ingreso' | 'gasto';
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ selected, onSelect, tipo = 'gasto' }) => {
  const categories = tipo === 'ingreso' ? categoriasIngreso : categoriasGasto;
  
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      {categories.map(cat => {
        const cfg = categoryIconMap[cat];
        const isSelected = cat === selected;
        const label = cfg.label || (cat.charAt(0).toUpperCase() + cat.slice(1));
        
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
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

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
