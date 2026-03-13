import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Theme from '../../theme';
import { useFinanzasStore } from '../../store/finanzasStore';
import { obtenerResumenMes, obtenerMovimientosPorMes } from '../../database/movimientosDB';
import { formatMoney } from '../../utils/formatters';
import Card from '../../components/common/Card';
import SummaryRow from '../../components/common/SummaryRow';

const HistoricoScreen: React.FC = () => {
  const [selectedMes, setSelectedMes] = useState(new Date().getMonth() + 1);
  const [selectedAnio, setSelectedAnio] = useState(new Date().getFullYear());
  const [resumen, setResumen] = useState({ totalIngresos: 0, totalGastos: 0, balance: 0 });
  const [numMovimientos, setNumMovimientos] = useState(0);
  const [pagosDeuda, setPagosDeuda] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);


  const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const ANIOS = [2024, 2025, 2026];

  const cargarDatos = async () => {
    setCargando(true);
    const res = await obtenerResumenMes(selectedMes, selectedAnio);
    const movs = await obtenerMovimientosPorMes(selectedMes, selectedAnio);
    setResumen(res);
    setNumMovimientos(movs.length);
    setPagosDeuda(movs.filter(m => m.categoria === 'Deuda' || m.categoria === 'deuda'));

    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();
  }, [selectedMes, selectedAnio]);

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [selectedMes, selectedAnio])
  );


  const cambiarMes = (diff: number) => {
    let nextMes = selectedMes + diff;
    let nextAnio = selectedAnio;
    if (nextMes > 12) {
      nextMes = 1;
      nextAnio++;
    } else if (nextMes < 1) {
      nextMes = 12;
      nextAnio--;
    }
    if (ANIOS.includes(nextAnio)) {
      setSelectedMes(nextMes);
      setSelectedAnio(nextAnio);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico</Text>
        <Text style={styles.subtitle}>Consulta registros pasados</Text>
      </View>

      <View style={styles.selector}>
        <TouchableOpacity onPress={() => cambiarMes(-1)} style={styles.selBtn}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={Theme.colors.primary} />
        </TouchableOpacity>
        <View style={styles.selCenter}>
          <Text style={styles.selMes}>{MESES[selectedMes - 1]}</Text>
          <Text style={styles.selAnio}>{selectedAnio}</Text>
        </View>
        <TouchableOpacity onPress={() => cambiarMes(1)} style={styles.selBtn}>
          <MaterialCommunityIcons name="chevron-right" size={28} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {numMovimientos === 0 && !cargando ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="calendar-blank" size={60} color={Theme.colors.border} />
            <Text style={styles.emptyText}>Sin registros para este período.</Text>
          </View>
        ) : (
          <>
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Resumen Financiero</Text>
              <SummaryRow
                label="Total Ingresos"
                amount={resumen.totalIngresos}
                type="ingreso"
                icon="arrow-up-circle-outline"
              />
              <SummaryRow
                label="Total Gastos"
                amount={resumen.totalGastos}
                type="gasto"
                icon="arrow-down-circle-outline"
              />
              <View style={styles.divider} />
              <SummaryRow
                label="Balance Neto"
                amount={resumen.balance}
                type="balance"
                icon="scale-balance"
              />
            </Card>

            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Estadísticas</Text>
              <View style={styles.statRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{numMovimientos}</Text>
                  <Text style={styles.statLabel}>Movimientos</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{pagosDeuda.length}</Text>
                  <Text style={styles.statLabel}>Pagos de deuda</Text>
                </View>

              </View>
            </Card>

            {pagosDeuda.length > 0 && (
              <Card style={styles.card}>

                <Text style={styles.cardTitle}>Detalle de Pagos</Text>
                {pagosDeuda.map((p: any, idx: number) => (
                  <React.Fragment key={p.id || idx}>
                    <View style={styles.pagoItem}>
                      <View style={styles.pagoIcon}>
                        <MaterialCommunityIcons name="credit-card-check-outline" size={20} color={Theme.colors.secondary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.pagoNombre}>{p.nota}</Text>
                        <Text style={styles.pagoTag}>💳 Pago de cuota</Text>
                      </View>
                      <Text style={styles.pagoMonto}>-{formatMoney(p.monto)}</Text>
                    </View>
                    {idx < pagosDeuda.length - 1 && <View style={styles.divider} />}
                  </React.Fragment>
                ))}

              </Card>
            )}


            <View style={styles.infoBox}>
              <MaterialCommunityIcons name="information-outline" size={18} color={Theme.colors.textLight} />
              <Text style={styles.infoText}>
                Los datos históricos se basan en los registros realizados en cada mes.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
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
  subtitle: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textLight,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    gap: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selBtn: {
    padding: 8,
  },
  selCenter: {
    alignItems: 'center',
    minWidth: 120,
  },
  selMes: {
    fontSize: 20,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  selAnio: {
    fontSize: 14,
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  content: {
    padding: Theme.spacing.md,
  },
  card: {
    marginBottom: Theme.spacing.md,
  },
  cardTitle: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginVertical: Theme.spacing.sm,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Theme.colors.textLight,
    marginTop: 4,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    gap: 20,
  },
  emptyText: {
    color: Theme.colors.textLight,
    fontSize: Theme.typography.fontSize.base,
  },
  infoBox: {
    flexDirection: 'row',
    padding: Theme.spacing.md,
    gap: 10,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: Theme.colors.textLight,
    fontStyle: 'italic',
  },
  pagoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  pagoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0FFF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pagoNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  pagoTag: {
    fontSize: 11,
    color: Theme.colors.secondary,
    fontWeight: '700',
    marginTop: 2,
  },
  pagoMonto: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Theme.colors.danger,
  },
});


export default HistoricoScreen;
