import { create } from 'zustand';
import moment from 'moment';

// Tipos de eventos
export interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resourceId?: string;
  allDay?: boolean;
  tipo: 'audiencia' | 'vencimiento' | 'reunion' | 'otro';
  expedienteId?: string;
  descripcion?: string;
  ubicacion?: string;
  asistentes?: string[];
  recordatorio?: boolean;
  color?: string;
}

// Tipo de rango de fechas predefinido
export type DateRangeType = 'all' | 'today' | 'week' | 'month' | 'custom';

// Interface para los filtros
export interface CalendarFilters {
  audiencias: boolean;
  vencimientos: boolean;
  reuniones: boolean;
  otros: boolean;
  expedienteId?: string | null;
  searchText?: string;
  dateRange: {
    type: DateRangeType;
    startDate?: Date;
    endDate?: Date;
  };
}

// Interface para el estado del store
interface CalendarState {
  events: CalendarEvent[];
  filteredEvents: CalendarEvent[];
  filtros: CalendarFilters;
  loading: boolean;
  error: string | null;

  // Acciones
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (id: number, eventData: Partial<CalendarEvent>) => void;
  deleteEvent: (id: number) => void;
  updateFilters: (filtros: Partial<CalendarFilters>) => void;
  setDateRange: (type: DateRangeType, startDate?: Date, endDate?: Date) => void;
  setSearchText: (text: string) => void;
  resetFilters: () => void;
  fetchEvents: () => Promise<void>;
  fetchEventsByExpediente: (expedienteId: string) => Promise<CalendarEvent[]>;
}

// Filtros iniciales
const initialFilters: CalendarFilters = {
  audiencias: true,
  vencimientos: true,
  reuniones: true,
  otros: true,
  expedienteId: null,
  searchText: '',
  dateRange: {
    type: 'all'
  }
};

// Datos iniciales de ejemplo para desarrollo
const eventosIniciales: CalendarEvent[] = [
  {
    id: 1,
    title: 'Audiencia - Caso Pérez',
    start: moment().add(1, 'days').toDate(),
    end: moment().add(1, 'days').add(2, 'hours').toDate(),
    tipo: 'audiencia',
    expedienteId: '1',
    descripcion: 'Audiencia preliminar del caso Pérez vs. González',
    ubicacion: 'Sala 3, Juzgado Civil'
  },
  {
    id: 2,
    title: 'Vencimiento - Presentación escrito',
    start: moment().add(3, 'days').toDate(),
    end: moment().add(3, 'days').toDate(),
    tipo: 'vencimiento',
    expedienteId: '2',
    descripcion: 'Fecha límite para presentar escrito de apelación',
    allDay: true
  },
  {
    id: 3,
    title: 'Reunión con cliente',
    start: moment().add(2, 'days').toDate(),
    end: moment().add(2, 'days').add(1, 'hours').toDate(),
    tipo: 'reunion',
    expedienteId: '3',
    descripcion: 'Reunión con María López para discutir estrategia',
    ubicacion: 'Oficina principal'
  },
  {
    id: 4,
    title: 'Consulta legal - Caso Rodríguez',
    start: moment().add(4, 'days').toDate(),
    end: moment().add(4, 'days').add(1.5, 'hours').toDate(),
    tipo: 'reunion',
    expedienteId: '4',
    descripcion: 'Primera consulta con cliente potencial'
  },
  {
    id: 5,
    title: 'Vencimiento - Pago de tasas judiciales',
    start: moment().add(5, 'days').toDate(),
    end: moment().add(5, 'days').toDate(),
    tipo: 'vencimiento',
    expedienteId: '5',
    descripcion: 'Último día para pagar tasas judiciales del caso Martínez',
    allDay: true
  },
  // Eventos adicionales para probar filtros
  {
    id: 6,
    title: 'Evento pasado',
    start: moment().subtract(5, 'days').toDate(),
    end: moment().subtract(5, 'days').add(1, 'hours').toDate(),
    tipo: 'otro',
    descripcion: 'Evento que ocurrió hace 5 días',
  },
  {
    id: 7,
    title: 'Evento de hoy',
    start: moment().startOf('day').add(10, 'hours').toDate(),
    end: moment().startOf('day').add(11, 'hours').toDate(),
    tipo: 'reunion',
    descripcion: 'Evento programado para hoy',
  }
];

// Creación del store
export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: eventosIniciales,
  filteredEvents: eventosIniciales,
  filtros: initialFilters,
  loading: false,
  error: null,

  // Añadir nuevo evento
  addEvent: (event) => {
    const newEvent = {
      ...event,
      id: Date.now() // Generar ID basado en timestamp (en producción usaríamos IDs del backend)
    };

    set((state) => {
      const updatedEvents = [...state.events, newEvent];
      return {
        events: updatedEvents,
        filteredEvents: applyFilters(updatedEvents, state.filtros)
      };
    });
  },

  // Actualizar evento existente
  updateEvent: (id, eventData) => {
    set((state) => {
      const updatedEvents = state.events.map(event =>
        event.id === id ? { ...event, ...eventData } : event
      );

      return {
        events: updatedEvents,
        filteredEvents: applyFilters(updatedEvents, state.filtros)
      };
    });
  },

  // Eliminar evento
  deleteEvent: (id) => {
    set((state) => {
      const updatedEvents = state.events.filter(event => event.id !== id);
      return {
        events: updatedEvents,
        filteredEvents: applyFilters(updatedEvents, state.filtros)
      };
    });
  },

  // Actualizar filtros
  updateFilters: (filtros) => {
    set((state) => {
      const updatedFiltros = { ...state.filtros, ...filtros };
      return {
        filtros: updatedFiltros,
        filteredEvents: applyFilters(state.events, updatedFiltros)
      };
    });
  },

  // Establecer rango de fechas
  setDateRange: (type, startDate, endDate) => {
    set((state) => {
      const updatedFiltros = {
        ...state.filtros,
        dateRange: {
          type,
          startDate,
          endDate
        }
      };
      return {
        filtros: updatedFiltros,
        filteredEvents: applyFilters(state.events, updatedFiltros)
      };
    });
  },

  // Establecer texto de búsqueda
  setSearchText: (text) => {
    set((state) => {
      const updatedFiltros = { ...state.filtros, searchText: text };
      return {
        filtros: updatedFiltros,
        filteredEvents: applyFilters(state.events, updatedFiltros)
      };
    });
  },

  // Restablecer filtros a valores iniciales
  resetFilters: () => {
    set((state) => {
      return {
        filtros: initialFilters,
        filteredEvents: applyFilters(state.events, initialFilters)
      };
    });
  },

  // Cargar eventos (simulación de llamada API)
  fetchEvents: async () => {
    set({ loading: true, error: null });

    try {
      // Simulación de llamada a API
      await new Promise(resolve => setTimeout(resolve, 800));

      // En un entorno real, aquí haríamos un fetch a la API
      set((state) => ({
        events: eventosIniciales,
        filteredEvents: applyFilters(eventosIniciales, state.filtros),
        loading: false
      }));
    } catch (error) {
      set({ error: 'Error al cargar los eventos', loading: false });
    }
  },

  // Cargar eventos por expediente
  fetchEventsByExpediente: async (expedienteId) => {
    set({ loading: true, error: null });

    try {
      // Simulación de llamada a API
      await new Promise(resolve => setTimeout(resolve, 400));

      // Filtrar eventos por el ID de expediente
      const eventosDelExpediente = eventosIniciales.filter(
        event => event.expedienteId === expedienteId
      );

      // También actualizar los filtros para mostrar sólo estos eventos
      set((state) => ({
        events: eventosIniciales,
        filtros: { ...state.filtros, expedienteId },
        filteredEvents: applyFilters(eventosIniciales, { ...state.filtros, expedienteId }),
        loading: false
      }));

      return eventosDelExpediente;
    } catch (error) {
      set({ error: 'Error al cargar los eventos del expediente', loading: false });
      return [];
    }
  }
}));

// Función auxiliar para aplicar filtros
function applyFilters(events: CalendarEvent[], filtros: CalendarFilters) {
  return events.filter(event => {
    // Primero filtramos por tipo
    const pasaTipoFiltro = (
      (event.tipo === 'audiencia' && filtros.audiencias) ||
      (event.tipo === 'vencimiento' && filtros.vencimientos) ||
      (event.tipo === 'reunion' && filtros.reuniones) ||
      (event.tipo === 'otro' && filtros.otros)
    );

    // Si no pasa el filtro de tipo, rechazamos el evento
    if (!pasaTipoFiltro) return false;

    // Aplicar filtro de expediente si está activo
    if (filtros.expedienteId && event.expedienteId !== filtros.expedienteId) {
      return false;
    }

    // Aplicar filtro de búsqueda de texto si hay texto
    if (filtros.searchText && filtros.searchText.trim() !== '') {
      const searchText = filtros.searchText.toLowerCase();
      const matchesText =
        (event.title && event.title.toLowerCase().includes(searchText)) ||
        (event.descripcion && event.descripcion.toLowerCase().includes(searchText)) ||
        (event.ubicacion && event.ubicacion.toLowerCase().includes(searchText));

      if (!matchesText) return false;
    }

    // Aplicar filtro de rango de fechas
    const { dateRange } = filtros;
    if (dateRange.type !== 'all') {
      const eventStart = moment(event.start);
      const eventEnd = moment(event.end);

      switch (dateRange.type) {
        case 'today':
          return eventStart.isSame(moment(), 'day') ||
                 eventEnd.isSame(moment(), 'day') ||
                 (eventStart.isBefore(moment(), 'day') && eventEnd.isAfter(moment(), 'day'));

        case 'week':
          const startOfWeek = moment().startOf('week');
          const endOfWeek = moment().endOf('week');
          return (eventStart.isSameOrAfter(startOfWeek) && eventStart.isSameOrBefore(endOfWeek)) ||
                 (eventEnd.isSameOrAfter(startOfWeek) && eventEnd.isSameOrBefore(endOfWeek)) ||
                 (eventStart.isBefore(startOfWeek) && eventEnd.isAfter(endOfWeek));

        case 'month':
          const startOfMonth = moment().startOf('month');
          const endOfMonth = moment().endOf('month');
          return (eventStart.isSameOrAfter(startOfMonth) && eventStart.isSameOrBefore(endOfMonth)) ||
                 (eventEnd.isSameOrAfter(startOfMonth) && eventEnd.isSameOrBefore(endOfMonth)) ||
                 (eventStart.isBefore(startOfMonth) && eventEnd.isAfter(endOfMonth));

        case 'custom':
          if (dateRange.startDate && dateRange.endDate) {
            const startDate = moment(dateRange.startDate).startOf('day');
            const endDate = moment(dateRange.endDate).endOf('day');
            return (eventStart.isSameOrAfter(startDate) && eventStart.isSameOrBefore(endDate)) ||
                   (eventEnd.isSameOrAfter(startDate) && eventEnd.isSameOrBefore(endDate)) ||
                   (eventStart.isBefore(startDate) && eventEnd.isAfter(endDate));
          }
          return true;

        default:
          return true;
      }
    }

    // Si pasa todos los filtros, el evento se incluye
    return true;
  });
}
