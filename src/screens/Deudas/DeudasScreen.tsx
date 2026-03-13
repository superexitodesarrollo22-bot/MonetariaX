import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Platform, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Theme from '../../theme';
import { useFinanzasStore } from '../../store/finanzasStore';
import DeudaCard from '../../components/common/DeudaCard';
import BottomSheet from '../../components/common/BottomSheet';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import EmptyState from '../../components/common/EmptyState';
import { formatMoney } from '../../utils/formatters';
import { diffInMonths } from '../../database/deudasDB';


import { Categoria, Deuda } from '../../types';
import ConfirmationModal from '../../components/common/ConfirmationModal';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DeudasScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { deudas, agregarDeuda, pagarCuotaDeuda, borrarDeuda } = useFinanzasStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [confirmPagarVisible, setConfirmPagarVisible] = useState(false);
  const [selectedDeudaId, setSelectedDeudaId] = useState<number | null>(null);
  const [selectedDeudaNombre, setSelectedDeudaNombre] = useState('');

  const [nombre, setNombre] = useState('');
  const [montoTotal, setMontoTotal] = useState('');
  const [interes, setInteres] = useState('');
  const [cuota, setCuota] = useState('');
  const [cuotaActual, setCuotaActual] = useState('');
  const [diaPago, setDiaPago] = useState('');
  
  const [inicioMes, setInicioMes] = useState('');
  const [inicioAnio, setInicioAnio] = useState('');
  const [finMes, setFinMes] = useState('');
  const [finAnio, setFinAnio] = useState('');
  
  const [pagarModalVisible, setPagarModalVisible] = useState(false);
  const [numCuotasAPagar, setNumCuotasAPagar] = useState(1);
  const [selectedDeuda, setSelectedDeuda] = useState<Deuda | null>(null);

  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);


  const nombreRef = useRef<TextInput>(null);
  const montoTotalRef = useRef<TextInput>(null);
  const interesRef = useRef<TextInput>(null);
  const cuotaRef = useRef<TextInput>(null);
  const cuotaActualRef = useRef<TextInput>(null);
  const diaPagoRef = useRef<TextInput>(null);
  const inicioMesRef = useRef<TextInput>(null);
  const inicioAnioRef = useRef<TextInput>(null);
  const finMesRef = useRef<TextInput>(null);
  const finAnioRef = useRef<TextInput>(null);


  const totalDeudas = deudas.reduce((acc: number, d: Deuda) => {
    const cuotasRestantes = Math.max(d.totalCuotas - d.cuotaActual, 0);
    return acc + (cuotasRestantes * d.cuotaMensual);
  }, 0);



  const resetForm = () => {
    setNombre(''); setMontoTotal(''); setInteres(''); setCuota(''); setError('');
    setCuotaActual(''); setDiaPago('');
    setInicioMes(''); setInicioAnio(''); setFinMes(''); setFinAnio('');
  };


  const handleGuardar = async () => {
    console.log('[DEUDA] Iniciando guardado de deuda:', { 
      nombre, montoTotal, interes, cuota, cuotaActual, diaPago,
      inicioMes, inicioAnio, finMes, finAnio 
    });

    if (!nombre.trim()) { 
      console.log('[DEUDA] Validación FALLIDA - campo: nombre, valor:', nombre);
      setError('Ingresa el nombre'); return; 
    }
    console.log('[DEUDA] Validación OK - campo: nombre, valor:', nombre);

    if (!montoTotal || isNaN(Number(montoTotal))) { 
      console.log('[DEUDA] Validación FALLIDA - campo: montoTotal, valor:', montoTotal);
      setError('Monto inválido'); return; 
    }
    console.log('[DEUDA] Validación OK - campo: montoTotal, valor:', montoTotal);

    if (!cuota || isNaN(Number(cuota))) { 
      console.log('[DEUDA] Validación FALLIDA - campo: cuota, valor:', cuota);
      setError('Cuota inválida'); return; 
    }
    console.log('[DEUDA] Validación OK - campo: cuota, valor:', cuota);
    
    // Validar fechas
    if (!inicioMes || !inicioAnio || !finMes || !finAnio) {
      console.log('[DEUDA] Validación FALLIDA - fechas incompletas');
      setError('Las fechas son obligatorias'); return;
    }
    
    const dInicio = new Date(Number(inicioAnio), Number(inicioMes) - 1, 1);
    const dFin = new Date(Number(finAnio), Number(finMes) - 1, 1);
    
    console.log('[DEUDA] Fechas procesadas - Inicio:', dInicio.toISOString(), 'Fin:', dFin.toISOString());

    if (dFin <= dInicio) {
      console.log('[DEUDA] Validación FALLIDA - fecha fin <= fecha inicio');
      setError('La fecha de finalización debe ser posterior a la de inicio');
      return;
    }
    
    const totalCuotasCalculado = diffInMonths(dInicio, dFin);
    console.log('[DEUDA] Total cuotas calculado:', totalCuotasCalculado);

    if (totalCuotasCalculado <= 0) {
      setError('El período debe ser de al menos 1 mes');
      return;
    }

    try {
      const objetoDeuda = {
        nombre: nombre.trim(),
        montoTotal: Number(montoTotal),
        interesMensual: Number(interes) || 0,
        cuotaMensual: Number(cuota),
        fechaInicio: dInicio.toISOString(),
        fechaFinalizacion: dFin.toISOString(),
        totalCuotas: totalCuotasCalculado,
        cuotaActual: Number(cuotaActual) || 0,
        diaPago: Number(diaPago) || undefined
      };

      console.log('[DEUDA] Intentando guardar en almacenamiento:', objetoDeuda);
      setGuardando(true);

      const idGenerado = await agregarDeuda(
        objetoDeuda.nombre,
        objetoDeuda.montoTotal,
        objetoDeuda.interesMensual,
        objetoDeuda.cuotaMensual,
        objetoDeuda.fechaInicio,
        objetoDeuda.fechaFinalizacion,
        objetoDeuda.totalCuotas,
        objetoDeuda.cuotaActual,
        objetoDeuda.diaPago
      );

      console.log('[DEUDA] Guardado exitoso. ID:', idGenerado);
      setGuardando(false);
      console.log('[DEUDA] Cerrando modal y actualizando lista');
      setModalVisible(false);
      resetForm();
    } catch (err: any) {
      console.log('[DEUDA] ERROR al guardar:', err.message, err);
      setError('Error al guardar la deuda');
      setGuardando(false);
    }
  };



  const handlePagar = (deuda: Deuda) => {
    setSelectedDeuda(deuda);
    setNumCuotasAPagar(1);
    setPagarModalVisible(true);
  };

  const onConfirmPagarMulti = async () => {
    if (selectedDeuda) {
      const resp = await pagarCuotaDeuda(selectedDeuda.id, numCuotasAPagar);
      setPagarModalVisible(false);
      setSelectedDeuda(null);
      if (resp?.terminada) {
        Alert.alert('¡FELICIDADES!', `Terminaste de pagar ${resp.nombre}. 🥳👏`);
      }
    }
  };




  const handleEliminar = (id: number, nombre: string) => {
    setSelectedDeudaId(id);
    setSelectedDeudaNombre(nombre);
    setConfirmDeleteVisible(true);
  };


  const onConfirmDelete = () => {
    if (selectedDeudaId) {
      const debt = deudas.find(d => d.id === selectedDeudaId);
      borrarDeuda(selectedDeudaId, selectedDeudaNombre, (debt?.pagosRealizados ?? 0) > 0);
      setSelectedDeudaId(null);
      setSelectedDeudaNombre('');
      setConfirmDeleteVisible(false);
    }
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
        {deudas.filter(d => d.activa).length === 0 && deudas.filter(d => !d.activa).length === 0 ? (
          <EmptyState
            icon="credit-card-outline"
            title="Sin deudas registradas"
            description="Registra tus créditos o préstamos para ver exactamente cuánto y cuándo terminas de pagar"
          />
        ) : (
          <>
            {deudas.filter((d: Deuda) => d.activa).map((d: Deuda) => {
              const { mesActual, anioActual, movimientos } = useFinanzasStore.getState();
              const adelantadas = movimientos.filter((m: any) => {
                const mDate = new Date(m.fecha);
                return m.categoria === 'Deuda' && 
                       m.nota?.includes(d.nombre) && 
                       (mDate.getMonth() + 1) === mesActual && 
                       mDate.getFullYear() === anioActual;
              }).length;

              return (
                <DeudaCard
                  key={d.id}
                  deuda={d}
                  adelantadasHoy={adelantadas}
                  onPagar={() => handlePagar(d)}
                  onEliminar={() => handleEliminar(d.id, d.nombre)}
                />
              );
            })}



            
            {deudas.filter((d: Deuda) => !d.activa).length > 0 && (
              <View style={styles.pagadasSection}>
                <View style={styles.pagadasHeader}>
                  <MaterialCommunityIcons name="check-decagram" size={20} color={Theme.colors.secondary} />
                  <Text style={styles.pagadasTitle}>Deudas pagadas</Text>
                </View>
                {deudas.filter((d: Deuda) => !d.activa).map((d: Deuda) => (
                  <React.Fragment key={`pagada-${d.id}`}>
                    <View style={{ opacity: 0.6 }}>
                      <DeudaCard
                        deuda={d}
                        onPagar={() => {}}
                        onEliminar={() => handleEliminar(d.id, d.nombre)}
                      />
                    </View>
                  </React.Fragment>
                ))}


              </View>
            )}

          </>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>


      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: 85 + insets.bottom }]}
        onPress={() => { resetForm(); setModalVisible(true); }}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <ConfirmationModal
        visible={confirmDeleteVisible}
        onClose={() => setConfirmDeleteVisible(false)}
        onConfirm={onConfirmDelete}
        title="Eliminar deuda"
        message={
          (() => {
            const debt = deudas.find(d => d.id === selectedDeudaId);
            const pagos = debt?.pagosRealizados ?? 0;
            if (pagos > 0) {
              return `Esta deuda tiene ${pagos} pago(s) registrado(s). Si la eliminas se borrarán también todos los movimientos de gasto generados por sus cuotas. ¿Deseas continuar?`;
            }
            return "¿Deseas eliminar esta deuda?";
          })()
        }
        confirmLabel={(() => {
          const debt = deudas.find(d => d.id === selectedDeudaId);
          return (debt?.pagosRealizados ?? 0) > 0 ? "Sí, eliminar todo" : "Eliminar";
        })()}
        isDanger
      />


      <BottomSheet
        visible={pagarModalVisible}
        onClose={() => setPagarModalVisible(false)}
        title="Registrar pago"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            ¿Cuántas cuotas deseas pagar de <Text style={{ fontWeight: 'bold' }}>{selectedDeuda?.nombre}</Text>?
          </Text>
          
          <View style={styles.counterContainer}>
            <TouchableOpacity 
              onPress={() => setNumCuotasAPagar(Math.max(1, numCuotasAPagar - 1))}
              style={styles.counterBtn}
            >
              <MaterialCommunityIcons name="minus" size={24} color={Theme.colors.primary} />
            </TouchableOpacity>
            
            <Text style={styles.counterText}>{numCuotasAPagar}</Text>
            
            <TouchableOpacity 
              onPress={() => setNumCuotasAPagar(numCuotasAPagar + 1)}
              style={styles.counterBtn}
            >
              <MaterialCommunityIcons name="plus" size={24} color={Theme.colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.totalPagarBox}>
            <Text style={styles.totalPagarLabel}>Total a pagar ahora:</Text>
            <Text style={styles.totalPagarValue}>
              {formatMoney((selectedDeuda?.cuotaMensual || 0) * numCuotasAPagar)}
            </Text>
          </View>

          <Button
            label="Confirmar pago"
            onPress={onConfirmPagarMulti}
            variant="primary"
            size="lg"
            fullWidth
          />
        </View>
      </BottomSheet>



      <BottomSheet
        visible={modalVisible}
        onClose={() => { setModalVisible(false); resetForm(); }}
        title="Registrar deuda"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Input
            ref={nombreRef}
            label="Nombre de la deuda"
            placeholder="Ej: Préstamo banco, Tarjeta de crédito"
            value={nombre}
            onChangeText={v => { setNombre(v); setError(''); }}
            leftIcon="bank-outline"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => montoTotalRef.current?.focus()}
          />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1.2 }}>
              <Input
                ref={montoTotalRef}
                label="Monto préstamo ($)"
                placeholder="0.00"
                value={montoTotal}
                onChangeText={v => { setMontoTotal(v.replace(',', '.')); setError(''); }}
                keyboardType="decimal-pad"
                leftIcon="currency-usd"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => interesRef.current?.focus()}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                ref={interesRef}
                label="Interés %"
                placeholder="0"
                value={interes}
                onChangeText={v => { setInteres(v.replace(',', '.')); setError(''); }}
                keyboardType="decimal-pad"
                leftIcon="percent-outline"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => cuotaRef.current?.focus()}
              />
            </View>
          </View>

          <Input
            ref={cuotaRef}
            label="Cuota mensual pactada ($)"
            placeholder="0.00"
            value={cuota}
            onChangeText={v => { setCuota(v.replace(',', '.')); setError(''); }}
            keyboardType="decimal-pad"
            leftIcon="calendar-month-outline"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => inicioMesRef.current?.focus()}
          />

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Mes inicio</Text>
              <Input
                ref={inicioMesRef}
                placeholder="MM (1-12)"
                value={inicioMes}
                onChangeText={setInicioMes}
                keyboardType="number-pad"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => inicioAnioRef.current?.focus()}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Año inicio</Text>
              <Input
                ref={inicioAnioRef}
                placeholder="YYYY"
                value={inicioAnio}
                onChangeText={setInicioAnio}
                keyboardType="number-pad"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => finMesRef.current?.focus()}
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Mes fin</Text>
              <Input
                ref={finMesRef}
                placeholder="MM (1-12)"
                value={finMes}
                onChangeText={setFinMes}
                keyboardType="number-pad"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => finAnioRef.current?.focus()}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Año fin</Text>
              <Input
                ref={finAnioRef}
                placeholder="YYYY"
                value={finAnio}
                onChangeText={setFinAnio}
                keyboardType="number-pad"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => cuotaActualRef.current?.focus()}
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Input
                ref={cuotaActualRef}
                label="Cuota actual"
                placeholder="Ej: 3"
                value={cuotaActual}
                onChangeText={setCuotaActual}
                keyboardType="number-pad"
                leftIcon="numeric"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => diaPagoRef.current?.focus()}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                ref={diaPagoRef}
                label="Día vencimiento"
                placeholder="1-31"
                value={diaPago}
                onChangeText={setDiaPago}
                keyboardType="number-pad"
                leftIcon="clock-outline"
                returnKeyType="done"
                onSubmitEditing={handleGuardar}
              />
            </View>
          </View>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <Button
            label="Registrar deuda"
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
    paddingTop: Platform.OS === 'ios' ? 60 : 45,
  },
  title: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.extrabold,
    color: Theme.colors.text,
  },
  fab: {
    position: 'absolute',
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
  pagadasSection: {
    marginTop: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    paddingTop: Theme.spacing.md,
  },
  pagadasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Theme.spacing.md,
    marginLeft: 4,
  },
  pagadasTitle: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.textLight,
  },
  modalContent: {
    paddingVertical: 10,
  },
  modalText: {
    fontSize: 16,
    color: Theme.colors.text,
    marginBottom: 15,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 25,
  },
  counterText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  counterBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalPagarBox: {
    backgroundColor: Theme.colors.successLight,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 25,
  },
  totalPagarLabel: {
    fontSize: 14,
    color: Theme.colors.secondary,
    marginBottom: 5,
  },
  totalPagarValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.secondary,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Theme.colors.textLight,
    marginBottom: 4,
    marginLeft: 4,
  },
});





export default DeudasScreen;
