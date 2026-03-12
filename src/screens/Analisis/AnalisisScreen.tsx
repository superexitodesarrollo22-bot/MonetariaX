import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
} from 'react-native';
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
        title: '⚠️ Gastos superan ingresos',
        message: `Este mes gastaste ${formatMoney(resumenMes.totalGastos - resumenMes.totalIngresos)} más de lo que ganaste. Revisa tus categorías de mayor gasto.`,
      });
    } else if (resumenMes.balance > 0) {
      arr.push({
        type: 'success',
        title: '✅ Buen balance mensual',
        message: `Tienes ${formatMoney(resumenMes.balance)} de sobrante este mes. Considera ahorrarlo o invertirlo.`,
      });
    }

    gastosHormiga.slice(0, 3).forEach(g => {
      arr.push({
        type: 'warning',
        title: `🐜 Gasto hormiga: ${g.categoria}`,
        message: `Gastaste ${formatMoney(g.diferencia)} más en "${g.categoria}" que el mes pasado. En un año eso sería ${formatMoney(g.diferencia * 12)} extra.`,
      });
    });

    if (gastosPorCategoria.length > 0) {
      const top = gastosPorCategoria[0];
      arr.push({
        type: 'info',
        title: `📊 Mayor gasto: ${top.categoria}`,
        message: `En "${top.categoria}" llevas ${formatMoney(top.total)} este mes, que representa el ${Math.round((top.total / resumenMes.totalGastos) * 100)}% de tus gastos totales.`,
      });
    }

    return arr;
  }, [resumenMes, gastosHormiga, gastosPorCategoria]);

  // Estrategia del día (rotatoria por día del mes)
  const estrategiaIndex = (new Date().getDate() - 1) % ESTRATEGIAS.length;
  const estrategiaHoy = ESTRATEGIAS[estrategiaIndex];

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
              <MaterialCommunityIcons name="bell-outline" size={16} /> Alertas
            </Text>
            {alertas.map((a, i) => (
              <AlertCard key={i} type={a.type} title={a.title} message={a.message} />
            ))}
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
                  Así gastarás en 12 meses si mantienes este ritmo
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Gastos hormiga */}
        {gastosHormiga.length > 0 && (
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="bug-outline" size={20} color={Theme.colors.danger} />
              <Text style={[styles.sectionTitle, { marginLeft: 6, marginBottom: 0 }]}>
                Gastos hormiga detectados
              </Text>
            </View>
            <Text style={styles.hormigatip}>
              Estos gastos subieron respecto al mes anterior. Pequeños, pero se acumulan.
            </Text>
            {gastosHormiga.map((g, i) => (
              <View key={i} style={styles.hormigaRow}>
                <MaterialCommunityIcons
                  name={(categoryIconMap[g.categoria as Categoria]?.name || 'dots-horizontal-circle-outline') as any}
                  size={20}
                  color={categoryIconMap[g.categoria as Categoria]?.color || Theme.colors.textLight}
                />
                <Text style={styles.hormigaCat}>{g.categoria}</Text>
                <View style={styles.hormigaRight}>
                  <Text style={styles.hormigaActual}>{formatMoney(g.totalMesActual)}</Text>
                  <Text style={styles.hormigaDiff}>+{formatMoney(g.diferencia)} vs mes ant.</Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* Estrategias de Oro */}
        <Card style={[styles.section, styles.estrategiaCard]}>
          <View style={styles.estrategiaHeader}>
            <MaterialCommunityIcons name="star-outline" size={20} color={Theme.colors.accent} />
            <Text style={[styles.sectionTitle, styles.estrategiaTitleText]}>
              Estrategia de Oro del día
            </Text>
          </View>
          <Text style={styles.estrategiaText}>"{estrategiaHoy}"</Text>
        </Card>

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
  hormigatip: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textLight,
    marginBottom: Theme.spacing.sm,
  },
  hormigaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    gap: 10,
  },
  hormigaCat: {
    flex: 1,
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.text,
    textTransform: 'capitalize',
    marginLeft: 6,
  },
  hormigaRight: { alignItems: 'flex-end' },
  hormigaActual: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
  },
  hormigaDiff: {
    fontSize: 11,
    color: Theme.colors.danger,
    marginTop: 2,
  },
  estrategiaCard: { backgroundColor: Theme.colors.primary },
  estrategiaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Theme.spacing.sm,
  },
  estrategiaTitleText: {
    color: '#FFFFFF',
    marginBottom: 0,
    marginLeft: 6,
  },
  estrategiaText: {
    fontSize: Theme.typography.fontSize.base,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 24,
    fontStyle: 'italic',
  },
});

export default AnalisisScreen;
