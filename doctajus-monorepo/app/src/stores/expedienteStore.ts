import { create } from 'zustand';
import { Expediente, EstadoExpediente } from '../types';
import { expedienteService } from '../services/api';
import { useUIStore } from './uiStore';

// Forzar modo desarrollo para pruebas
const isDevelopment = true;

// Datos de prueba para desarrollo
const expedientesDePrueba: Expediente[] = [
  {
    id: '1',
    numero: 'EXP-2023-001',
    titulo: 'Demanda por incumplimiento de contrato',
    descripcion: 'Cliente reclama incumplimiento de contrato de servicios profesionales',
    estado: EstadoExpediente.ABIERTO,
    fechaInicio: new Date('2023-01-15'),
    fechaActualizacion: new Date('2023-03-10'),
    clienteId: '101',
    abogadoId: '201',
    tipo: 'CONTRACTUAL'
  },
  {
    id: '2',
    numero: 'EXP-2023-002',
    titulo: 'Divorcio por mutuo acuerdo',
    descripcion: 'Trámite de divorcio con acuerdo entre las partes',
    estado: EstadoExpediente.EN_PROCESO,
    fechaInicio: new Date('2023-02-05'),
    fechaActualizacion: new Date('2023-04-18'),
    clienteId: '102',
    abogadoId: '201',
    tipo: 'FAMILIA'
  },
  {
    id: '3',
    numero: 'EXP-2023-003',
    titulo: 'Sucesión intestada',
    descripcion: 'Proceso de sucesión sin testamento',
    estado: EstadoExpediente.CERRADO,
    fechaInicio: new Date('2023-01-10'),
    fechaActualizacion: new Date('2023-05-22'),
    fechaFin: new Date('2023-05-22'),
    clienteId: '103',
    abogadoId: '202',
    tipo: 'SUCESION'
  },
  {
    id: '4',
    numero: 'EXP-2022-015',
    titulo: 'Juicio laboral por despido injustificado',
    descripcion: 'Reclamo por indemnización por despido sin causa',
    estado: EstadoExpediente.ARCHIVADO,
    fechaInicio: new Date('2022-09-12'),
    fechaActualizacion: new Date('2023-01-30'),
    fechaFin: new Date('2023-01-30'),
    clienteId: '104',
    abogadoId: '203',
    tipo: 'LABORAL'
  },
  {
    id: '5',
    numero: 'EXP-2023-004',
    titulo: 'Daños y perjuicios por accidente de tránsito',
    descripcion: 'Demanda por lesiones en accidente de tránsito',
    estado: EstadoExpediente.ABIERTO,
    fechaInicio: new Date('2023-03-25'),
    fechaActualizacion: new Date('2023-05-01'),
    clienteId: '105',
    abogadoId: '202',
    tipo: 'DAÑOS_PERJUICIOS'
  }
];

// Variable para mantener los expedientes en memoria durante el desarrollo
let expedientesEnMemoria: Expediente[] = [...expedientesDePrueba];

// Asegurarse que cada expediente tenga el formato correcto
const formatearExpediente = (expediente: Expediente): Expediente => {
  return {
    ...expediente,
    fechaInicio: new Date(expediente.fechaInicio),
    fechaActualizacion: new Date(expediente.fechaActualizacion),
    fechaFin: expediente.fechaFin ? new Date(expediente.fechaFin) : undefined
  };
};

interface ExpedienteState {
  expedientes: Expediente[];
  expedienteSeleccionado: Expediente | null;
  isLoading: boolean;
  error: string | null;

  // Acciones
  fetchExpedientes: () => Promise<void>;
  getExpediente: (id: string) => Promise<Expediente | null>;
  createExpediente: (expediente: Omit<Expediente, 'id'>) => Promise<Expediente | null>;
  updateExpediente: (id: string, expediente: Partial<Expediente>) => Promise<Expediente | null>;
  deleteExpediente: (id: string) => Promise<boolean>;
  setExpedienteSeleccionado: (expediente: Expediente | null) => void;
  clearError: () => void;

  // Filtros y búsqueda
  filterByEstado: (estado: EstadoExpediente | null) => Expediente[];
  searchExpedientes: (texto: string) => Expediente[];
}

export const useExpedienteStore = create<ExpedienteState>((set, get) => ({
  expedientes: [],
  expedienteSeleccionado: null,
  isLoading: false,
  error: null,

  // Cargar todos los expedientes
  fetchExpedientes: async () => {
    try {
      set({ isLoading: true, error: null });

      // En modo desarrollo, usar datos de prueba
      if (isDevelopment) {
        // Asegurar que todos los expedientes estén formateados correctamente
        expedientesEnMemoria = expedientesEnMemoria.map(exp => formatearExpediente(exp));

        setTimeout(() => {
          set({ expedientes: expedientesEnMemoria, isLoading: false });
        }, 500);
        return;
      }

      const response = await expedienteService.getExpedientes();
      set({ expedientes: response.data, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al cargar expedientes';

      // En modo desarrollo, usar datos de prueba incluso si hay error
      if (isDevelopment) {
        // Asegurar que todos los expedientes estén formateados correctamente
        expedientesEnMemoria = expedientesEnMemoria.map(exp => formatearExpediente(exp));

        setTimeout(() => {
          set({ expedientes: expedientesEnMemoria, isLoading: false });
        }, 500);
        return;
      }

      set({ error: message, isLoading: false });
      useUIStore.getState().addNotification({
        type: 'error',
        message
      });
    }
  },

  // Obtener un expediente por ID
  getExpediente: async (id: string) => {
    try {
      set({ isLoading: true, error: null });

      // En modo desarrollo, buscar en datos en memoria
      if (isDevelopment) {
        const expedienteEncontrado = expedientesEnMemoria.find(exp => exp.id === id);

        if (!expedienteEncontrado) {
          set({
            error: `No se encontró el expediente con ID ${id}`,
            isLoading: false,
            expedienteSeleccionado: null
          });

          useUIStore.getState().addNotification({
            type: 'error',
            message: `No se encontró el expediente con ID ${id}`
          });

          return null;
        }

        const expedienteFormateado = formatearExpediente(expedienteEncontrado);

        setTimeout(() => {
          set({ expedienteSeleccionado: expedienteFormateado, isLoading: false });
        }, 300);

        return expedienteFormateado;
      }

      const response = await expedienteService.getExpedienteById(id);
      const expediente = response.data.expediente;
      set({ expedienteSeleccionado: expediente, isLoading: false });
      return expediente;
    } catch (error: any) {
      const message = error.response?.data?.message || `Error al obtener expediente ${id}`;

      // En desarrollo, si hay error buscamos en datos locales
      if (isDevelopment) {
        const expedienteEncontrado = expedientesEnMemoria.find(exp => exp.id === id);

        if (!expedienteEncontrado) {
          set({
            error: `No se encontró el expediente con ID ${id}`,
            isLoading: false,
            expedienteSeleccionado: null
          });

          useUIStore.getState().addNotification({
            type: 'error',
            message: `No se encontró el expediente con ID ${id}`
          });

          return null;
        }

        const expedienteFormateado = formatearExpediente(expedienteEncontrado);
        set({ expedienteSeleccionado: expedienteFormateado, isLoading: false });
        return expedienteFormateado;
      }

      set({ error: message, isLoading: false });
      useUIStore.getState().addNotification({
        type: 'error',
        message
      });
      return null;
    }
  },

  // Crear un nuevo expediente
  createExpediente: async (expedienteData) => {
    try {
      set({ isLoading: true, error: null });

      // En modo desarrollo, simular creación
      if (isDevelopment) {
        // Generar un ID único basado en timestamp + número aleatorio
        const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const nuevoExpediente = formatearExpediente({
          ...expedienteData,
          id: uniqueId,
          fechaInicio: new Date(expedienteData.fechaInicio),
          fechaActualizacion: new Date()
        } as Expediente);

        // Agregar a la memoria
        expedientesEnMemoria = [...expedientesEnMemoria, nuevoExpediente];

        setTimeout(() => {
          set(state => ({
            expedientes: expedientesEnMemoria,
            isLoading: false
          }));
        }, 500);

        // Notificar creación exitosa
        useUIStore.getState().addNotification({
          type: 'success',
          message: 'Expediente creado correctamente'
        });

        return nuevoExpediente;
      }

      const response = await expedienteService.createExpediente(expedienteData);
      const nuevoExpediente = response.data;

      set(state => ({
        expedientes: [...state.expedientes, nuevoExpediente],
        isLoading: false
      }));

      return nuevoExpediente;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al crear expediente';

      // En desarrollo, simular éxito incluso con error
      if (isDevelopment) {
        // Generar un ID único basado en timestamp + número aleatorio
        const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const nuevoExpediente = formatearExpediente({
          ...expedienteData,
          id: uniqueId,
          fechaInicio: new Date(expedienteData.fechaInicio),
          fechaActualizacion: new Date()
        } as Expediente);

        // Agregar a la memoria
        expedientesEnMemoria = [...expedientesEnMemoria, nuevoExpediente];

        setTimeout(() => {
          set(state => ({
            expedientes: expedientesEnMemoria,
            isLoading: false
          }));
        }, 500);

        // Notificar creación exitosa
        useUIStore.getState().addNotification({
          type: 'success',
          message: 'Expediente creado correctamente'
        });

        return nuevoExpediente;
      }

      set({ error: message, isLoading: false });
      useUIStore.getState().addNotification({
        type: 'error',
        message
      });
      return null;
    }
  },

  // Actualizar un expediente existente
  updateExpediente: async (id, expedienteData) => {
    try {
      set({ isLoading: true, error: null });

      // En modo desarrollo, simular actualización
      if (isDevelopment) {
        const expedienteExistente = expedientesEnMemoria.find(e => e.id === id);

        if (!expedienteExistente) {
          throw new Error(`No se encontró el expediente con ID ${id}`);
        }

        const expedienteActualizado = formatearExpediente({
          ...expedienteExistente,
          ...expedienteData,
          fechaActualizacion: new Date()
        } as Expediente);

        // Actualizar en memoria
        expedientesEnMemoria = expedientesEnMemoria.map(e =>
          e.id === id ? expedienteActualizado : e
        );

        setTimeout(() => {
          set(state => ({
            expedientes: expedientesEnMemoria,
            expedienteSeleccionado: state.expedienteSeleccionado?.id === id
              ? expedienteActualizado
              : state.expedienteSeleccionado,
            isLoading: false
          }));
        }, 500);

        // Notificar actualización exitosa
        useUIStore.getState().addNotification({
          type: 'success',
          message: 'Expediente actualizado correctamente'
        });

        return expedienteActualizado;
      }

      const response = await expedienteService.updateExpediente(id, expedienteData);
      const expedienteActualizado = response.data;

      set(state => ({
        expedientes: state.expedientes.map(e =>
          e.id === id ? expedienteActualizado : e
        ),
        expedienteSeleccionado: state.expedienteSeleccionado?.id === id
          ? expedienteActualizado
          : state.expedienteSeleccionado,
        isLoading: false
      }));

      return expedienteActualizado;
    } catch (error: any) {
      const message = error.response?.data?.message || `Error al actualizar expediente ${id}`;

      // En desarrollo, simular éxito incluso con error
      if (isDevelopment) {
        const expedienteExistente = expedientesEnMemoria.find(e => e.id === id);

        if (!expedienteExistente) {
          set({ error: `No se encontró el expediente con ID ${id}`, isLoading: false });
          useUIStore.getState().addNotification({
            type: 'error',
            message: `No se encontró el expediente con ID ${id}`
          });
          return null;
        }

        const expedienteActualizado = formatearExpediente({
          ...expedienteExistente,
          ...expedienteData,
          fechaActualizacion: new Date()
        } as Expediente);

        // Actualizar en memoria
        expedientesEnMemoria = expedientesEnMemoria.map(e =>
          e.id === id ? expedienteActualizado : e
        );

        setTimeout(() => {
          set(state => ({
            expedientes: expedientesEnMemoria,
            expedienteSeleccionado: state.expedienteSeleccionado?.id === id
              ? expedienteActualizado
              : state.expedienteSeleccionado,
            isLoading: false
          }));
        }, 500);

        // Notificar actualización exitosa
        useUIStore.getState().addNotification({
          type: 'success',
          message: 'Expediente actualizado correctamente'
        });

        return expedienteActualizado;
      }

      set({ error: message, isLoading: false });
      useUIStore.getState().addNotification({
        type: 'error',
        message
      });
      return null;
    }
  },

  // Eliminar un expediente
  deleteExpediente: async (id) => {
    try {
      set({ isLoading: true, error: null });

      // En modo desarrollo, simular eliminación
      if (isDevelopment) {
        // Verificar que el expediente exista
        const expedienteExistente = expedientesEnMemoria.find(e => e.id === id);

        if (!expedienteExistente) {
          set({ error: `No se encontró el expediente con ID ${id}`, isLoading: false });
          useUIStore.getState().addNotification({
            type: 'error',
            message: `No se encontró el expediente con ID ${id}`
          });
          return false;
        }

        // Eliminar de la memoria
        expedientesEnMemoria = expedientesEnMemoria.filter(e => e.id !== id);

        setTimeout(() => {
          set(state => ({
            expedientes: expedientesEnMemoria,
            expedienteSeleccionado: state.expedienteSeleccionado?.id === id
              ? null
              : state.expedienteSeleccionado,
            isLoading: false
          }));
        }, 500);

        // Notificar eliminación exitosa
        useUIStore.getState().addNotification({
          type: 'success',
          message: 'Expediente eliminado correctamente'
        });

        return true;
      }

      await expedienteService.deleteExpediente(id);

      set(state => ({
        expedientes: state.expedientes.filter(e => e.id !== id),
        expedienteSeleccionado: state.expedienteSeleccionado?.id === id
          ? null
          : state.expedienteSeleccionado,
        isLoading: false
      }));

      // Notificar eliminación exitosa
      useUIStore.getState().addNotification({
        type: 'success',
        message: 'Expediente eliminado correctamente'
      });

      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || `Error al eliminar expediente ${id}`;

      // En desarrollo, simular éxito incluso con error
      if (isDevelopment) {
        // Verificar que el expediente exista
        const expedienteExistente = expedientesEnMemoria.find(e => e.id === id);

        if (!expedienteExistente) {
          set({ error: `No se encontró el expediente con ID ${id}`, isLoading: false });
          useUIStore.getState().addNotification({
            type: 'error',
            message: `No se encontró el expediente con ID ${id}`
          });
          return false;
        }

        // Eliminar de la memoria
        expedientesEnMemoria = expedientesEnMemoria.filter(e => e.id !== id);

        setTimeout(() => {
          set(state => ({
            expedientes: expedientesEnMemoria,
            expedienteSeleccionado: state.expedienteSeleccionado?.id === id
              ? null
              : state.expedienteSeleccionado,
            isLoading: false
          }));
        }, 500);

        // Notificar eliminación exitosa
        useUIStore.getState().addNotification({
          type: 'success',
          message: 'Expediente eliminado correctamente'
        });

        return true;
      }

      set({ error: message, isLoading: false });
      useUIStore.getState().addNotification({
        type: 'error',
        message
      });
      return false;
    }
  },

  // Establecer el expediente seleccionado
  setExpedienteSeleccionado: (expediente) => {
    set({ expedienteSeleccionado: expediente });
  },

  // Limpiar errores
  clearError: () => {
    set({ error: null });
  },

  // Filtrar expedientes por estado
  filterByEstado: (estado) => {
    const { expedientes } = get();
    if (!estado) return expedientes;
    return expedientes.filter(exp => exp.estado === estado);
  },

  // Buscar expedientes por texto
  searchExpedientes: (texto) => {
    const { expedientes } = get();
    if (!texto) return expedientes;

    const searchTerm = texto.toLowerCase();
    return expedientes.filter(exp =>
      exp.numero.toLowerCase().includes(searchTerm) ||
      exp.titulo.toLowerCase().includes(searchTerm) ||
      exp.descripcion.toLowerCase().includes(searchTerm)
    );
  }
}));
