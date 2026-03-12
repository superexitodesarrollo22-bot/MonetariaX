import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, SafeAreaView, TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Theme from '../../theme';
import { useFinanzasStore } from '../../store/finanzasStore';
import MovimientoItem from '../../components/common/MovimientoItem';
import CategorySelector from '../../components/common/CategorySelector';
import BottomSheet from '../../components/common/BottomSheet';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import EmptyState from '../../components/common/EmptyState';
import { Categoria, TipoMovimiento } from '../../types';

const MovimientosScreen: React.FC = () => {
  const { movimientos, agregarMovimiento, borrarMovimiento, cargando, resumenMes } = useFinanzasStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [tipo, setTipo] = useState<TipoMovimiento>('gasto');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [nota, setNota] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const resetForm = () => {
    setMonto(''); setCategoria(null); setNota(''); setError('');
  };

  const handleGuardar = async () => {
    if (!monto || isNaN(Number(monto)) || Number(monto) <= 0) {
      setError('Ingresa un monto válido mayor a 0');
      return;
    }
    if (!categoria) {
      setError('Selecciona una categoría');
      return;
    }
    setGuardando(true);
    await agregarMovimiento(
      tipo,
      Number(monto),
      categoria,
      nota,
      new Date().toISOString().split('T')[0]
    );
    setGuardando(false);
    setModalVisible(false);
    resetForm();
  };

  const handleEliminar = (id: number) => {
    Alert.alert(
      'Eliminar movimiento',
      '¿Estás seguro de que quieres eliminar este movimiento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => borrarMovimiento(id),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Movimientos</Text>
        <TouchableOpacity
          onPress={() => { resetForm(); setModalVisible(true); }}
          style={styles.addBtn}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Resumen rápido */}
      <View style={styles.quickSummary}>
        <View style={[styles.summaryChip, { backgroundColor: Theme.colors.successLight }]}>
          <MaterialCommunityIcons name="arrow-down-circle-outline" size={16} color={Theme.colors.secondary} />
          <Text style={[styles.chipText, { color: Theme.colors.secondary }]}>
            +${resumenMes.totalIngresos.toFixed(2)}
          </Text>
        </View>
        <View style={[styles.summaryChip, { backgroundColor: Theme.colors.dangerLight }]}>
          <MaterialCommunityIcons name="arrow-up-circle-outline" size={16} color={Theme.colors.danger} />
          <Text style={[styles.chipText, { color: Theme.colors.danger }]}>
            -${resumenMes.totalGastos.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Lista */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {movimientos.length === 0 ? (
          <EmptyState
            icon="swap-vertical-circle-outline"
            title="Sin movimientos"
            description="Toca el botón + para registrar tu primer ingreso o gasto"
          />
        ) : (
          movimientos.map(m => (
            <MovimientoItem
              key={m.id}
              movimiento={m}
              onLongPress={() => handleEliminar(m.id)}
            />
          ))
        )}
        <Text style={styles.hint}>
          Mantén presionado un movimiento para eliminarlo
        </Text>
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom Sheet: Nuevo Movimiento */}
      <BottomSheet
        visible={modalVisible}
        onClose={() => { setModalVisible(false); resetForm(); }}
        title="Nuevo movimiento"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Tipo de movimiento */}
          <View style={styles.tipoRow}>
            <TouchableOpacity
              style={[styles.tipoBtn, tipo === 'ingreso' && styles.tipoBtnActiveIngreso]}
              onPress={() => setTipo('ingreso')}
            >
              <MaterialCommunityIcons
                name="arrow-down-circle-outline"
                size={20}
                color={tipo === 'ingreso' ? Theme.colors.secondary : Theme.colors.textLight}
              />
              <Text style={[
                styles.tipoBtnText,
                tipo === 'ingreso' && { color: Theme.colors.secondary },
              ]}>
                Ingreso
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tipoBtn, tipo === 'gasto' && styles.tipoBtnActiveGasto]}
              onPress={() => setTipo('gasto')}
            >
              <MaterialCommunityIcons
                name="arrow-up-circle-outline"
                size={20}
                color={tipo === 'gasto' ? Theme.colors.danger : Theme.colors.textLight}
              />
              <Text style={[
                styles.tipoBtnText,
                tipo === 'gasto' && { color: Theme.colors.danger },
              ]}>
                Gasto
              </Text>
            </TouchableOpacity>
          </View>

          {/* Monto */}
          <Input
            label="Monto ($)"
            placeholder="0.00"
            value={monto}
            onChangeText={v => { setMonto(v.replace(',', '.')); setError(''); }}
            keyboardType="decimal-pad"
            leftIcon="cash-outline"
          />

          {/* Categorías */}
          <Text style={styles.catLabel}>Categoría</Text>
          <CategorySelector selected={categoria} onSelect={c => { setCategoria(c); setError(''); }} />

          {/* Nota */}
          <Input
            label="Nota (opcional)"
            placeholder="Ej: almuerzo con clientes"
            value={nota}
            onChangeText={setNota}
            leftIcon="pencil-outline"
          />

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <Button
            label="Guardar movimiento"
            onPress={handleGuardar}
            variant={tipo === 'ingreso' ? 'secondary' : 'danger'}
            size="lg"
            loading={guardando}
            fullWidth
          />
          <View style={{ height: Theme.spacing.md }} />
        </ScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.md,
    paddingTop: Theme.spacing.lg,
  },
  title: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.extrabold,
    color: Theme.colors.text,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickSummary: {
    flexDirection: 'row',
    paddingHorizontal: Theme.spacing.md,
    gap: 10,
    marginBottom: Theme.spacing.sm,
  },
  summaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  chipText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.bold,
    marginLeft: 4,
  },
  list: { flex: 1 },
  listContent: { padding: Theme.spacing.md },
  hint: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textLight,
    textAlign: 'center',
    marginTop: Theme.spacing.sm,
  },
  tipoRow: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.md,
    gap: 10,
  },
  tipoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    gap: 6,
  },
  tipoBtnActiveIngreso: {
    borderColor: Theme.colors.secondary,
    backgroundColor: Theme.colors.successLight,
  },
  tipoBtnActiveGasto: {
    borderColor: Theme.colors.danger,
    backgroundColor: Theme.colors.dangerLight,
  },
  tipoBtnText: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.textLight,
    marginLeft: 4,
  },
  catLabel: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  errorText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.danger,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
});

export default MovimientosScreen;
