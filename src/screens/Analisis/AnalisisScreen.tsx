import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import Theme from '../../theme';
import { useFinanzasStore } from '../../store/finanzasStore';
import Card from '../../components/common/Card';
import BarChart from '../../components/common/BarChart';
import AlertCard from '../../components/common/AlertCard';
import EmptyState from '../../components/common/EmptyState';
import { categoryIconMap } from '../../utils/categoryIcons';
import { formatMoney } from '../../utils/formatters';
import { Categoria } from '../../types';

const CAT_COLORS = [
  '#0A2463','#00C896','#F4A261','#E63946',
  '#A855F7','#3B82F6','#14B8A6','#F59E0B','#6B7A99',
];

const ESTRATEGIAS = [
  'Divide tu salario el mismo día que lo recibes en: comida, transporte, ahorros y emergencias.',
  'Autoriza un ahorro obligatorio del 10% antes de gastar.',
  'Registra diariamente todo lo que gastas, sin excepción.',
  'Define un presupuesto de gastos para comida, transporte y compras.',
  'Compra mañana lo que se te antoja hoy. Evita compras impulsivas.',
  'Compra lo repetitivo al por mayor para ahorrar a largo plazo.',
  'Elimina pequeños gastos uno a uno, poco a poco.',
  'Crea un fondo de emergencia equivalente a un sueldo completo.',
  'Si tu estilo de vida crece más rápido que tu salario, te empobreces.',
  'Invierte en conocimiento primero, luego el dinero crece.',
];

const AnalisisScreen: React.FC = () => {
  const {
    gastosPorCategoria, gastosHormiga, resumenMes, movimientos,
    mesActual, anioActual,
  } = useFinanzasStore();

  const MESES = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
  ];

  const mesNombre = `${MESES[mesActual - 1]} ${anioActual}`;

  // Barras de categorías
  const chartData = gastosPorCategoria.slice(0, 7).map((item, i) => ({
    label: item.categoria,
    value: item.total,
    color: CAT_COLORS[i % CAT_COLORS.length],
  }));

  // Alertas generadas
  const alertas = useMemo(() => {
    const arr: Array<{ type: 'warning' | 'danger' | 'success' | 'info'; title: string; message: string }> = [];

    if (resumenMes.balance < 0) {
      arr.push({
        type: 'danger',
        title: '⚠️ Balance negativo',
        message: `Gastaste ${formatMoney(resumenMes.totalGastos - resumenMes.totalIngresos)} más de tus ingresos.`,
      });
    } else if (resumenMes.balance > 0) {
      arr.push({
        type: 'success',
        title: '✅ Sobrante',
        message: `Tienes ${formatMoney(resumenMes.balance)} para ahorrar o invertir.`,
      });
    }

    if (gastosHormiga.total > 0) {
      arr.push({
        type: 'warning',
        title: '🐜 Gasto Hormiga',
        message: `Estos pequeños gastos suman ${formatMoney(gastosHormiga.total)} este mes.`,
      });
    }

    if (gastosPorCategoria.length > 0) {
      const top = gastosPorCategoria[0];
      arr.push({
        type: 'info',
        title: `📊 Top Gasto: ${top.categoria}`,
        message: `${Math.round((top.total / resumenMes.totalGastos) * 100)}% del total mensual.`,
      });
    }

    return arr;
  }, [resumenMes, gastosHormiga, gastosPorCategoria]);

  // Proyección anual del gasto actual
  const proyeccionAnual = resumenMes.totalGastos * 12;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Análisis Financiero</Text>
        <Text style={styles.subtitle}>{mesNombre}</Text>

        {/* Alertas */}
        {alertas.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <MaterialCommunityIcons name="bell-outline" size={16} /> Alertas resumidas
            </Text>
            <View style={styles.alertContainer}>
              {alertas.map((a, i) => (
                <AlertCard key={i} type={a.type} title={a.title} message={a.message} compact />
              ))}
            </View>
          </View>
        )}

        {/* Gastos por categoría */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Gastos por categoría</Text>
          {chartData.length === 0 ? (
            <EmptyState
              icon="chart-bar"
              title="Sin datos de gastos"
              description="Registra gastos para ver el análisis por categoría"
            />
          ) : (
            <BarChart data={chartData} />
          )}
        </Card>

        {/* Proyección anual */}
        {resumenMes.totalGastos > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Proyección anual</Text>
            <View style={styles.proyeccionRow}>
              <MaterialCommunityIcons
                name="calendar-arrow-right"
                size={28}
                color={Theme.colors.primary}
              />
              <View style={styles.proyeccionInfo}>
                <Text style={styles.proyeccionAmount}>{formatMoney(proyeccionAnual)}</Text>
                <Text style={styles.proyeccionLabel}>
                  Gasto proyectado a 12 meses
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Gastos hormiga */}
        {gastosHormiga.total > 0 && (
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="bug-outline" size={20} color={Theme.colors.danger} />
              <Text style={[styles.sectionTitle, { marginLeft: 6, marginBottom: 0 }]}>
                Gastos Hormiga
              </Text>
            </View>
            <View style={styles.hormigaBox}>
               <Text style={styles.hormigaTotalText}>
                 🐜 Llevas <Text style={styles.hormigaBigAmount}>{formatMoney(gastosHormiga.total)}</Text> acumulados.
               </Text>
               <Text style={styles.hormigaCount}>
                 Son {gastosHormiga.cantidad} pequeños gastos este mes.
               </Text>
            </View>
          </Card>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: Theme.spacing.md },
  title: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.extrabold,
    color: Theme.colors.text,
    paddingTop: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.textLight,
    marginBottom: Theme.spacing.md,
    marginTop: 2,
  },
  section: { marginBottom: Theme.spacing.md },
  sectionTitle: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  alertContainer: {
    marginTop: 4,
  },
  proyeccionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#E8EDFF',
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
  },
  proyeccionInfo: { flex: 1 },
  proyeccionAmount: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.extrabold,
    color: Theme.colors.primary,
  },
  proyeccionLabel: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textLight,
    marginTop: 2,
  },
  hormigaBox: {
    backgroundColor: Theme.colors.dangerLight,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(230, 57, 70, 0.1)',
  },
  hormigaTotalText: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text,
    marginBottom: 4,
  },
  hormigaBigAmount: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.danger,
  },
  hormigaCount: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textLight,
  },
});

export default AnalisisScreen;
