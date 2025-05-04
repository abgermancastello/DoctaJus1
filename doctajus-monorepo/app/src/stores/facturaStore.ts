import { create } from 'zustand';
import moment from 'moment';
import { Movimiento, Cliente, useTesoreriaStore } from './tesoreriaStore';

// Definición de tipos
export type EstadoFactura = 'borrador' | 'emitida' | 'pagada' | 'vencida' | 'anulada';

// Interfaces
export interface DetalleFactura {
  id: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  impuesto: number; // Porcentaje (ej: 21 para 21%)
  subtotal: number;
}

// Interfaces para gestión avanzada de cobros
export interface RecordatorioPago {
  id: number;
  facturaId: number;
  fechaEnvio: Date;
  tipo: 'email' | 'sms' | 'llamada';
  estado: 'pendiente' | 'enviado' | 'fallido';
  mensaje: string;
}

export interface CuotaPlanPago {
  id: number;
  planPagoId: number;
  numero: number;
  monto: number;
  fechaVencimiento: Date;
  fechaPago?: Date;
  estado: 'pendiente' | 'pagada' | 'vencida';
}

export interface PlanPago {
  id: number;
  facturaId: number;
  fechaCreacion: Date;
  cantidadCuotas: number;
  observaciones?: string;
  estado: 'activo' | 'completado' | 'cancelado';
  cuotas: CuotaPlanPago[];
}

export interface Factura {
  id: number;
  numero: string;
  fecha: Date;
  fechaVencimiento: Date;
  clienteId: number;
  detalles: DetalleFactura[];
  observaciones?: string;
  subtotal: number;
  impuestos: number;
  total: number;
  estado: EstadoFactura;
  movimientoId?: number; // ID del movimiento asociado, si existe
  expedienteId?: number;
  diasMora?: number; // Días de mora para facturas vencidas
  recordatoriosEnviados?: number; // Cantidad de recordatorios enviados
  planPagoId?: number; // Referencia al plan de pago si existe
  creadoPor: string;
  creadoEn: Date;
  actualizadoEn?: Date;
}

interface FacturaState {
  facturas: Factura[];
  facturaSeleccionada: Factura | null;
  planesPago: PlanPago[];
  recordatorios: RecordatorioPago[];
  loading: boolean;
  error: string | null;

  // Acciones
  fetchFacturas: () => Promise<void>;
  addFactura: (factura: Omit<Factura, 'id' | 'creadoEn'>) => Promise<Factura>;
  updateFactura: (id: number, datos: Partial<Factura>) => Promise<void>;
  deleteFactura: (id: number) => Promise<void>;
  setFacturaSeleccionada: (factura: Factura | null) => void;
  generarFacturaDesdeMovimiento: (movimientoId: number) => Promise<Factura | null>;
  cambiarEstadoFactura: (id: number, nuevoEstado: EstadoFactura) => Promise<void>;
  convertirMovimientosAFactura: (movimientoIds: number[]) => Promise<Factura | null>;

  // Nuevas acciones para gestión avanzada de cobros
  actualizarDiasMora: () => Promise<void>;
  enviarRecordatorioPago: (facturaId: number, tipo: 'email' | 'sms' | 'llamada', mensaje: string) => Promise<void>;
  getFacturasVencidas: (diasMinimo?: number) => Factura[];
  getFacturasProximasAVencer: (diasLimite?: number) => Factura[];
  getFacturasPorCliente: (clienteId: number) => Factura[];
  crearPlanPago: (facturaId: number, cantidadCuotas: number, observaciones?: string) => Promise<PlanPago | null>;
  registrarPagoCuota: (planPagoId: number, cuotaId: number) => Promise<void>;
  verificarVencimientosCuotas: () => Promise<void>;
  getEstadisticasMorosidad: () => { totalVencidas: number, montoTotal: number, promedioMora: number };
}

// Datos de ejemplo para desarrollo
const facturasIniciales: Factura[] = [
  {
    id: 1,
    numero: 'F-2023-001',
    fecha: moment().subtract(15, 'days').toDate(),
    fechaVencimiento: moment().add(15, 'days').toDate(),
    clienteId: 1,
    detalles: [
      {
        id: 1,
        descripcion: 'Honorarios por representación legal',
        cantidad: 1,
        precioUnitario: 50000,
        impuesto: 21,
        subtotal: 50000
      }
    ],
    observaciones: 'Servicios prestados en el caso Martínez',
    subtotal: 50000,
    impuestos: 10500,
    total: 60500,
    estado: 'pagada',
    movimientoId: 1,
    expedienteId: 1,
    creadoPor: 'Juan Pérez',
    creadoEn: moment().subtract(15, 'days').toDate()
  },
  {
    id: 2,
    numero: 'F-2023-002',
    fecha: moment().subtract(5, 'days').toDate(),
    fechaVencimiento: moment().add(25, 'days').toDate(),
    clienteId: 3,
    detalles: [
      {
        id: 1,
        descripcion: 'Consulta inicial',
        cantidad: 1,
        precioUnitario: 3000,
        impuesto: 21,
        subtotal: 3000
      }
    ],
    observaciones: 'Consulta sobre tema laboral',
    subtotal: 3000,
    impuestos: 630,
    total: 3630,
    estado: 'emitida',
    movimientoId: 3,
    creadoPor: 'Juan Pérez',
    creadoEn: moment().subtract(5, 'days').toDate()
  }
];

// Función para generar un número de factura
const generarNumeroFactura = (facturas: Factura[]): string => {
  const año = new Date().getFullYear();
  const ultimaFactura = [...facturas].sort((a, b) => b.id - a.id)[0];

  if (!ultimaFactura) {
    return `F-${año}-001`;
  }

  // Extraer número de la última factura
  const match = ultimaFactura.numero.match(/F-\d+-(\d+)/);
  if (!match) {
    return `F-${año}-001`;
  }

  const ultimoNumero = parseInt(match[1]);
  const nuevoNumero = (ultimoNumero + 1).toString().padStart(3, '0');

  return `F-${año}-${nuevoNumero}`;
};

// Creación del store
export const useFacturaStore = create<FacturaState>((set, get) => ({
  facturas: facturasIniciales,
  facturaSeleccionada: null,
  planesPago: [],
  recordatorios: [],
  loading: false,
  error: null,

  // Obtener facturas
  fetchFacturas: async () => {
    set({ loading: true, error: null });
    try {
      // Simulación de llamada a API
      await new Promise(resolve => setTimeout(resolve, 800));

      // En producción, aquí haríamos fetch a una API real
      set({ facturas: facturasIniciales, loading: false });
    } catch (error) {
      set({ error: 'Error al cargar las facturas', loading: false });
    }
  },

  // Añadir nueva factura
  addFactura: async (factura) => {
    set({ loading: true, error: null });
    try {
      // Simulación de llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));

      const nuevaFactura: Factura = {
        ...factura,
        id: Date.now(),
        creadoEn: new Date()
      };

      set(state => ({
        facturas: [...state.facturas, nuevaFactura],
        loading: false
      }));

      return nuevaFactura;
    } catch (error) {
      set({ error: 'Error al crear la factura', loading: false });
      throw error;
    }
  },

  // Actualizar factura existente
  updateFactura: async (id, datos) => {
    set({ loading: true, error: null });
    try {
      // Simulación de llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));

      set(state => ({
        facturas: state.facturas.map(factura =>
          factura.id === id ? { ...factura, ...datos, actualizadoEn: new Date() } : factura
        ),
        loading: false
      }));
    } catch (error) {
      set({ error: 'Error al actualizar la factura', loading: false });
      throw error;
    }
  },

  // Eliminar factura
  deleteFactura: async (id) => {
    set({ loading: true, error: null });
    try {
      // Simulación de llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));

      set(state => ({
        facturas: state.facturas.filter(factura => factura.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ error: 'Error al eliminar la factura', loading: false });
      throw error;
    }
  },

  // Seleccionar factura
  setFacturaSeleccionada: (factura) => {
    set({ facturaSeleccionada: factura });
  },

  // Generar factura desde un movimiento existente
  generarFacturaDesdeMovimiento: async (movimientoId) => {
    set({ loading: true, error: null });
    try {
      // Obtenemos el movimiento del store de tesorería
      const tesoreriaStore = useTesoreriaStore.getState();
      const movimiento = tesoreriaStore.movimientos.find(m => m.id === movimientoId);

      if (!movimiento) {
        throw new Error('Movimiento no encontrado');
      }

      if (movimiento.tipo !== 'ingreso') {
        throw new Error('Solo se pueden generar facturas de movimientos de tipo ingreso');
      }

      // Verificamos si ya existe una factura para este movimiento
      const facturaExistente = get().facturas.find(f => f.movimientoId === movimientoId);
      if (facturaExistente) {
        set({ loading: false, facturaSeleccionada: facturaExistente });
        return facturaExistente;
      }

      // Calculamos valores para la factura
      const subtotal = movimiento.monto;
      const impuestos = subtotal * 0.21; // Asumimos IVA 21% por defecto
      const total = subtotal + impuestos;

      const cliente = tesoreriaStore.clientes.find(c => c.id === movimiento.clienteId);
      if (!cliente && movimiento.clienteId) {
        throw new Error('Cliente no encontrado');
      }

      // Definimos la fecha de vencimiento (por defecto 30 días después de emisión)
      const fechaVencimiento = moment(movimiento.fecha).add(30, 'days').toDate();

      // Creamos la nueva factura
      const nuevaFactura: Omit<Factura, 'id' | 'creadoEn'> = {
        numero: generarNumeroFactura(get().facturas),
        fecha: movimiento.fecha,
        fechaVencimiento,
        clienteId: movimiento.clienteId || 0, // Debería existir un cliente
        detalles: [
          {
            id: 1,
            descripcion: movimiento.descripcion,
            cantidad: 1,
            precioUnitario: subtotal,
            impuesto: 21, // 21% por defecto
            subtotal
          }
        ],
        observaciones: `Factura generada desde movimiento #${movimiento.id}`,
        subtotal,
        impuestos,
        total,
        estado: movimiento.estado === 'completado' ? 'pagada' : 'emitida',
        movimientoId: movimiento.id,
        expedienteId: movimiento.expedienteId,
        creadoPor: 'Usuario Actual' // En producción, obtendríamos del contexto de autenticación
      };

      // Añadimos la factura
      const facturaCreada = await get().addFactura(nuevaFactura);

      // Si el movimiento estaba pendiente, lo actualizamos a completado
      if (movimiento.estado === 'pendiente') {
        await tesoreriaStore.updateMovimiento(movimiento.id, { estado: 'completado' });
      }

      set({ loading: false, facturaSeleccionada: facturaCreada });
      return facturaCreada;
    } catch (error) {
      let mensaje = 'Error al generar la factura';
      if (error instanceof Error) {
        mensaje = error.message;
      }
      set({ error: mensaje, loading: false });
      return null;
    }
  },

  // Cambiar el estado de una factura
  cambiarEstadoFactura: async (id, nuevoEstado) => {
    try {
      // Actualizamos la factura
      await get().updateFactura(id, { estado: nuevoEstado });

      // Si se marca como pagada, actualizamos el movimiento asociado
      if (nuevoEstado === 'pagada') {
        const factura = get().facturas.find(f => f.id === id);
        if (factura?.movimientoId) {
          const tesoreriaStore = useTesoreriaStore.getState();
          await tesoreriaStore.updateMovimiento(factura.movimientoId, { estado: 'completado' });
        }
      }
    } catch (error) {
      set({ error: 'Error al cambiar el estado de la factura', loading: false });
      throw error;
    }
  },

  // Convertir múltiples movimientos en una factura
  convertirMovimientosAFactura: async (movimientoIds) => {
    set({ loading: true, error: null });
    try {
      const tesoreriaStore = useTesoreriaStore.getState();
      const movimientos = tesoreriaStore.movimientos.filter(m =>
        movimientoIds.includes(m.id) && m.tipo === 'ingreso'
      );

      if (movimientos.length === 0) {
        throw new Error('No se encontraron movimientos válidos');
      }

      // Verificamos que todos los movimientos sean del mismo cliente
      const clienteId = movimientos[0].clienteId;
      if (!clienteId) {
        throw new Error('El primer movimiento no tiene cliente asignado');
      }

      const todosDelMismoCliente = movimientos.every(m => m.clienteId === clienteId);
      if (!todosDelMismoCliente) {
        throw new Error('Los movimientos deben ser del mismo cliente');
      }

      // Verificamos si alguno ya tiene factura
      const algunoTieneFactura = movimientos.some(m =>
        get().facturas.find(f => f.movimientoId === m.id)
      );

      if (algunoTieneFactura) {
        throw new Error('Algunos movimientos ya están asociados a facturas');
      }

      // Creamos los detalles
      const detalles: Omit<DetalleFactura, 'id'>[] = movimientos.map(m => ({
        descripcion: m.descripcion,
        cantidad: 1,
        precioUnitario: m.monto,
        impuesto: 21,
        subtotal: m.monto
      }));

      // Calculamos totales
      const subtotal = detalles.reduce((sum, d) => sum + d.subtotal, 0);
      const impuestos = subtotal * 0.21;
      const total = subtotal + impuestos;

      // Definimos la fecha como la del movimiento más reciente
      const fechaMasReciente = new Date(Math.max(...movimientos.map(m => new Date(m.fecha).getTime())));

      // Creamos la nueva factura
      const nuevaFactura: Omit<Factura, 'id' | 'creadoEn'> = {
        numero: generarNumeroFactura(get().facturas),
        fecha: fechaMasReciente,
        fechaVencimiento: moment(fechaMasReciente).add(30, 'days').toDate(),
        clienteId,
        detalles: detalles.map((d, index) => ({ ...d, id: index + 1 })),
        observaciones: `Factura generada desde ${movimientos.length} movimientos`,
        subtotal,
        impuestos,
        total,
        estado: 'borrador',
        expedienteId: movimientos[0].expedienteId, // Usamos el expediente del primer movimiento
        creadoPor: 'Usuario Actual'
      };

      // Añadimos la factura
      const facturaCreada = await get().addFactura(nuevaFactura);

      set({ loading: false, facturaSeleccionada: facturaCreada });
      return facturaCreada;
    } catch (error) {
      let mensaje = 'Error al convertir movimientos a factura';
      if (error instanceof Error) {
        mensaje = error.message;
      }
      set({ error: mensaje, loading: false });
      return null;
    }
  },

  // Actualizar días de mora para facturas vencidas
  actualizarDiasMora: async () => {
    set({ loading: true, error: null });
    try {
      const facturasActualizadas = get().facturas.map(factura => {
        if (factura.estado === 'vencida') {
          const diasMora = moment().diff(moment(factura.fechaVencimiento), 'days');
          return { ...factura, diasMora };
        }
        return factura;
      });

      set({ facturas: facturasActualizadas, loading: false });
    } catch (error) {
      set({ error: 'Error al actualizar días de mora', loading: false });
    }
  },

  // Enviar recordatorio de pago
  enviarRecordatorioPago: async (facturaId, tipo, mensaje) => {
    set({ loading: true, error: null });
    try {
      // Verificar si la factura existe y está vencida o emitida
      const factura = get().facturas.find(f => f.id === facturaId);
      if (!factura) {
        throw new Error('Factura no encontrada');
      }

      if (factura.estado !== 'vencida' && factura.estado !== 'emitida') {
        throw new Error('Solo se pueden enviar recordatorios para facturas emitidas o vencidas');
      }

      // En un entorno real, aquí se enviaría el recordatorio por el canal correspondiente
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación de envío

      // Crear registro de recordatorio
      const nuevoRecordatorio: RecordatorioPago = {
        id: Date.now(),
        facturaId,
        fechaEnvio: new Date(),
        tipo,
        estado: 'enviado',
        mensaje
      };

      // Actualizar factura con cantidad de recordatorios
      const facturasActualizadas = get().facturas.map(f => {
        if (f.id === facturaId) {
          const recordatoriosEnviados = (f.recordatoriosEnviados || 0) + 1;
          return { ...f, recordatoriosEnviados, actualizadoEn: new Date() };
        }
        return f;
      });

      set(state => ({
        facturas: facturasActualizadas,
        recordatorios: [...state.recordatorios, nuevoRecordatorio],
        loading: false
      }));
    } catch (error) {
      let mensaje = 'Error al enviar recordatorio de pago';
      if (error instanceof Error) {
        mensaje = error.message;
      }
      set({ error: mensaje, loading: false });
    }
  },

  // Obtener facturas vencidas con filtro opcional de días mínimo de mora
  getFacturasVencidas: (diasMinimo = 0) => {
    return get().facturas.filter(factura => {
      if (factura.estado !== 'vencida') return false;

      // Si no tiene días de mora calculados, calcularlos
      const diasMora = factura.diasMora ||
        moment().diff(moment(factura.fechaVencimiento), 'days');

      return diasMora >= diasMinimo;
    });
  },

  // Obtener facturas próximas a vencer
  getFacturasProximasAVencer: (diasLimite = 7) => {
    const hoy = moment();
    return get().facturas.filter(factura => {
      if (factura.estado !== 'emitida') return false;

      const fechaVencimiento = moment(factura.fechaVencimiento);
      const diasParaVencer = fechaVencimiento.diff(hoy, 'days');

      return diasParaVencer >= 0 && diasParaVencer <= diasLimite;
    });
  },

  // Obtener todas las facturas de un cliente específico
  getFacturasPorCliente: (clienteId) => {
    return get().facturas.filter(factura => factura.clienteId === clienteId);
  },

  // Crear un plan de pago para una factura
  crearPlanPago: async (facturaId, cantidadCuotas, observaciones) => {
    set({ loading: true, error: null });
    try {
      // Verificar si la factura existe
      const factura = get().facturas.find(f => f.id === facturaId);
      if (!factura) {
        throw new Error('Factura no encontrada');
      }

      // Verificar si ya tiene un plan de pago
      if (factura.planPagoId) {
        throw new Error('Esta factura ya tiene un plan de pago asociado');
      }

      // Calcular monto por cuota (redondeado a 2 decimales)
      const montoPorCuota = Math.round((factura.total / cantidadCuotas) * 100) / 100;

      // Generar las cuotas
      const cuotas: CuotaPlanPago[] = [];
      for (let i = 1; i <= cantidadCuotas; i++) {
        cuotas.push({
          id: Date.now() + i,
          planPagoId: 0, // Se actualizará después
          numero: i,
          monto: i < cantidadCuotas ? montoPorCuota : factura.total - montoPorCuota * (cantidadCuotas - 1), // Ajuste en la última cuota
          fechaVencimiento: moment().add(i * 30, 'days').toDate(), // Una cuota cada 30 días
          estado: 'pendiente'
        });
      }

      // Crear el plan de pago
      const nuevoPlan: PlanPago = {
        id: Date.now(),
        facturaId,
        fechaCreacion: new Date(),
        cantidadCuotas,
        observaciones,
        estado: 'activo',
        cuotas: cuotas.map(c => ({ ...c, planPagoId: Date.now() }))
      };

      // Actualizar la factura con el plan de pago
      await get().updateFactura(facturaId, {
        planPagoId: nuevoPlan.id,
        observaciones: factura.observaciones
          ? `${factura.observaciones}\nPlan de pago creado: ${moment().format('DD/MM/YYYY')}`
          : `Plan de pago creado: ${moment().format('DD/MM/YYYY')}`
      });

      set(state => ({
        planesPago: [...state.planesPago, nuevoPlan],
        loading: false
      }));

      return nuevoPlan;
    } catch (error) {
      let mensaje = 'Error al crear plan de pago';
      if (error instanceof Error) {
        mensaje = error.message;
      }
      set({ error: mensaje, loading: false });
      return null;
    }
  },

  // Registrar pago de cuota
  registrarPagoCuota: async (planPagoId, cuotaId) => {
    set({ loading: true, error: null });
    try {
      // Buscar el plan de pago
      const planesPagoActualizados = get().planesPago.map(plan => {
        if (plan.id === planPagoId) {
          // Actualizar la cuota específica
          const cuotasActualizadas = plan.cuotas.map(cuota => {
            if (cuota.id === cuotaId) {
              return {
                ...cuota,
                estado: 'pagada' as const,
                fechaPago: new Date()
              };
            }
            return cuota;
          });

          // Verificar si todas las cuotas están pagadas
          const todasPagadas = cuotasActualizadas.every(c => c.estado === 'pagada');

          return {
            ...plan,
            estado: todasPagadas ? 'completado' as const : 'activo' as const,
            cuotas: cuotasActualizadas
          };
        }
        return plan;
      });

      // Si todas las cuotas están pagadas, actualizar el estado de la factura
      const planActualizado = planesPagoActualizados.find(p => p.id === planPagoId);
      if (planActualizado && planActualizado.estado === 'completado') {
        const factura = get().facturas.find(f => f.id === planActualizado.facturaId);
        if (factura) {
          await get().cambiarEstadoFactura(factura.id, 'pagada');
        }
      }

      set({ planesPago: planesPagoActualizados, loading: false });
    } catch (error) {
      set({ error: 'Error al registrar pago de cuota', loading: false });
    }
  },

  // Verificar vencimientos de cuotas
  verificarVencimientosCuotas: async () => {
    set({ loading: true, error: null });
    try {
      const hoy = moment();
      const planesPagoActualizados = get().planesPago.map(plan => {
        if (plan.estado !== 'activo') return plan;

        const cuotasActualizadas = plan.cuotas.map(cuota => {
          if (cuota.estado === 'pendiente' && moment(cuota.fechaVencimiento).isBefore(hoy)) {
            return { ...cuota, estado: 'vencida' as const };
          }
          return cuota;
        });

        return { ...plan, cuotas: cuotasActualizadas };
      });

      set({ planesPago: planesPagoActualizados, loading: false });
    } catch (error) {
      set({ error: 'Error al verificar vencimientos de cuotas', loading: false });
    }
  },

  // Obtener estadísticas de morosidad
  getEstadisticasMorosidad: () => {
    const facturasVencidas = get().getFacturasVencidas();
    const montoTotal = facturasVencidas.reduce((sum, f) => sum + f.total, 0);

    let diasMoraTotales = 0;
    facturasVencidas.forEach(factura => {
      const diasMora = factura.diasMora ||
        moment().diff(moment(factura.fechaVencimiento), 'days');
      diasMoraTotales += diasMora;
    });

    const promedioMora = facturasVencidas.length > 0
      ? Math.round(diasMoraTotales / facturasVencidas.length)
      : 0;

    return {
      totalVencidas: facturasVencidas.length,
      montoTotal,
      promedioMora
    };
  }
}));
