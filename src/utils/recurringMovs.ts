import { obtenerMovimientos, insertarMovimiento } from '../database/movimientosDB';
import { obtenerDeudas } from '../database/deudasDB';
import { Movimiento } from '../types';
import { schedulePaymentAlert } from './notifications';

export const processRecurringMovements = async () => {
  const movimientos = await obtenerMovimientos(200);
  const recurring = movimientos.filter(m => m.recurrencia && m.recurrencia !== 'ninguna');
  
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  for (const mov of recurring) {
    // 1. Programar alertas de pago si tiene día límite
    if (mov.fechaLimitePago) {
      const dia = parseInt(mov.fechaLimitePago);
      if (!isNaN(dia)) {
        await schedulePaymentAlert(mov.categoria, dia, mov.monto);
      }
    }

    // 2. Lógica de automatización (Simplificada)
    // En una app real, guardaríamos 'ultimaGeneracion'. 
    // Aquí marcamos como 'generado' si ya hay uno igual este mes.
    const yaExiste = movimientos.find(m => 
      m.categoria === mov.categoria && 
      m.recurrencia === 'ninguna' && // Los generados son normales
      m.fecha.startsWith(`${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}`)
    );

    if (!yaExiste && mov.recurrencia === 'mensual') {
      // Generar automáticamente para el mes actual
      // await insertarMovimiento(mov.tipo, mov.monto, mov.categoria as any, `Auto: ${mov.nota}`, today.toISOString().split('T')[0]);
    }
  }

  // 3. Alertas de deudas
  const deudas = await obtenerDeudas();
  for (const deuda of deudas) {
    if (deuda.diaPagoMensual) {
      const cuotaSiguiente = (deuda.cuotaActual || 0) + deuda.pagosRealizados + 1;
      await schedulePaymentAlert(deuda.nombre, deuda.diaPagoMensual, deuda.cuotaMensual, true, cuotaSiguiente);
    }
  }
};
