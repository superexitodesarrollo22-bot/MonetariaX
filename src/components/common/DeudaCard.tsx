import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Theme from '../../theme';
import { Deuda } from '../../types';
import { formatMoney, formatDate } from '../../utils/formatters';


interface DeudaCardProps {
  deuda: Deuda;
  onPagar: () => void;
  onEliminar: () => void;
  adelantadasHoy?: number; // Cuotas pagadas en el mes actual
}


const DeudaCard: React.FC<DeudaCardProps> = ({ deuda, onPagar, onEliminar, adelantadasHoy = 0 }) => {
  const totalCuotas = deuda.totalCuotas || 1;
  const cuotaEnLaQueVa = deuda.cuotaActual;
  const totalAPagar = totalCuotas * deuda.cuotaMensual;
  const totalIntereses = totalAPagar - deuda.montoTotal;
  
  const progreso = cuotaEnLaQueVa / totalCuotas;
  const cuotasRestantes = Math.max(totalCuotas - cuotaEnLaQueVa, 0);
  const montoPagado = cuotaEnLaQueVa * deuda.cuotaMensual;
  const montoRestante = cuotasRestantes * deuda.cuotaMensual;
  const fechaFin = deuda.fechaFinalizacion;


  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name="credit-card-outline" size={22} color={Theme.colors.accent} />
        </View>
        <View style={styles.nameWrap}>
          <Text style={styles.nombre} numberOfLines={1}>{deuda.nombre}</Text>
          <Text style={styles.cuota}>Cuota: {formatMoney(deuda.cuotaMensual)}/mes</Text>
        </View>
        <TouchableOpacity onPress={onEliminar} style={styles.deleteBtn}>
          <MaterialCommunityIcons name="trash-can-outline" size={18} color={Theme.colors.textLight} />
        </TouchableOpacity>
      </View>

      {/* Barra de progreso */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${Math.min(progreso * 100, 100)}%` }]} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Theme.spacing.md, alignItems: 'center' }}>
        <Text style={[styles.progressText, { marginBottom: 0 }]}>
          {cuotaEnLaQueVa} de {totalCuotas} cuotas pagadas ({Math.round(progreso * 100)}%)
        </Text>
        {adelantadasHoy > 0 && (
          <View style={styles.adelantoTag}>
            <MaterialCommunityIcons name="check-decagram" size={14} color={Theme.colors.success} />
            <Text style={styles.adelantoText}>Adelantaste {adelantadasHoy}</Text>
          </View>
        )}
      </View>



      {/* Detalles */}
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Pagado hasta ahora</Text>
          <Text style={[styles.detailValue, { color: Theme.colors.secondary }]}>{formatMoney(montoPagado)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Total intereses</Text>
          <Text style={[styles.detailValue, { color: Theme.colors.danger }]}>
            {formatMoney(totalIntereses)}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Falta por pagar</Text>
          <Text style={[styles.detailValue, { color: Theme.colors.accent }]}>
            {formatMoney(montoRestante)}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Vence</Text>
          <Text style={styles.detailValue}>{formatDate(fechaFin, { month: 'long', year: 'numeric' })}</Text>
        </View>

      </View>


      {cuotasRestantes > 0 && (
        <TouchableOpacity style={styles.pagarBtn} onPress={onPagar} activeOpacity={0.85}>
          <MaterialCommunityIcons name="check-circle-outline" size={18} color="#FFFFFF" />
          <Text style={styles.pagarText}>Registrar cuota pagada</Text>
        </TouchableOpacity>
      )}

      {cuotasRestantes === 0 && (
        <View style={styles.pagadaTag}>
          <MaterialCommunityIcons name="check-all" size={16} color={Theme.colors.secondary} />
          <Text style={styles.pagadaText}>¡Deuda completamente pagada!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Theme.colors.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.sm,
  },
  nameWrap: { flex: 1 },
  nombre: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
  },
  cuota: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textLight,
    marginTop: 2,
  },
  deleteBtn: { padding: 6 },
  progressBg: {
    height: 8,
    backgroundColor: Theme.colors.border,
    borderRadius: 4,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Theme.colors.secondary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textLight,
    marginBottom: Theme.spacing.md,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: Theme.spacing.md,
  },
  detailItem: {
    width: '47%',
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.sm,
    padding: Theme.spacing.xs,
  },
  detailLabel: {
    fontSize: 11,
    color: Theme.colors.textLight,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
  },
  pagarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.secondary,
    borderRadius: Theme.borderRadius.md,
    padding: 12,
    gap: 8,
  },
  pagarText: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: '#FFFFFF',
    marginLeft: 6,
  },
  pagadaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.successLight,
    borderRadius: Theme.borderRadius.md,
    padding: 10,
    gap: 6,
  },
  pagadaText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.secondary,
    fontWeight: Theme.typography.fontWeight.semibold,
    marginLeft: 6,
  },

  adelantoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  adelantoText: {
    fontSize: 10,
    color: Theme.colors.success,
    fontWeight: 'bold',
  },
});

export default DeudaCard;

