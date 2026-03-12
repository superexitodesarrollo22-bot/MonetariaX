import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, Alert, Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Theme from '../../theme';
import { useFinanzasStore } from '../../store/finanzasStore';
import DeudaCard from '../../components/common/DeudaCard';
import BottomSheet from '../../components/common/BottomSheet';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import EmptyState from '../../components/common/EmptyState';
import { formatMoney } from '../../utils/formatters';

const DeudasScreen: React.FC = () => {
  const { deudas, agregarDeuda, pagarCuotaDeuda, borrarDeuda } = useFinanzasStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [montoTotal, setMontoTotal] = useState('');
  const [interes, setInteres] = useState('');
  const [cuota, setCuota] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const totalDeudas = deudas.reduce((acc, d) => {
    const restante = Math.max(d.cuotaMensual * (
      Math.ceil(
        d.interesMensual === 0
          ? d.montoTotal / d.cuotaMensual
          : Math.log(d.cuotaMensual / (d.cuotaMensual - d.montoTotal * (d.interesMensual / 100))) /
            Math.log(1 + d.interesMensual / 100)
      ) - d.pagosRealizados
    ), 0);
    return acc + restante;
  }, 0);

  const resetForm = () => {
    setNombre(''); setMontoTotal(''); setInteres(''); setCuota(''); setError('');
  };

  const handleGuardar = async () => {
    if (!nombre.trim()) { setError('Ingresa el nombre de la deuda'); return; }
    if (!montoTotal || isNaN(Number(montoTotal)) || Number(montoTotal) <= 0) {
      setError('Ingresa el monto total de la deuda'); return;
    }
    const interesNum = Number(interes) || 0;
    const cuotaNum = Number(cuota);
    const montoNum = Number(montoTotal);
    if (interesNum > 0 && cuotaNum <= montoNum * (interesNum / 100)) {
      setError(`La cuota mensual debe ser mayor a $${(montoNum * interesNum / 100).toFixed(2)} para cubrir el interés`);
      return;
    }
    setGuardando(true);
    await agregarDeuda(
      nombre.trim(),
      Number(montoTotal),
      Number(interes) || 0,
      Number(cuota),
      new Date().toISOString().split('T')[0]
    );
    setGuardando(false);
    setModalVisible(false);
    resetForm();
  };

  const handlePagar = (id: number, nombre: string) => {
    Alert.alert(
      'Registrar pago',
      `¿Registrar una cuota pagada para "${nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí, pagada', onPress: () => pagarCuotaDeuda(id) },
      ]
    );
  };

  const handleEliminar = (id: number, nombre: string) => {
    Alert.alert(
      'Eliminar deuda',
      `¿Eliminar la deuda "${nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => borrarDeuda(id) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Deudas</Text>
      </View>

      {deudas.length > 0 && (
        <View style={styles.totalWrap}>
          <MaterialCommunityIcons name="alert-circle-outline" size={18} color={Theme.colors.accent} />
          <Text style={styles.totalText}>
            Total pendiente: <Text style={styles.totalAmount}>{formatMoney(totalDeudas)}</Text>
          </Text>
        </View>
      )}

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {deudas.length === 0 ? (
          <EmptyState
            icon="credit-card-outline"
            title="Sin deudas registradas"
            description="Registra tus créditos o préstamos para ver exactamente cuánto y cuándo terminas de pagar"
          />
        ) : (
          deudas.map(d => (
            <DeudaCard
              key={d.id}
              deuda={d}
              onPagar={() => handlePagar(d.id, d.nombre)}
              onEliminar={() => handleEliminar(d.id, d.nombre)}
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

      <BottomSheet
        visible={modalVisible}
        onClose={() => { setModalVisible(false); resetForm(); }}
        title="Registrar deuda"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Input
            label="Nombre de la deuda"
            placeholder="Ej: Préstamo banco, Tarjeta de crédito"
            value={nombre}
            onChangeText={v => { setNombre(v); setError(''); }}
            leftIcon="bank-outline"
          />
          <Input
            label="Monto total ($)"
            placeholder="0.00"
            value={montoTotal}
            onChangeText={v => { setMontoTotal(v.replace(',', '.')); setError(''); }}
            keyboardType="decimal-pad"
            leftIcon="currency-usd"
          />
          <Input
            label="Interés mensual (% — opcional, pon 0 si no hay)"
            placeholder="0"
            value={interes}
            onChangeText={v => { setInteres(v.replace(',', '.')); setError(''); }}
            keyboardType="decimal-pad"
            leftIcon="percent-outline"
          />
          <Input
            label="Cuota mensual ($)"
            placeholder="0.00"
            value={cuota}
            onChangeText={v => { setCuota(v.replace(',', '.')); setError(''); }}
            keyboardType="decimal-pad"
            leftIcon="calendar-month-outline"
          />

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <Button
            label="Guardar deuda"
            onPress={handleGuardar}
            variant="primary"
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
    paddingTop: Theme.spacing.lg,
  },
  title: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.extrabold,
    color: Theme.colors.text,
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
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
  totalWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.warningLight,
    marginHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.sm,
    gap: 8,
    marginBottom: Theme.spacing.sm,
  },
  totalText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text,
    marginLeft: 6,
  },
  totalAmount: {
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.accent,
  },
  list: { flex: 1 },
  listContent: { 
    padding: Theme.spacing.md,
    paddingBottom: 100,
  },
  errorText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.danger,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
});

export default DeudasScreen;
