import { create } from 'zustand';
import { useTesoreriaStore, Movimiento, TipoMovimiento } from './tesoreriaStore';
import { useExpedienteStore } from './expedienteStore';
import { useUIStore } from './uiStore';
import moment from 'moment';

// Interfaces
export interface ExpedienteFinanzas {
  expedienteId: string;
  ingresos: number;
  egresos: number;
  balance: number;
  movimientos: number[];
  rentabilidad: number;
  tiempoTotal: number; // en días
  eficiencia: number; // ingresos por día
}

export interface CostoPromedio {
  tipo: string;
  cantidad: number;
  costoPromedio: number;
  tiempoPromedio: number;
  eficienciaPromedio: number;
}

export interface ExpedienteMovimientoState {
  expedienteFinanzas: ExpedienteFinanzas[];
  costosPromedioTipo: CostoPromedio[];
  movimientoSeleccionado: Movimiento | null;
  expedienteSeleccionado: string | null;
  loading: boolean;
  error: string | null;

  // Acciones
  fetchExpedienteFinanzas: () => Promise<void>;
  vincularMovimientoAExpediente: (movimientoId: number, expedienteId: string) => Promise<void>;
  desvincularMovimiento: (movimientoId: number) => Promise<void>;
  calcularRentabilidadExpediente: (expedienteId: string) => Promise<ExpedienteFinanzas | null>;
  calcularCostosPromedioTipo: () => Promise<CostoPromedio[]>;
  getMovimientosPorExpediente: (expedienteId: string) => Movimiento[];
  getExpedientesConFinanzas: () => ExpedienteFinanzas[];
  setExpedienteSeleccionado: (expedienteId: string | null) => void;
}

// Store
export const useExpedienteMovimientoStore = create<ExpedienteMovimientoState>((set, get) => ({
  expedienteFinanzas: [],
  costosPromedioTipo: [],
  movimientoSeleccionado: null,
  expedienteSeleccionado: null,
  loading: false,
  error: null,

  // Cargar datos financieros de todos los expedientes
  fetchExpedienteFinanzas: async () => {
    try {
      set({ loading: true, error: null });

      // Obtener datos de ambos stores
      const { movimientos } = useTesoreriaStore.getState();
      const { expedientes } = useExpedienteStore.getState();

      if (!expedientes.length) {
        await useExpedienteStore.getState().fetchExpedientes();
      }

      if (!movimientos.length) {
        await useTesoreriaStore.getState().fetchMovimientos();
      }

      // Recalcular datos para todos los expedientes
      const finanzasCalculadas: ExpedienteFinanzas[] = [];

      // Recalcular datos para cada expediente
      for (const expediente of expedientes) {
        const finanzas = await get().calcularRentabilidadExpediente(expediente.id);
        if (finanzas) {
          finanzasCalculadas.push(finanzas);
        }
      }

      // Calcular costos promedio por tipo
      const costosPromedio = await get().calcularCostosPromedioTipo();

      set({
        expedienteFinanzas: finanzasCalculadas,
        costosPromedioTipo: costosPromedio,
        loading: false
      });
    } catch (error) {
      console.error('Error al cargar finanzas de expedientes:', error);
      set({
        error: 'Error al cargar los datos financieros de expedientes',
        loading: false
      });
    }
  },

  // Vincular un movimiento a un expediente
  vincularMovimientoAExpediente: async (movimientoId, expedienteId) => {
    try {
      set({ loading: true, error: null });

      const tesoreriaStore = useTesoreriaStore.getState();
      const expedienteStore = useExpedienteStore.getState();

      // Verificar que existan tanto el movimiento como el expediente
      const movimiento = tesoreriaStore.movimientos.find(m => m.id === movimientoId);
      const expediente = expedienteStore.expedientes.find(e => e.id === expedienteId);

      if (!movimiento) {
        throw new Error('Movimiento no encontrado');
      }

      if (!expediente) {
        throw new Error('Expediente no encontrado');
      }

      // Actualizar el movimiento con el ID del expediente
      await tesoreriaStore.updateMovimiento(movimientoId, { expedienteId: parseInt(expedienteId) });

      // Recalcular finanzas para el expediente
      const finanzasActualizadas = await get().calcularRentabilidadExpediente(expedienteId);

      // Actualizar el estado
      set(state => ({
        expedienteFinanzas: state.expedienteFinanzas.map(ef =>
          ef.expedienteId === expedienteId ? (finanzasActualizadas || ef) : ef
        ),
        loading: false
      }));

      // Notificar éxito
      useUIStore.getState().addNotification({
        type: 'success',
        message: `Movimiento vinculado correctamente al expediente ${expediente.numero}`
      });
    } catch (error) {
      console.error('Error al vincular movimiento:', error);
      let mensaje = 'Error al vincular el movimiento al expediente';
      if (error instanceof Error) {
        mensaje = error.message;
      }
      set({ error: mensaje, loading: false });

      // Notificar error
      useUIStore.getState().addNotification({
        type: 'error',
        message: mensaje
      });
    }
  },

  // Desvincular un movimiento de un expediente
  desvincularMovimiento: async (movimientoId) => {
    try {
      set({ loading: true, error: null });

      const tesoreriaStore = useTesoreriaStore.getState();

      // Encontrar el movimiento
      const movimiento = tesoreriaStore.movimientos.find(m => m.id === movimientoId);

      if (!movimiento) {
        throw new Error('Movimiento no encontrado');
      }

      const expedienteIdAnterior = movimiento.expedienteId;

      if (!expedienteIdAnterior) {
        throw new Error('El movimiento no está vinculado a ningún expediente');
      }

      // Actualizar el movimiento quitando el expediente
      await tesoreriaStore.updateMovimiento(movimientoId, { expedienteId: undefined });

      // Recalcular finanzas para el expediente afectado
      if (expedienteIdAnterior) {
        const finanzasActualizadas = await get().calcularRentabilidadExpediente(expedienteIdAnterior.toString());

        // Actualizar el estado
        set(state => ({
          expedienteFinanzas: state.expedienteFinanzas.map(ef =>
            ef.expedienteId === expedienteIdAnterior.toString() ? (finanzasActualizadas || ef) : ef
          ),
          loading: false
        }));
      }

      // Notificar éxito
      useUIStore.getState().addNotification({
        type: 'success',
        message: 'Movimiento desvinculado del expediente correctamente'
      });
    } catch (error) {
      console.error('Error al desvincular movimiento:', error);
      let mensaje = 'Error al desvincular el movimiento del expediente';
      if (error instanceof Error) {
        mensaje = error.message;
      }
      set({ error: mensaje, loading: false });

      // Notificar error
      useUIStore.getState().addNotification({
        type: 'error',
        message: mensaje
      });
    }
  },

  // Calcular rentabilidad y estadísticas para un expediente específico
  calcularRentabilidadExpediente: async (expedienteId) => {
    try {
      const { movimientos } = useTesoreriaStore.getState();
      const { expedientes } = useExpedienteStore.getState();

      const expediente = expedientes.find(e => e.id === expedienteId);
      if (!expediente) {
        console.error(`Expediente con ID ${expedienteId} no encontrado`);
        return null;
      }

      // Filtrar movimientos del expediente
      const movimientosExpediente = movimientos.filter(
        m => m.expedienteId?.toString() === expedienteId && m.estado !== 'anulado'
      );

      if (movimientosExpediente.length === 0) {
        // Expediente sin movimientos asociados
        return {
          expedienteId,
          ingresos: 0,
          egresos: 0,
          balance: 0,
          movimientos: [],
          rentabilidad: 0,
          tiempoTotal: 0,
          eficiencia: 0
        };
      }

      // Calcular ingresos y egresos
      const ingresos = movimientosExpediente
        .filter(m => m.tipo === 'ingreso')
        .reduce((sum, m) => sum + m.monto, 0);

      const egresos = movimientosExpediente
        .filter(m => m.tipo === 'egreso')
        .reduce((sum, m) => sum + m.monto, 0);

      // Calcular balance
      const balance = ingresos - egresos;

      // Calcular tiempo total (desde inicio hasta fin o hasta hoy si está abierto)
      const fechaInicio = expediente.fechaInicio;
      const fechaFin = expediente.fechaFin || new Date();
      const tiempoTotal = moment(fechaFin).diff(moment(fechaInicio), 'days');

      // Calcular eficiencia (ingresos por día)
      const eficiencia = tiempoTotal > 0 ? balance / tiempoTotal : 0;

      // Calcular rentabilidad (relación ingresos/egresos)
      const rentabilidad = egresos > 0 ? ((ingresos - egresos) / egresos) * 100 : 0;

      return {
        expedienteId,
        ingresos,
        egresos,
        balance,
        movimientos: movimientosExpediente.map(m => m.id),
        rentabilidad,
        tiempoTotal,
        eficiencia
      };
    } catch (error) {
      console.error('Error al calcular rentabilidad:', error);
      return null;
    }
  },

  // Calcular costos promedio por tipo de caso legal
  calcularCostosPromedioTipo: async () => {
    try {
      const { movimientos } = useTesoreriaStore.getState();
      const { expedientes } = useExpedienteStore.getState();

      // Agrupar expedientes por tipo
      const expedientesPorTipo: Record<string, any[]> = {};

      expedientes.forEach(expediente => {
        const tipo = expediente.tipo || 'OTRO';
        if (!expedientesPorTipo[tipo]) {
          expedientesPorTipo[tipo] = [];
        }
        expedientesPorTipo[tipo].push(expediente);
      });

      // Calcular costos promedio para cada tipo
      const resultado: CostoPromedio[] = [];

      for (const tipo in expedientesPorTipo) {
        const expedientesTipo = expedientesPorTipo[tipo];
        let costoTotal = 0;
        let ingresoTotal = 0;
        let tiempoTotal = 0;
        let expedientesConMovimientos = 0;

        for (const expediente of expedientesTipo) {
          const finanzas = await get().calcularRentabilidadExpediente(expediente.id);
          if (finanzas && (finanzas.ingresos > 0 || finanzas.egresos > 0)) {
            costoTotal += finanzas.egresos;
            ingresoTotal += finanzas.ingresos;
            tiempoTotal += finanzas.tiempoTotal;
            expedientesConMovimientos++;
          }
        }

        if (expedientesConMovimientos > 0) {
          resultado.push({
            tipo,
            cantidad: expedientesConMovimientos,
            costoPromedio: costoTotal / expedientesConMovimientos,
            tiempoPromedio: tiempoTotal / expedientesConMovimientos,
            eficienciaPromedio: (ingresoTotal - costoTotal) / tiempoTotal
          });
        }
      }

      return resultado;
    } catch (error) {
      console.error('Error al calcular costos promedio:', error);
      return [];
    }
  },

  // Obtener todos los movimientos asociados a un expediente
  getMovimientosPorExpediente: (expedienteId) => {
    const { movimientos } = useTesoreriaStore.getState();
    return movimientos.filter(m => m.expedienteId?.toString() === expedienteId);
  },

  // Obtener todos los expedientes con sus datos financieros
  getExpedientesConFinanzas: () => {
    return get().expedienteFinanzas;
  },

  // Seleccionar un expediente para análisis
  setExpedienteSeleccionado: (expedienteId) => {
    set({ expedienteSeleccionado: expedienteId });
  }
}));
