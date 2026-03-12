import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Theme from '../../theme';
import { useFinanzasStore } from '../../store/finanzasStore';
import { useConfigStore } from '../../store/configStore';
import HeroCard from '../../components/common/HeroCard';
import SummaryRow from '../../components/common/SummaryRow';
import MovimientoItem from '../../components/common/MovimientoItem';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import DashboardSkeleton from '../../components/skeletons/DashboardSkeleton';
import { formatMoney } from '../../utils/formatters';

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];

const DashboardScreen: React.FC = () => {
  const {
    movimientos, deudas, resumenMes, cargando, cargarTodo,
    mesActual, anioActual,
  } = useFinanzasStore();
  const { config } = useConfigStore();

  const totalDeudas = deudas.reduce((acc, d) => {
    const restante = d.montoTotal - (d.pagosRealizados * d.cuotaMensual);
    return acc + Math.max(restante, 0);
  }, 0);

  const mesNombre = `${MESES[mesActual - 1]} ${anioActual}`;
  const ultimos = movimientos.slice(0, 5);

  if (cargando && movimientos.length === 0) return <DashboardSkeleton />;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={cargando} onRefresh={cargarTodo}
            colors={[Theme.colors.primary]}
            tintColor={Theme.colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>MonetariaX</Text>
          <View style={styles.logoBadge}>
            <MaterialCommunityIcons name="cash-fast" size={20} color={Theme.colors.secondary} />
          </View>
        </View>

        {/* Hero Card */}
        <HeroCard
          balance={resumenMes.balance}
          nombre={config.nombre}
          mes={mesNombre}
        />

        {/* Ingresos y Gastos */}
        <Card>
          <Text style={styles.sectionTitle}>Resumen del mes</Text>
          <SummaryRow
            label="Ingresos"
            amount={resumenMes.totalIngresos}
            icon="arrow-down-circle-outline"
            iconColor={Theme.colors.secondary}
            iconBg={Theme.colors.successLight}
          />
          <View style={styles.divider} />
          <SummaryRow
            label="Gastos"
            amount={resumenMes.totalGastos}
            icon="arrow-up-circle-outline"
            iconColor={Theme.colors.danger}
            iconBg={Theme.colors.dangerLight}
          />
          {totalDeudas > 0 && (
            <>
              <View style={styles.divider} />
              <SummaryRow
                label="Total en deudas"
                amount={totalDeudas}
                icon="credit-card-outline"
                iconColor={Theme.colors.accent}
                iconBg={Theme.colors.warningLight}
              />
            </>
          )}
        </Card>

        {/* Últimos movimientos */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Últimos movimientos</Text>
        </View>

        {ultimos.length === 0 ? (
          <EmptyState
            icon="swap-vertical-circle-outline"
            title="Sin movimientos este mes"
            description="Registra tu primer ingreso o gasto tocando la pestaña Movimientos"
          />
        ) : (
          ultimos.map(m => (
            <MovimientoItem key={m.id} movimiento={m} />
          ))
        )}

        {/* Estrategia del día */}
        <Card style={styles.estrategiaCard}>
          <View style={styles.estrategiaHeader}>
            <MaterialCommunityIcons
              name="lightbulb-on-outline"
              size={22}
              color={Theme.colors.accent}
            />
            <Text style={styles.estrategiaTitle}>Estrategia del día</Text>
          </View>
          <Text style={styles.estrategiaText}>
            💰 Divide tu salario el mismo día que lo recibes: separa comida,
            transporte, ahorros y emergencias antes de gastar.
          </Text>
        </Card>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
  scroll: { flex: 1 },
  content: { padding: Theme.spacing.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    paddingTop: Theme.spacing.sm,
  },
  appTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.extrabold,
    color: Theme.colors.primary,
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  sectionHeader: {
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginVertical: 4,
  },
  estrategiaCard: {
    backgroundColor: Theme.colors.primary,
    marginTop: Theme.spacing.sm,
  },
  estrategiaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
    gap: 8,
  },
  estrategiaTitle: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.bold,
    color: '#FFFFFF',
    marginLeft: 6,
  },
  estrategiaText: {
    fontSize: Theme.typography.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
  },
});

export default DashboardScreen;
