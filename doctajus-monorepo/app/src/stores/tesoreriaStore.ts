import { create } from 'zustand';
import moment from 'moment';

// Definición de tipos
export type TipoMovimiento = 'ingreso' | 'egreso';
export type CategoriaMovimiento =
  // Categorías de ingresos
  | 'honorarios'
  | 'consultas'
  | 'abonos'
  | 'juicios_ganados'
  | 'otros_ingresos'
  // Categorías de egresos
  | 'salarios'
  | 'alquiler'
  | 'servicios'
  | 'impuestos'
  | 'gastos_judiciales'
  | 'papeleria'
  | 'software'
  | 'otros_gastos';

export type EstadoMovimiento = 'pendiente' | 'completado' | 'anulado';

export type MetodoPago = 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta' | 'otro';

// Interfaces
export interface Movimiento {
  id: number;
  fecha: Date;
  tipo: TipoMovimiento;
  categoria: CategoriaMovimiento;
  descripcion: string;
  monto: number;
  expedienteId?: number;
  clienteId?: number;
  estado: EstadoMovimiento;
  metodoPago: MetodoPago;
  comprobante?: string;
  notas?: string;
  creadoPor: string;
  creadoEn: Date;
  actualizadoEn?: Date;
}

export interface Cliente {
  id: number;
  nombre: string;
  // Otros campos que pueda tener un cliente
}

export interface Saldo {
  total: number;
  ingresos: number;
  egresos: number;
  pendientes: number;
}

export interface FiltrosTesoreria {
  fechaDesde?: Date | null;
  fechaHasta?: Date | null;
  tipoMovimiento?: TipoMovimiento | null;
  categoria?: CategoriaMovimiento | null;
  estado?: EstadoMovimiento | null;
  expedienteId?: number | null;
  clienteId?: number | null;
  busqueda?: string;
}

// Definición de la interfaz de estado
export interface TesoreriaState {
  movimientos: Movimiento[];
  movimientosFiltrados: Movimiento[];
  filtros: FiltrosTesoreria;
  saldo: Saldo;
  clientes: Cliente[];
  movimientoSeleccionado: Movimiento | null;
  loading: boolean;
  error: string | null;

  // Acciones
  fetchMovimientos: () => Promise<void>;
  fetchClientes: () => Promise<void>;
  addMovimiento: (movimiento: Omit<Movimiento, 'id' | 'creadoEn'>) => Promise<void>;
  updateMovimiento: (id: number, datos: Partial<Movimiento>) => Promise<void>;
  deleteMovimiento: (id: number) => Promise<void>;
  setFiltros: (filtros: Partial<FiltrosTesoreria>) => void;
  resetFiltros: () => void;
  calcularSaldo: () => void;
  setMovimientoSeleccionado: (movimiento: Movimiento | null) => void;

  // Añadir para facturación
  seleccionarMovimiento: (id: number) => void;
}

// Datos de ejemplo para desarrollo
const movimientosIniciales: Movimiento[] = [
  {
    id: 1,
    fecha: moment().subtract(5, 'days').toDate(),
    tipo: 'ingreso',
    categoria: 'honorarios',
    descripcion: 'Pago inicial - Caso Martínez',
    monto: 50000,
    expedienteId: 1,
    clienteId: 1,
    estado: 'completado',
    metodoPago: 'transferencia',
    comprobante: 'COMP-001',
    creadoPor: 'Juan Pérez',
    creadoEn: moment().subtract(5, 'days').toDate()
  },
  {
    id: 2,
    fecha: moment().subtract(3, 'days').toDate(),
    tipo: 'egreso',
    categoria: 'gastos_judiciales',
    descripcion: 'Tasas judiciales - Expediente 103',
    monto: 5000,
    expedienteId: 2,
    estado: 'completado',
    metodoPago: 'efectivo',
    creadoPor: 'María González',
    creadoEn: moment().subtract(3, 'days').toDate()
  },
  {
    id: 3,
    fecha: moment().subtract(1, 'days').toDate(),
    tipo: 'ingreso',
    categoria: 'consultas',
    descripcion: 'Consulta inicial - Rodrigo Sánchez',
    monto: 3000,
    clienteId: 3,
    estado: 'completado',
    metodoPago: 'efectivo',
    creadoPor: 'Juan Pérez',
    creadoEn: moment().subtract(1, 'days').toDate()
  },
  {
    id: 4,
    fecha: moment().toDate(),
    tipo: 'egreso',
    categoria: 'servicios',
    descripcion: 'Pago internet - Oficina principal',
    monto: 2500,
    estado: 'pendiente',
    metodoPago: 'transferencia',
    creadoPor: 'Ana Torres',
    creadoEn: moment().toDate()
  },
  {
    id: 5,
    fecha: moment().add(5, 'days').toDate(),
    tipo: 'ingreso',
    categoria: 'honorarios',
    descripcion: 'Segunda cuota - Caso Rodríguez',
    monto: 25000,
    expedienteId: 3,
    clienteId: 4,
    estado: 'pendiente',
    metodoPago: 'cheque',
    creadoPor: 'Juan Pérez',
    creadoEn: moment().toDate()
  }
];

const clientesIniciales: Cliente[] = [
  { id: 1, nombre: 'Carlos Martínez' },
  { id: 2, nombre: 'Laura Gómez' },
  { id: 3, nombre: 'Rodrigo Sánchez' },
  { id: 4, nombre: 'Familia Rodríguez' },
  { id: 5, nombre: 'Empresa XYZ S.A.' }
];

// Creación del store
export const useTesoreriaStore = create<TesoreriaState>((set, get) => ({
  movimientos: movimientosIniciales,
  movimientosFiltrados: movimientosIniciales,
  filtros: {},
  saldo: {
    total: 0,
    ingresos: 0,
    egresos: 0,
    pendientes: 0
  },
  clientes: clientesIniciales,
  movimientoSeleccionado: null,
  loading: false,
  error: null,

  // Obtener movimientos (simulación API)
  fetchMovimientos: async () => {
    set({ loading: true, error: null });
    try {
      // Simulación de llamada a API
      await new Promise(resolve => setTimeout(resolve, 800));

      // En producción, aquí haríamos fetch a una API real
      set(state => {
        // Aplicamos los filtros actuales a los movimientos iniciales
        const movimientosFiltrados = aplicarFiltros(movimientosIniciales, state.filtros);
        return {
          movimientos: movimientosIniciales,
          movimientosFiltrados,
          loading: false
        };
      });

      // Calcular saldo después de cargar los movimientos
      get().calcularSaldo();
    } catch (error) {
      set({ error: 'Error al cargar los movimientos', loading: false });
    }
  },

  // Obtener clientes (simulación API)
  fetchClientes: async () => {
    try {
      // Simulación de llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));

      // En producción, aquí haríamos fetch a una API real
      set({ clientes: clientesIniciales });
    } catch (error) {
      set({ error: 'Error al cargar los clientes' });
    }
  },

  // Añadir nuevo movimiento
  addMovimiento: async (movimiento) => {
    set({ loading: true, error: null });
    try {
      // Simulación de llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));

      const nuevoMovimiento: Movimiento = {
        ...movimiento,
        id: Date.now(),
        creadoEn: new Date()
      };

      set(state => {
        const nuevosMovimientos = [...state.movimientos, nuevoMovimiento];
        const movimientosFiltrados = aplicarFiltros(nuevosMovimientos, state.filtros);

        return {
          movimientos: nuevosMovimientos,
          movimientosFiltrados,
          loading: false
        };
      });

      // Recalcular el saldo
      get().calcularSaldo();
    } catch (error) {
      set({ error: 'Error al añadir el movimiento', loading: false });
    }
  },

  // Actualizar movimiento existente
  updateMovimiento: async (id, datos) => {
    set({ loading: true, error: null });
    try {
      // Simulación de llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));

      set(state => {
        const movimientosActualizados = state.movimientos.map(mov =>
          mov.id === id ? { ...mov, ...datos, actualizadoEn: new Date() } : mov
        );

        const movimientosFiltrados = aplicarFiltros(movimientosActualizados, state.filtros);

        return {
          movimientos: movimientosActualizados,
          movimientosFiltrados,
          loading: false
        };
      });

      // Recalcular el saldo
      get().calcularSaldo();
    } catch (error) {
      set({ error: 'Error al actualizar el movimiento', loading: false });
    }
  },

  // Eliminar movimiento
  deleteMovimiento: async (id) => {
    set({ loading: true, error: null });
    try {
      // Simulación de llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));

      set(state => {
        const movimientosActualizados = state.movimientos.filter(mov => mov.id !== id);
        const movimientosFiltrados = aplicarFiltros(movimientosActualizados, state.filtros);

        return {
          movimientos: movimientosActualizados,
          movimientosFiltrados,
          loading: false
        };
      });

      // Recalcular el saldo
      get().calcularSaldo();
    } catch (error) {
      set({ error: 'Error al eliminar el movimiento', loading: false });
    }
  },

  // Actualizar filtros
  setFiltros: (nuevosFiltros) => {
    set(state => {
      const filtrosActualizados = {
        ...state.filtros,
        ...nuevosFiltros
      };

      // Aplicar los filtros actualizados
      const movimientosFiltrados = aplicarFiltros(state.movimientos, filtrosActualizados);

      return {
        filtros: filtrosActualizados,
        movimientosFiltrados
      };
    });
  },

  // Resetear filtros
  resetFiltros: () => {
    set(state => ({
      filtros: {},
      movimientosFiltrados: state.movimientos
    }));
  },

  // Calcular saldo actual
  calcularSaldo: () => {
    set(state => {
      const movimientos = state.movimientos;

      let ingresos = 0;
      let egresos = 0;
      let pendientes = 0;

      for (const mov of movimientos) {
        if (mov.estado === 'anulado') continue;

        if (mov.estado === 'pendiente') {
          pendientes += (mov.tipo === 'ingreso' ? mov.monto : -mov.monto);
          continue;
        }

        if (mov.tipo === 'ingreso') {
          ingresos += mov.monto;
        } else if (mov.tipo === 'egreso') {
          egresos += mov.monto;
        }
      }

      return {
        saldo: {
          ingresos,
          egresos,
          pendientes,
          total: ingresos - egresos
        }
      };
    });
  },

  // Seleccionar un movimiento para editar
  setMovimientoSeleccionado: (movimiento) => {
    set({ movimientoSeleccionado: movimiento });
  },

  // Añadir para facturación
  seleccionarMovimiento: (id: number) => {
    const movimiento = get().movimientos.find(m => m.id === id);
    if (movimiento) {
      set({ movimientoSeleccionado: movimiento });
    }
  }
}));

// Función auxiliar para aplicar filtros
function aplicarFiltros(movimientos: Movimiento[], filtros: FiltrosTesoreria): Movimiento[] {
  if (!filtros || Object.keys(filtros).length === 0) {
    return movimientos;
  }

  return movimientos.filter(mov => {
    // Filtro por fecha desde
    if (filtros.fechaDesde && moment(mov.fecha).isBefore(filtros.fechaDesde, 'day')) {
      return false;
    }

    // Filtro por fecha hasta
    if (filtros.fechaHasta && moment(mov.fecha).isAfter(filtros.fechaHasta, 'day')) {
      return false;
    }

    // Filtro por tipo de movimiento
    if (filtros.tipoMovimiento && mov.tipo !== filtros.tipoMovimiento) {
      return false;
    }

    // Filtro por categoría
    if (filtros.categoria && mov.categoria !== filtros.categoria) {
      return false;
    }

    // Filtro por estado
    if (filtros.estado && mov.estado !== filtros.estado) {
      return false;
    }

    // Filtro por expediente
    if (filtros.expedienteId && mov.expedienteId !== filtros.expedienteId) {
      return false;
    }

    // Filtro por cliente
    if (filtros.clienteId && mov.clienteId !== filtros.clienteId) {
      return false;
    }

    // Filtro por búsqueda (en descripción)
    if (filtros.busqueda && !mov.descripcion.toLowerCase().includes(filtros.busqueda.toLowerCase())) {
      return false;
    }

    return true;
  });
}
