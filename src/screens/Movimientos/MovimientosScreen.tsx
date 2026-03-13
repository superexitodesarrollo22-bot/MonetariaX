import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, SafeAreaView, Platform,
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
import { Categoria, CategoriaIngreso, TipoMovimiento, Recurrencia } from '../../types';

import ConfirmationModal from '../../components/common/ConfirmationModal';

const MovimientosScreen: React.FC = () => {
  const { movimientos, agregarMovimiento, borrarMovimiento, cargando, resumenMes } = useFinanzasStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);
  const [tipo, setTipo] = useState<TipoMovimiento>('gasto');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState<Categoria | CategoriaIngreso | null>(null);
  const [nota, setNota] = useState('');
  const [recurrencia, setRecurrencia] = useState<Recurrencia>('ninguna');
  const [diaLimite, setDiaLimite] = useState('');
  const [idEdicion, setIdEdicion] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const resetForm = () => {
    setMonto(''); setCategoria(null); setNota(''); setError('');
    setRecurrencia('ninguna'); setDiaLimite(''); setIdEdicion(null);
  };

  const setTipoYLocal = (t: TipoMovimiento) => {
    setTipo(t);
    setCategoria(null);
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
    if (idEdicion) {
      await useFinanzasStore.getState().actualizarMovimiento(
        idEdicion, tipo, Number(monto), categoria, nota, 
        new Date().toISOString().split('T')[0], recurrencia, diaLimite
      );
    } else {
      await agregarMovimiento(
        tipo, Number(monto), categoria, nota, 
        new Date().toISOString().split('T')[0], recurrencia, diaLimite
      );
    }
    setGuardando(false);
    setModalVisible(false);
    resetForm();
  };

  const handleEditar = (m: any) => {
    setIdEdicion(m.id);
    setTipo(m.tipo);
    setMonto(m.monto.toString());
    setCategoria(m.categoria);
    setNota(m.nota || '');
    setRecurrencia(m.recurrencia || 'ninguna');
    setDiaLimite(m.fechaLimitePago || '');
    setModalVisible(true);
  };

  const handleEliminar = (id: number) => {
    setIdToDelete(id);
    setConfirmDeleteVisible(true);
  };

  const onConfirmDelete = () => {
    if (idToDelete !== null) {
      borrarMovimiento(idToDelete);
      setIdToDelete(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Movimientos</Text>
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
              onEdit={() => handleEditar(m)}
              onDelete={() => handleEliminar(m.id)}
            />
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => { resetForm(); setModalVisible(true); }}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <ConfirmationModal
        visible={confirmDeleteVisible}
        onClose={() => setConfirmDeleteVisible(false)}
        onConfirm={onConfirmDelete}
        title="Eliminar movimiento"
        message="¿Estás seguro de que quieres eliminar este movimiento? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        isDanger
      />


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
              onPress={() => setTipoYLocal('ingreso')}
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
              onPress={() => setTipoYLocal('gasto')}
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
            leftIcon="currency-usd"
          />

          {/* Categorías */}
          <Text style={styles.catLabel}>Categoría</Text>
          <CategorySelector selected={categoria} onSelect={c => { setCategoria(c); setError(''); }} tipo={tipo} />

          {/* Nota */}
          <Input
            label="Nota (opcional)"
            placeholder="Ej: almuerzo con clientes"
            value={nota}
            onChangeText={setNota}
            leftIcon="pencil-outline"
          />

          {/* Recurrencia */}
          <Text style={styles.catLabel}>Recurrencia</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
            {['ninguna', 'semanal', 'quincenal', 'mensual', 'anual'].map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => setRecurrencia(opt as Recurrencia)}
                style={[
                  styles.optionBtn,
                  recurrencia === opt && styles.optionBtnActive
                ]}
              >
                <Text style={[styles.optionText, recurrencia === opt && styles.optionTextActive]}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {recurrencia !== 'ninguna' && (
            <Input
              label="Día del mes (Límite de pago)"
              placeholder="Ej: 15"
              value={diaLimite}
              onChangeText={setDiaLimite}
              keyboardType="number-pad"
              leftIcon="calendar-clock"
            />
          )}

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
    padding: Theme.spacing.md,
    paddingTop: Platform.OS === 'ios' ? 70 : 55,
  },
  title: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.extrabold,
    color: Theme.colors.text,
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 95 : 75,
    right: 24,

    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
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
  listContent: { 
    padding: Theme.spacing.md,
    paddingBottom: 100,
  },
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
  optionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F4FF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionBtnActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  optionText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textLight,
  },
  optionTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default MovimientosScreen;
