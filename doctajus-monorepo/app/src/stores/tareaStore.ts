import { create } from 'zustand';
import { Tarea, EstadoTarea, PrioridadTarea, Etiqueta, UsuarioCompartido, PermisoCompartido, ComentarioTarea } from '../types';
import { tareaService } from '../services/api';
import { useUIStore } from './uiStore';

// Etiquetas de prueba para desarrollo
const etiquetasDePrueba: Etiqueta[] = [
  { id: '1', nombre: 'Urgente', color: '#e53935' },
  { id: '2', nombre: 'Cliente VIP', color: '#43a047' },
  { id: '3', nombre: 'Facturación', color: '#fdd835' },
  { id: '4', nombre: 'Requiere documentación', color: '#1e88e5' },
  { id: '5', nombre: 'Revisión legal', color: '#8e24aa' },
  { id: '6', nombre: 'Consulta', color: '#fb8c00' }
];

// Variable para mantener los usuarios compartidos en memoria durante el desarrollo
let usuariosCompartidosEnMemoria: UsuarioCompartido[] = [];

// Variable para mantener los comentarios en memoria durante el desarrollo
let comentariosEnMemoria: ComentarioTarea[] = [];

// Datos de prueba para desarrollo
const tareasDePrueba: Tarea[] = [
  {
    id: '1',
    titulo: 'Redactar demanda inicial',
    descripcion: 'Preparar la demanda inicial para el caso de incumplimiento de contrato',
    fechaCreacion: new Date('2023-05-01').toISOString(),
    fechaVencimiento: new Date('2023-05-15').toISOString(),
    estado: EstadoTarea.COMPLETADA,
    prioridad: PrioridadTarea.ALTA,
    responsableId: '201',
    expedienteId: '1',
    creadorId: '201',
    fechaCompletada: new Date('2023-05-14').toISOString(),
    etiquetas: [etiquetasDePrueba[0], etiquetasDePrueba[4]]
  },
  {
    id: '2',
    titulo: 'Reunión con cliente para recopilar documentación',
    descripcion: 'Coordinar reunión para obtener todos los documentos necesarios',
    fechaCreacion: new Date('2023-05-05').toISOString(),
    fechaVencimiento: new Date('2023-05-12').toISOString(),
    estado: EstadoTarea.COMPLETADA,
    prioridad: PrioridadTarea.MEDIA,
    responsableId: '201',
    expedienteId: '1',
    creadorId: '201',
    fechaCompletada: new Date('2023-05-11').toISOString(),
    etiquetas: [etiquetasDePrueba[1], etiquetasDePrueba[3]]
  },
  {
    id: '3',
    titulo: 'Presentar escrito en juzgado',
    descripcion: 'Presentar escrito de demanda en el juzgado correspondiente',
    fechaCreacion: new Date('2023-05-16').toISOString(),
    fechaVencimiento: new Date('2023-06-01').toISOString(),
    estado: EstadoTarea.PENDIENTE,
    prioridad: PrioridadTarea.ALTA,
    responsableId: '202',
    expedienteId: '1',
    creadorId: '201',
    etiquetas: [etiquetasDePrueba[4]]
  },
  {
    id: '4',
    titulo: 'Preparar acuerdo de divorcio',
    descripcion: 'Redactar el acuerdo de divorcio según lo conversado con las partes',
    fechaCreacion: new Date('2023-04-20').toISOString(),
    fechaVencimiento: new Date('2023-05-05').toISOString(),
    estado: EstadoTarea.EN_PROGRESO,
    prioridad: PrioridadTarea.ALTA,
    responsableId: '201',
    expedienteId: '2',
    creadorId: '201'
  },
  {
    id: '5',
    titulo: 'Audiencia preliminar',
    descripcion: 'Asistir a la audiencia preliminar en el juzgado',
    fechaCreacion: new Date('2023-04-25').toISOString(),
    fechaVencimiento: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
    estado: EstadoTarea.PENDIENTE,
    prioridad: PrioridadTarea.ALTA,
    responsableId: '202',
    expedienteId: '2',
    creadorId: '202'
  },
  {
    id: '6',
    titulo: 'Análisis de documentación sucesoria',
    descripcion: 'Revisar toda la documentación aportada por los herederos',
    fechaCreacion: new Date('2023-01-15').toISOString(),
    fechaVencimiento: new Date('2023-02-01').toISOString(),
    estado: EstadoTarea.COMPLETADA,
    prioridad: PrioridadTarea.MEDIA,
    responsableId: '203',
    expedienteId: '3',
    creadorId: '202',
    fechaCompletada: new Date('2023-01-30').toISOString()
  },
  {
    id: '7',
    titulo: 'Presentar recursos de apelación',
    descripcion: 'Redactar y presentar recurso de apelación contra sentencia desfavorable',
    fechaCreacion: new Date('2023-04-01').toISOString(),
    fechaVencimiento: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    estado: EstadoTarea.PENDIENTE,
    prioridad: PrioridadTarea.ALTA,
    responsableId: '201',
    expedienteId: '4',
    creadorId: '201'
  },
  {
    id: '8',
    titulo: 'Notificar a la parte demandada',
    descripcion: 'Gestionar la notificación formal a la parte demandada',
    fechaCreacion: new Date('2023-04-05').toISOString(),
    fechaVencimiento: new Date('2023-04-20').toISOString(),
    estado: EstadoTarea.COMPLETADA,
    prioridad: PrioridadTarea.MEDIA,
    responsableId: '202',
    expedienteId: '5',
    creadorId: '202',
    fechaCompletada: new Date('2023-04-18').toISOString()
  }
];

// Forzar modo desarrollo para pruebas
const isDevelopment = true;

// Variable para mantener las tareas en memoria durante el desarrollo
let tareasEnMemoria: Tarea[] = [...tareasDePrueba];

// Asegurarse que cada tarea tenga el formato correcto con fechas apropiadas
const formatearTarea = (tarea: Tarea): Tarea => {
  return {
    ...tarea,
    fechaCreacion: tarea.fechaCreacion ? new Date(tarea.fechaCreacion).toISOString() : new Date().toISOString(),
    fechaVencimiento: tarea.fechaVencimiento ? new Date(tarea.fechaVencimiento).toISOString() : new Date().toISOString(),
    fechaCompletada: tarea.fechaCompletada ? new Date(tarea.fechaCompletada).toISOString() : undefined
  };
};

interface TareaState {
  tareas: Tarea[];
  tareaSeleccionada: Tarea | null;
  isLoading: boolean;
  error: string | null;
  etiquetas: Etiqueta[];

  // Acciones principales
  fetchTareas: (params?: any) => Promise<void>;
  getTarea: (id: string) => Promise<Tarea | null>;
  createTarea: (tarea: Omit<Tarea, 'id'>) => Promise<Tarea | null>;
  updateTarea: (id: string, tarea: Partial<Tarea>) => Promise<Tarea | null>;
  deleteTarea: (id: string) => Promise<boolean>;

  // Acciones de filtrado
  getTareasVencidas: () => Promise<Tarea[]>;
  getTareasPendientes: () => Promise<void>;
  getTareasByExpediente: (expedienteId: string) => Promise<void>;

  // Filtros y búsqueda
  filterByEstado: (estado: EstadoTarea | null) => Tarea[];
  filterByPrioridad: (prioridad: PrioridadTarea | null) => Tarea[];
  filterByEtiqueta: (etiquetaId: string | null) => Tarea[];
  searchTareas: (texto: string) => Tarea[];

  // Acciones del UI
  setTareaSeleccionada: (tarea: Tarea | null) => void;
  clearError: () => void;

  // Gestión de etiquetas
  fetchEtiquetas: () => Promise<Etiqueta[]>;
  addEtiquetaToTarea: (tareaId: string, etiqueta: Etiqueta) => Promise<boolean>;
  removeEtiquetaFromTarea: (tareaId: string, etiquetaId: string) => Promise<boolean>;

  // Recordatorios y notificaciones
  getTareasProximasAVencer: (diasLimite: number) => Promise<Tarea[]>;
  verificarNotificacionesPendientes: (diasLimite: number) => Promise<void>;
  notificarTareaProximaAVencer: (tarea: Tarea, diasRestantes: number) => void;

  // Compartir tareas
  compartirTarea: (tareaId: string, usuarioId: string, permisos: PermisoCompartido) => Promise<boolean>;
  dejarDeCompartirTarea: (tareaId: string, usuarioId: string) => Promise<boolean>;
  getUsuariosCompartidos: (tareaId: string) => Promise<UsuarioCompartido[]>;

  // Comentarios de tareas
  addComentario: (tareaId: string, usuarioId: string, texto: string) => Promise<ComentarioTarea | null>;
  editComentario: (comentarioId: string, texto: string) => Promise<ComentarioTarea | null>;
  deleteComentario: (comentarioId: string) => Promise<boolean>;
  getComentariosTarea: (tareaId: string) => Promise<ComentarioTarea[]>;
}

export const useTareaStore = create<TareaState>((set, get) => ({
  tareas: [],
  tareaSeleccionada: null,
  isLoading: false,
  error: null,
  etiquetas: [...etiquetasDePrueba],

  // Cargar todas las tareas con posibilidad de filtros
  fetchTareas: async (params) => {
    try {
      console.log('Store fetchTareas: Iniciando carga de tareas', params);
      set({ isLoading: true, error: null });

      // En modo desarrollo, usar datos de prueba
      if (isDevelopment) {
        console.log('Store fetchTareas: Modo desarrollo, usando datos de prueba');
        // Asegurar que todas las tareas estén formateadas correctamente
        tareasEnMemoria = tareasEnMemoria.map(tarea => formatearTarea(tarea));
        console.log('Store fetchTareas: tareas en memoria:', tareasEnMemoria.length);

        setTimeout(() => {
          console.log('Store fetchTareas: Actualizando estado con tareas:', tareasEnMemoria.length);
          set({ tareas: tareasEnMemoria, isLoading: false });
        }, 500);
        return;
      }

      console.log('Store fetchTareas: Llamando a API');
      const response = await tareaService.getTareas(params);
      console.log('Store fetchTareas: Respuesta de API:', response?.data?.length || 0, 'tareas');
      set({ tareas: response.data, isLoading: false });
    } catch (error: any) {
      console.error('Store fetchTareas: Error al cargar tareas:', error);
      const message = error.response?.data?.message || 'Error al cargar tareas';

      // En modo desarrollo, usar datos de prueba incluso si hay error
      if (isDevelopment) {
        console.log('Store fetchTareas: Error pero recuperando con datos de prueba');
        // Asegurar que todas las tareas estén formateadas correctamente
        tareasEnMemoria = tareasEnMemoria.map(tarea => formatearTarea(tarea));

        setTimeout(() => {
          console.log('Store fetchTareas: Error recuperado, actualizando estado');
          set({ tareas: tareasEnMemoria, isLoading: false });
        }, 500);
        return;
      }

      console.error('Store fetchTareas: Error final:', message);
      set({ error: message, isLoading: false });
      useUIStore.getState().addNotification({
        type: 'error',
        message
      });
    }
  },

  // Obtener una tarea por ID
  getTarea: async (id: string) => {
    try {
      set({ isLoading: true, error: null });

      // En modo desarrollo, buscar en datos de prueba
      if (isDevelopment) {
        const tarea = tareasDePrueba.find(t => t.id === id) || null;
        setTimeout(() => {
          set({ tareaSeleccionada: tarea, isLoading: false });
        }, 500);
        return tarea;
      }

      const response = await tareaService.getTareaById(id);
      const tarea = response.data;
      set({ tareaSeleccionada: tarea, isLoading: false });
      return tarea;
    } catch (error: any) {
      const message = error.response?.data?.message || `Error al obtener tarea ${id}`;

      // En desarrollo, si hay error buscamos en datos locales
      if (isDevelopment) {
        const tarea = tareasDePrueba.find(t => t.id === id) || null;
        set({ tareaSeleccionada: tarea, isLoading: false });
        return tarea;
      }

      set({ error: message, isLoading: false });
      useUIStore.getState().addNotification({
        type: 'error',
        message
      });
      return null;
    }
  },

  // Crear una nueva tarea
  createTarea: async (tareaData) => {
    try {
      set({ isLoading: true, error: null });

      // En modo desarrollo, simular creación
      if (isDevelopment) {
        // Generar un ID único basado en timestamp + número aleatorio
        const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const nuevaTarea = formatearTarea({
          ...tareaData,
          id: uniqueId,
          fechaCreacion: new Date().toISOString()
        } as Tarea);

        // Agregar a la memoria
        tareasEnMemoria = [...tareasEnMemoria, nuevaTarea];

        setTimeout(() => {
          set(state => ({
            tareas: [...state.tareas, nuevaTarea],
            isLoading: false
          }));
        }, 500);

        // Notificar creación exitosa
        useUIStore.getState().addNotification({
          type: 'success',
          message: 'Tarea creada correctamente'
        });

        return nuevaTarea;
      }

      const response = await tareaService.createTarea(tareaData);
      const nuevaTarea = response.data;

      set(state => ({
        tareas: [...state.tareas, nuevaTarea],
        isLoading: false
      }));

      // Notificar creación exitosa
      useUIStore.getState().addNotification({
        type: 'success',
        message: 'Tarea creada correctamente'
      });

      return nuevaTarea;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al crear tarea';

      // En desarrollo, simular éxito incluso con error
      if (isDevelopment) {
        // Generar un ID único basado en timestamp + número aleatorio
        const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const nuevaTarea = formatearTarea({
          ...tareaData,
          id: uniqueId,
          fechaCreacion: new Date().toISOString()
        } as Tarea);

        // Agregar a la memoria
        tareasEnMemoria = [...tareasEnMemoria, nuevaTarea];

        setTimeout(() => {
          set(state => ({
            tareas: [...state.tareas, nuevaTarea],
            isLoading: false
          }));
        }, 500);

        // Notificar creación exitosa
        useUIStore.getState().addNotification({
          type: 'success',
          message: 'Tarea creada correctamente'
        });

        return nuevaTarea;
      }

      set({ error: message, isLoading: false });
      useUIStore.getState().addNotification({
        type: 'error',
        message
      });
      return null;
    }
  },

  // Actualizar una tarea existente
  updateTarea: async (id, tareaData) => {
    try {
      console.log('Store updateTarea: Iniciando actualización de tarea:', id);
      console.log('Store updateTarea: Datos a actualizar:', tareaData);
      set({ isLoading: true, error: null });

      // En modo desarrollo, simular actualización
      if (isDevelopment) {
        console.log('Store updateTarea: Modo desarrollo, simulando actualización');
        // Verificar que la tarea exista
        const tareaExistente = tareasEnMemoria.find(t => t.id === id);

        if (!tareaExistente) {
          console.error('Store updateTarea: No se encontró la tarea con ID:', id);
          set({ error: `No se encontró la tarea con ID ${id}`, isLoading: false });
          useUIStore.getState().addNotification({
            type: 'error',
            message: `No se encontró la tarea con ID ${id}`
          });
          return null;
        }

        console.log('Store updateTarea: Tarea existente encontrada:', tareaExistente);

        // Si se actualiza el estado a completado, agregar la fecha de completado
        if (tareaData.estado === EstadoTarea.COMPLETADA && !tareaData.fechaCompletada) {
          console.log('Store updateTarea: Estableciendo fechaCompletada para tarea completada');
          tareaData.fechaCompletada = new Date().toISOString();
        }

        const tareaActualizada = formatearTarea({
          ...tareaExistente,
          ...tareaData
        } as Tarea);

        console.log('Store updateTarea: Tarea actualizada:', tareaActualizada);

        // Actualizar en memoria
        tareasEnMemoria = tareasEnMemoria.map(t =>
          t.id === id ? tareaActualizada : t
        );
        console.log('Store updateTarea: Memoria actualizada, tareasEnMemoria tiene:', tareasEnMemoria.length, 'elementos');

        // Simular retardo de red
        console.log('Store updateTarea: Simulando retardo de red...');
        await new Promise(resolve => setTimeout(resolve, 500));

        // Actualizar estado de la aplicación
        console.log('Store updateTarea: Actualizando estado de la aplicación');
        set(state => {
          console.log('Store updateTarea: Estado actual tiene', state.tareas.length, 'tareas');
          const nuevoEstado = {
            tareas: state.tareas.map(t =>
              t.id === id ? tareaActualizada : t
            ),
            tareaSeleccionada: state.tareaSeleccionada?.id === id
              ? tareaActualizada
              : state.tareaSeleccionada,
            isLoading: false
          };
          console.log('Store updateTarea: Nuevo estado preparado');
          return nuevoEstado;
        });

        // Notificar actualización exitosa
        console.log('Store updateTarea: Enviando notificación de éxito');
        useUIStore.getState().addNotification({
          type: 'success',
          message: 'Tarea actualizada correctamente'
        });

        console.log('Store updateTarea: Operación completada, retornando tarea actualizada');
        return tareaActualizada;
      }

      // En entorno real
      console.log('Store updateTarea: Modo producción, llamando a API');
      const response = await tareaService.updateTarea(id, tareaData);
      const tareaActualizada = response.data;
      console.log('Store updateTarea: Respuesta de API recibida:', tareaActualizada);

      // Actualizar estado
      console.log('Store updateTarea: Actualizando estado con datos de API');
      set(state => ({
        tareas: state.tareas.map(t =>
          t.id === id ? tareaActualizada : t
        ),
        tareaSeleccionada: state.tareaSeleccionada?.id === id
          ? tareaActualizada
          : state.tareaSeleccionada,
        isLoading: false
      }));

      // Notificar actualización exitosa
      useUIStore.getState().addNotification({
        type: 'success',
        message: 'Tarea actualizada correctamente'
      });

      return tareaActualizada;
    } catch (error: any) {
      console.error('Store updateTarea: Error al actualizar tarea:', error);
      const message = error.response?.data?.message || `Error al actualizar tarea ${id}`;

      // En desarrollo, simular éxito incluso con error
      if (isDevelopment) {
        console.log('Store updateTarea: Error en modo desarrollo, simulando recuperación');
        // Verificar que la tarea exista
        const tareaExistente = tareasEnMemoria.find(t => t.id === id);

        if (!tareaExistente) {
          console.error('Store updateTarea: No se encontró la tarea en recuperación');
          set({ error: `No se encontró la tarea con ID ${id}`, isLoading: false });
          useUIStore.getState().addNotification({
            type: 'error',
            message: `No se encontró la tarea con ID ${id}`
          });
          return null;
        }

        // Si se actualiza el estado a completado, agregar la fecha de completado
        if (tareaData.estado === EstadoTarea.COMPLETADA && !tareaData.fechaCompletada) {
          tareaData.fechaCompletada = new Date().toISOString();
        }

        const tareaActualizada = formatearTarea({
          ...tareaExistente,
          ...tareaData
        } as Tarea);

        console.log('Store updateTarea: Tarea preparada en recuperación:', tareaActualizada);

        // Actualizar en memoria
        tareasEnMemoria = tareasEnMemoria.map(t =>
          t.id === id ? tareaActualizada : t
        );

        // Simular retardo
        await new Promise(resolve => setTimeout(resolve, 500));

        // Actualizar estado
        console.log('Store updateTarea: Actualizando estado en recuperación');
        set(state => ({
          tareas: state.tareas.map(t =>
            t.id === id ? tareaActualizada : t
          ),
          tareaSeleccionada: state.tareaSeleccionada?.id === id
            ? tareaActualizada
            : state.tareaSeleccionada,
          isLoading: false
        }));

        // Notificar actualización exitosa
        useUIStore.getState().addNotification({
          type: 'success',
          message: 'Tarea actualizada correctamente'
        });

        console.log('Store updateTarea: Recuperación exitosa');
        return tareaActualizada;
      }

      console.error('Store updateTarea: Error final:', message);
      set({ error: message, isLoading: false });
      useUIStore.getState().addNotification({
        type: 'error',
        message
      });
      return null;
    }
  },

  // Eliminar una tarea
  deleteTarea: async (id) => {
    try {
      console.log('Store: Iniciando eliminación de tarea ID:', id);
      set({ isLoading: true, error: null });

      // En modo desarrollo, simular eliminación
      if (isDevelopment) {
        console.log('Store: Modo desarrollo, buscando tarea en memoria');
        // Verificar que la tarea exista
        const tareaExistente = tareasEnMemoria.find(t => t.id === id);

        if (!tareaExistente) {
          console.error('Store: No se encontró la tarea para eliminar:', id);
          set({ error: `No se encontró la tarea con ID ${id}`, isLoading: false });
          useUIStore.getState().addNotification({
            type: 'error',
            message: `No se encontró la tarea con ID ${id}`
          });
          return false;
        }

        console.log('Store: Tarea encontrada, procediendo a eliminar:', tareaExistente);

        // Eliminar de la memoria
        tareasEnMemoria = tareasEnMemoria.filter(t => t.id !== id);
        console.log('Store: Tarea eliminada de la memoria, tareasEnMemoria actualmente tiene:', tareasEnMemoria.length);

        // Simular retraso en la respuesta
        console.log('Store: Simulando retraso en la respuesta');
        await new Promise(resolve => setTimeout(resolve, 500));

        // Actualizar el estado
        console.log('Store: Actualizando estado de la tienda');
        set(state => {
          console.log('Store: Estado actual tiene', state.tareas.length, 'tareas');
          const nuevoEstado = {
            tareas: state.tareas.filter(t => t.id !== id),
            tareaSeleccionada: state.tareaSeleccionada?.id === id
              ? null
              : state.tareaSeleccionada,
            isLoading: false
          };
          console.log('Store: Nuevo estado tendrá', nuevoEstado.tareas.length, 'tareas');
          return nuevoEstado;
        });

        // Notificar eliminación exitosa
        console.log('Store: Enviando notificación de éxito');
        useUIStore.getState().addNotification({
          type: 'success',
          message: 'Tarea eliminada correctamente'
        });

        console.log('Store: Operación completada con éxito');
        return true;
      }

      // Petición a la API real
      console.log('Store: Modo producción, llamando a API');
      await tareaService.deleteTarea(id);

      // Actualizar estado
      console.log('Store: Actualizando estado tras eliminación en API');
      set(state => ({
        tareas: state.tareas.filter(t => t.id !== id),
        tareaSeleccionada: state.tareaSeleccionada?.id === id
          ? null
          : state.tareaSeleccionada,
        isLoading: false
      }));

      // Notificar eliminación exitosa
      useUIStore.getState().addNotification({
        type: 'success',
        message: 'Tarea eliminada correctamente'
      });

      return true;
    } catch (error: any) {
      console.error('Store: Error al eliminar tarea:', error);
      const message = error.response?.data?.message || `Error al eliminar tarea ${id}`;

      // En desarrollo, simular éxito incluso con error
      if (isDevelopment) {
        console.log('Store: Modo desarrollo - error, pero intentando simular éxito');
        // Verificar que la tarea exista
        const tareaExistente = tareasEnMemoria.find(t => t.id === id);

        if (!tareaExistente) {
          console.error('Store: No se encontró la tarea en la simulación de recuperación:', id);
          set({ error: `No se encontró la tarea con ID ${id}`, isLoading: false });
          useUIStore.getState().addNotification({
            type: 'error',
            message: `No se encontró la tarea con ID ${id}`
          });
          return false;
        }

        // Eliminar de la memoria
        tareasEnMemoria = tareasEnMemoria.filter(t => t.id !== id);
        console.log('Store: Tarea eliminada del almacén de recuperación');

        // Simular retraso en la respuesta
        await new Promise(resolve => setTimeout(resolve, 500));

        // Actualizar estado
        console.log('Store: Actualizando estado en recuperación de error');
        set(state => ({
          tareas: state.tareas.filter(t => t.id !== id),
          tareaSeleccionada: state.tareaSeleccionada?.id === id
            ? null
            : state.tareaSeleccionada,
          isLoading: false
        }));

        // Notificar eliminación exitosa
        useUIStore.getState().addNotification({
          type: 'success',
          message: 'Tarea eliminada correctamente'
        });

        console.log('Store: Recuperación completada con éxito');
        return true;
      }

      console.error('Store: Error final, sin recuperación:', message);
      set({ error: message, isLoading: false });
      useUIStore.getState().addNotification({
        type: 'error',
        message
      });
      return false;
    }
  },

  // Obtener tareas vencidas
  getTareasVencidas: async () => {
    try {
      set({ isLoading: true, error: null });

      // En modo desarrollo, filtrar tareas vencidas de los datos de prueba
      if (isDevelopment) {
        const hoy = new Date();
        const tareasVencidas = tareasDePrueba.filter(t =>
          new Date(t.fechaVencimiento) < hoy &&
          (t.estado === EstadoTarea.PENDIENTE || t.estado === EstadoTarea.EN_PROGRESO)
        );

        setTimeout(() => {
          set({ tareas: tareasVencidas, isLoading: false });
        }, 500);

        return tareasVencidas;
      }

      const response = await tareaService.getTareas({ soloVencidas: true });
      const tareas = response.data;
      set({ tareas, isLoading: false });
      return tareas;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al cargar tareas vencidas';

      // En modo desarrollo, retornar tareas vencidas simuladas incluso en caso de error
      if (isDevelopment) {
        const hoy = new Date();
        const tareasVencidas = tareasDePrueba.filter(t =>
          new Date(t.fechaVencimiento) < hoy &&
          (t.estado === EstadoTarea.PENDIENTE || t.estado === EstadoTarea.EN_PROGRESO)
        );

        setTimeout(() => {
          set({ tareas: tareasVencidas, isLoading: false });
        }, 500);

        return tareasVencidas;
      }

      set({ error: message, isLoading: false });
      useUIStore.getState().addNotification({
        type: 'error',
        message
      });
      return [];
    }
  },

  // Obtener tareas pendientes
  getTareasPendientes: async () => {
    try {
      set({ isLoading: true, error: null });

      // En modo desarrollo, filtrar tareas pendientes de los datos de prueba
      if (isDevelopment) {
        const tareasPendientes = tareasDePrueba.filter(t =>
          t.estado === EstadoTarea.PENDIENTE
        );

        setTimeout(() => {
          set({ tareas: tareasPendientes, isLoading: false });
        }, 800);

        return;
      }

      const response = await tareaService.getTareas({
        estado: EstadoTarea.PENDIENTE
      });
      set({ tareas: response.data, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al cargar tareas pendientes';

      // En modo desarrollo, filtrar de todas formas
      if (isDevelopment) {
        const tareasPendientes = tareasDePrueba.filter(t =>
          t.estado === EstadoTarea.PENDIENTE
        );

        setTimeout(() => {
          set({ tareas: tareasPendientes, isLoading: false });
        }, 800);

        return;
      }

      set({ error: message, isLoading: false });
      useUIStore.getState().addNotification({
        type: 'error',
        message
      });
    }
  },

  // Obtener tareas por expediente
  getTareasByExpediente: async (expedienteId) => {
    try {
      set({ isLoading: true, error: null });

      // En modo desarrollo, filtrar tareas por expediente
      if (isDevelopment) {
        // Asegurar que todas las tareas estén formateadas correctamente
        tareasEnMemoria = tareasEnMemoria.map(tarea => formatearTarea(tarea));

        const tareasPorExpediente = tareasEnMemoria.filter(t =>
          t.expedienteId === expedienteId
        );

        setTimeout(() => {
          set({ tareas: tareasPorExpediente, isLoading: false });
        }, 500);

        return;
      }

      const response = await tareaService.getTareas({ expedienteId });
      set({ tareas: response.data, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || `Error al cargar tareas del expediente ${expedienteId}`;

      // En modo desarrollo, filtrar de todas formas
      if (isDevelopment) {
        // Asegurar que todas las tareas estén formateadas correctamente
        tareasEnMemoria = tareasEnMemoria.map(tarea => formatearTarea(tarea));

        const tareasPorExpediente = tareasEnMemoria.filter(t =>
          t.expedienteId === expedienteId
        );

        setTimeout(() => {
          set({ tareas: tareasPorExpediente, isLoading: false });
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

  // Filtrar tareas por estado
  filterByEstado: (estado) => {
    const { tareas } = get();
    if (!estado) return tareas;
    return tareas.filter(tarea => tarea.estado === estado);
  },

  // Filtrar tareas por prioridad
  filterByPrioridad: (prioridad) => {
    const { tareas } = get();
    if (!prioridad) return tareas;
    return tareas.filter(tarea => tarea.prioridad === prioridad);
  },

  // Filtrar tareas por etiqueta
  filterByEtiqueta: (etiquetaId) => {
    const { tareas } = get();
    if (!etiquetaId) return tareas;
    return tareas.filter(tarea =>
      tarea.etiquetas?.some(etiqueta => etiqueta.id === etiquetaId)
    );
  },

  // Buscar tareas por texto
  searchTareas: (texto) => {
    const { tareas } = get();
    if (!texto) return tareas;

    const searchTerm = texto.toLowerCase();
    return tareas.filter(tarea =>
      tarea.titulo.toLowerCase().includes(searchTerm) ||
      tarea.descripcion.toLowerCase().includes(searchTerm)
    );
  },

  // Establecer la tarea seleccionada
  setTareaSeleccionada: (tarea) => {
    set({ tareaSeleccionada: tarea });
  },

  // Limpiar errores
  clearError: () => {
    set({ error: null });
  },

  // Obtener todas las etiquetas
  fetchEtiquetas: async () => {
    try {
      console.log('Store fetchEtiquetas: Iniciando carga de etiquetas');
      set({ isLoading: true, error: null });

      // En modo desarrollo, usar datos de prueba
      if (isDevelopment) {
        console.log('Store fetchEtiquetas: Modo desarrollo, usando etiquetas de prueba');

        setTimeout(() => {
          set({ etiquetas: etiquetasDePrueba, isLoading: false });
        }, 300);

        return etiquetasDePrueba;
      }

      // En modo producción, se llamaría a la API
      // const response = await etiquetaService.getEtiquetas();
      // set({ etiquetas: response.data, isLoading: false });
      // return response.data;

      return etiquetasDePrueba;
    } catch (error: any) {
      console.error('Store fetchEtiquetas: Error al cargar etiquetas:', error);
      set({ error: 'Error al cargar etiquetas', isLoading: false });
      return [];
    }
  },

  // Añadir una etiqueta a una tarea
  addEtiquetaToTarea: async (tareaId, etiqueta) => {
    try {
      console.log(`Store addEtiquetaToTarea: Añadiendo etiqueta ${etiqueta.id} a tarea ${tareaId}`);
      set({ isLoading: true, error: null });

      // Obtener la tarea actual
      const tarea = get().tareas.find(t => t.id === tareaId);
      if (!tarea) {
        console.error('Store addEtiquetaToTarea: Tarea no encontrada');
        set({ isLoading: false, error: 'Tarea no encontrada' });
        return false;
      }

      // Verificar si la etiqueta ya existe en la tarea
      if (tarea.etiquetas?.some(e => e.id === etiqueta.id)) {
        console.log('Store addEtiquetaToTarea: La etiqueta ya existe en esta tarea');
        set({ isLoading: false });
        return true;
      }

      // Crear array de etiquetas si no existe
      const etiquetasActuales = tarea.etiquetas || [];

      // Añadir la nueva etiqueta
      const nuevasEtiquetas = [...etiquetasActuales, etiqueta];

      // Actualizar la tarea con la nueva etiqueta
      const resultado = await get().updateTarea(tareaId, { etiquetas: nuevasEtiquetas });

      return !!resultado;
    } catch (error: any) {
      console.error('Store addEtiquetaToTarea: Error al añadir etiqueta:', error);
      set({ error: 'Error al añadir etiqueta', isLoading: false });
      return false;
    }
  },

  // Eliminar una etiqueta de una tarea
  removeEtiquetaFromTarea: async (tareaId, etiquetaId) => {
    try {
      console.log(`Store removeEtiquetaFromTarea: Eliminando etiqueta ${etiquetaId} de tarea ${tareaId}`);
      set({ isLoading: true, error: null });

      // Obtener la tarea actual
      const tarea = get().tareas.find(t => t.id === tareaId);
      if (!tarea || !tarea.etiquetas) {
        console.error('Store removeEtiquetaFromTarea: Tarea no encontrada o sin etiquetas');
        set({ isLoading: false, error: 'Tarea no encontrada o sin etiquetas' });
        return false;
      }

      // Filtrar la etiqueta a eliminar
      const nuevasEtiquetas = tarea.etiquetas.filter(e => e.id !== etiquetaId);

      // Actualizar la tarea sin la etiqueta
      const resultado = await get().updateTarea(tareaId, { etiquetas: nuevasEtiquetas });

      return !!resultado;
    } catch (error: any) {
      console.error('Store removeEtiquetaFromTarea: Error al eliminar etiqueta:', error);
      set({ error: 'Error al eliminar etiqueta', isLoading: false });
      return false;
    }
  },

  // Obtener tareas próximas a vencer en X días
  getTareasProximasAVencer: async (diasLimite = 3) => {
    try {
      console.log(`Store getTareasProximasAVencer: Buscando tareas que vencen en ${diasLimite} días o menos`);
      set({ isLoading: true, error: null });

      // Calcular fecha límite
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() + diasLimite);
      console.log(`Store getTareasProximasAVencer: Fecha límite: ${fechaLimite.toISOString()}`);

      // En modo desarrollo, filtrar tareas próximas a vencer de los datos en memoria
      if (isDevelopment) {
        const tareasProximasAVencer = tareasEnMemoria.filter(t => {
          // Solo considerar tareas que no estén completadas o canceladas
          if (t.estado === EstadoTarea.COMPLETADA || t.estado === EstadoTarea.CANCELADA) {
            return false;
          }

          const fechaVencimiento = new Date(t.fechaVencimiento);
          return fechaVencimiento <= fechaLimite && fechaVencimiento >= new Date();
        });

        console.log(`Store getTareasProximasAVencer: Encontradas ${tareasProximasAVencer.length} tareas próximas a vencer`);
        setTimeout(() => {
          set({ isLoading: false });
        }, 300);

        return tareasProximasAVencer;
      }

      // En producción, haríamos una llamada a la API
      // const response = await tareaService.getTareas({ proximasAVencer: true, diasLimite });
      // return response.data;

      return [];
    } catch (error: any) {
      console.error('Store getTareasProximasAVencer: Error:', error);
      set({ error: 'Error al buscar tareas próximas a vencer', isLoading: false });
      return [];
    }
  },

  // Verificar y notificar tareas pendientes que vencen pronto
  verificarNotificacionesPendientes: async (diasLimite = 3) => {
    try {
      console.log(`Store verificarNotificacionesPendientes: Verificando tareas que vencen en ${diasLimite} días o menos`);

      // Obtener tareas próximas a vencer
      const tareasProximasAVencer = await get().getTareasProximasAVencer(diasLimite);

      if (tareasProximasAVencer.length === 0) {
        console.log('Store verificarNotificacionesPendientes: No hay tareas próximas a vencer');
        return;
      }

      console.log(`Store verificarNotificacionesPendientes: Procesando ${tareasProximasAVencer.length} notificaciones`);

      // Procesar cada tarea y enviar notificación
      tareasProximasAVencer.forEach(tarea => {
        const fechaVencimiento = new Date(tarea.fechaVencimiento);
        const hoy = new Date();

        // Calcular días restantes
        const diasRestantes = Math.ceil((fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

        // Notificar según los días restantes
        get().notificarTareaProximaAVencer(tarea, diasRestantes);
      });

    } catch (error: any) {
      console.error('Store verificarNotificacionesPendientes: Error:', error);
    }
  },

  // Enviar notificación para una tarea próxima a vencer
  notificarTareaProximaAVencer: (tarea, diasRestantes) => {
    console.log(`Store notificarTareaProximaAVencer: Notificando tarea ${tarea.id}, días restantes: ${diasRestantes}`);

    let tipo: 'warning' | 'error' = 'warning';
    let mensaje = '';

    // Determinar el tipo y mensaje de la notificación según la urgencia
    if (diasRestantes <= 0) {
      tipo = 'error';
      mensaje = `¡VENCE HOY! - ${tarea.titulo}`;
    } else if (diasRestantes === 1) {
      tipo = 'error';
      mensaje = `¡Vence mañana! - ${tarea.titulo}`;
    } else {
      mensaje = `Vence en ${diasRestantes} días - ${tarea.titulo}`;
    }

    // Enviar la notificación usando el store de UI
    useUIStore.getState().addNotification({
      type: tipo,
      message: 'Tarea por vencer',
      description: mensaje
    });
  },

  // Compartir tarea con otro usuario
  compartirTarea: async (tareaId: string, usuarioId: string, permisos: PermisoCompartido) => {
    try {
      console.log(`Store compartirTarea: Compartiendo tarea ${tareaId} con usuario ${usuarioId} - permisos: ${permisos}`);
      set({ isLoading: true, error: null });

      // Verificar que la tarea exista
      const tarea = await get().getTarea(tareaId);
      if (!tarea) {
        console.error('Store compartirTarea: No se encontró la tarea');
        set({ error: 'No se encontró la tarea', isLoading: false });
        return false;
      }

      // En modo desarrollo, simular la operación
      if (isDevelopment) {
        // Verificar si ya está compartida con este usuario
        const yaCompartida = usuariosCompartidosEnMemoria.some(
          uc => uc.tareaId === tareaId && uc.usuarioId === usuarioId
        );

        if (yaCompartida) {
          // Actualizar permisos si ya está compartida
          usuariosCompartidosEnMemoria = usuariosCompartidosEnMemoria.map(uc =>
            (uc.tareaId === tareaId && uc.usuarioId === usuarioId)
              ? { ...uc, permisos, fechaCompartida: new Date().toISOString() }
              : uc
          );
        } else {
          // Crear nuevo registro de compartir
          const nuevoCompartido: UsuarioCompartido = {
            id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            tareaId,
            usuarioId,
            permisos,
            fechaCompartida: new Date().toISOString()
          };

          usuariosCompartidosEnMemoria.push(nuevoCompartido);
        }

        // Actualizar la tarea en memoria con los usuarios compartidos
        const usuariosCompartidos = usuariosCompartidosEnMemoria.filter(uc => uc.tareaId === tareaId);

        // Actualizar tarea en memoria
        tareasEnMemoria = tareasEnMemoria.map(t =>
          t.id === tareaId
            ? { ...t, usuariosCompartidos }
            : t
        );

        // Actualizar estado después de un breve retraso
        await new Promise(resolve => setTimeout(resolve, 500));

        // Actualizar el estado
        set(state => ({
          tareas: state.tareas.map(t =>
            t.id === tareaId
              ? { ...t, usuariosCompartidos }
              : t
          ),
          isLoading: false
        }));

        // Notificar éxito
        useUIStore.getState().addNotification({
          type: 'success',
          message: 'Tarea compartida',
          description: 'La tarea se ha compartido correctamente con el usuario'
        });

        return true;
      }

      // En producción, haríamos una llamada a la API
      // const response = await tareaService.compartirTarea(tareaId, usuarioId, permisos);
      // return response.data.success;

      return false;
    } catch (error: any) {
      console.error('Store compartirTarea: Error:', error);
      set({ error: 'Error al compartir tarea', isLoading: false });

      useUIStore.getState().addNotification({
        type: 'error',
        message: 'Error',
        description: 'No se pudo compartir la tarea con el usuario'
      });

      return false;
    }
  },

  // Dejar de compartir tarea con un usuario
  dejarDeCompartirTarea: async (tareaId: string, usuarioId: string) => {
    try {
      console.log(`Store dejarDeCompartirTarea: Eliminando compartir de tarea ${tareaId} con usuario ${usuarioId}`);
      set({ isLoading: true, error: null });

      // En modo desarrollo, simular la operación
      if (isDevelopment) {
        // Eliminar la entrada de compartir
        usuariosCompartidosEnMemoria = usuariosCompartidosEnMemoria.filter(
          uc => !(uc.tareaId === tareaId && uc.usuarioId === usuarioId)
        );

        // Actualizar la tarea en memoria con los usuarios compartidos actualizados
        const usuariosCompartidos = usuariosCompartidosEnMemoria.filter(uc => uc.tareaId === tareaId);

        // Actualizar tarea en memoria
        tareasEnMemoria = tareasEnMemoria.map(t =>
          t.id === tareaId
            ? { ...t, usuariosCompartidos }
            : t
        );

        // Actualizar estado después de un breve retraso
        await new Promise(resolve => setTimeout(resolve, 500));

        // Actualizar el estado
        set(state => ({
          tareas: state.tareas.map(t =>
            t.id === tareaId
              ? { ...t, usuariosCompartidos }
              : t
          ),
          isLoading: false
        }));

        // Notificar éxito
        useUIStore.getState().addNotification({
          type: 'success',
          message: 'Compartir eliminado',
          description: 'La tarea ya no se comparte con el usuario'
        });

        return true;
      }

      // En producción, haríamos una llamada a la API
      // const response = await tareaService.dejarDeCompartirTarea(tareaId, usuarioId);
      // return response.data.success;

      return false;
    } catch (error: any) {
      console.error('Store dejarDeCompartirTarea: Error:', error);
      set({ error: 'Error al dejar de compartir tarea', isLoading: false });

      useUIStore.getState().addNotification({
        type: 'error',
        message: 'Error',
        description: 'No se pudo dejar de compartir la tarea'
      });

      return false;
    }
  },

  // Obtener usuarios con los que se comparte una tarea
  getUsuariosCompartidos: async (tareaId: string) => {
    try {
      console.log(`Store getUsuariosCompartidos: Obteniendo usuarios compartidos para tarea ${tareaId}`);
      set({ isLoading: true, error: null });

      // En modo desarrollo, obtener los datos de memoria
      if (isDevelopment) {
        const usuariosCompartidos = usuariosCompartidosEnMemoria.filter(uc => uc.tareaId === tareaId);

        // Simular retardo de red
        await new Promise(resolve => setTimeout(resolve, 300));

        set({ isLoading: false });
        return usuariosCompartidos;
      }

      // En producción, haríamos una llamada a la API
      // const response = await tareaService.getUsuariosCompartidos(tareaId);
      // return response.data;

      return [];
    } catch (error: any) {
      console.error('Store getUsuariosCompartidos: Error:', error);
      set({ error: 'Error al obtener usuarios compartidos', isLoading: false });
      return [];
    }
  },

  // Añadir un comentario a una tarea
  addComentario: async (tareaId: string, usuarioId: string, texto: string) => {
    try {
      console.log(`Store addComentario: Añadiendo comentario a tarea ${tareaId}`);
      set({ isLoading: true, error: null });

      // En modo desarrollo, simular la operación
      if (isDevelopment) {
        // Crear nuevo comentario
        const nuevoComentario: ComentarioTarea = {
          id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          tareaId,
          usuarioId,
          texto,
          fechaCreacion: new Date().toISOString()
        };

        // Añadir a la memoria
        comentariosEnMemoria.push(nuevoComentario);

        // Obtener todos los comentarios de la tarea
        const comentariosTarea = comentariosEnMemoria.filter(c => c.tareaId === tareaId);

        // Actualizar tarea en memoria con los comentarios
        tareasEnMemoria = tareasEnMemoria.map(t =>
          t.id === tareaId
            ? { ...t, comentarios: comentariosTarea }
            : t
        );

        // Actualizar estado después de un breve retraso
        await new Promise(resolve => setTimeout(resolve, 500));

        // Actualizar el estado
        set(state => ({
          tareas: state.tareas.map(t =>
            t.id === tareaId
              ? { ...t, comentarios: comentariosTarea }
              : t
          ),
          isLoading: false
        }));

        return nuevoComentario;
      }

      // En producción, haríamos una llamada a la API
      // const response = await tareaService.addComentario(tareaId, usuarioId, texto);
      // return response.data;

      return null;
    } catch (error: any) {
      console.error('Store addComentario: Error:', error);
      set({ error: 'Error al añadir comentario', isLoading: false });
      return null;
    }
  },

  // Editar un comentario existente
  editComentario: async (comentarioId: string, texto: string) => {
    try {
      console.log(`Store editComentario: Editando comentario ${comentarioId}`);
      set({ isLoading: true, error: null });

      // En modo desarrollo, simular la operación
      if (isDevelopment) {
        // Buscar el comentario
        const comentarioExistente = comentariosEnMemoria.find(c => c.id === comentarioId);

        if (!comentarioExistente) {
          console.error('Store editComentario: No se encontró el comentario');
          set({ error: 'No se encontró el comentario', isLoading: false });
          return null;
        }

        // Actualizar el comentario
        const comentarioActualizado: ComentarioTarea = {
          ...comentarioExistente,
          texto,
          fechaEdicion: new Date().toISOString()
        };

        // Actualizar en memoria
        comentariosEnMemoria = comentariosEnMemoria.map(c =>
          c.id === comentarioId ? comentarioActualizado : c
        );

        // Obtener la tarea asociada
        const tareaId = comentarioExistente.tareaId;

        // Obtener todos los comentarios de la tarea
        const comentariosTarea = comentariosEnMemoria.filter(c => c.tareaId === tareaId);

        // Actualizar tarea en memoria
        tareasEnMemoria = tareasEnMemoria.map(t =>
          t.id === tareaId
            ? { ...t, comentarios: comentariosTarea }
            : t
        );

        // Actualizar estado después de un breve retraso
        await new Promise(resolve => setTimeout(resolve, 500));

        // Actualizar el estado
        set(state => ({
          tareas: state.tareas.map(t =>
            t.id === tareaId
              ? { ...t, comentarios: comentariosTarea }
              : t
          ),
          isLoading: false
        }));

        return comentarioActualizado;
      }

      // En producción, haríamos una llamada a la API
      // const response = await tareaService.editComentario(comentarioId, texto);
      // return response.data;

      return null;
    } catch (error: any) {
      console.error('Store editComentario: Error:', error);
      set({ error: 'Error al editar comentario', isLoading: false });
      return null;
    }
  },

  // Eliminar un comentario
  deleteComentario: async (comentarioId: string) => {
    try {
      console.log(`Store deleteComentario: Eliminando comentario ${comentarioId}`);
      set({ isLoading: true, error: null });

      // En modo desarrollo, simular la operación
      if (isDevelopment) {
        // Buscar el comentario para obtener la tarea asociada
        const comentario = comentariosEnMemoria.find(c => c.id === comentarioId);

        if (!comentario) {
          console.error('Store deleteComentario: No se encontró el comentario');
          set({ error: 'No se encontró el comentario', isLoading: false });
          return false;
        }

        const tareaId = comentario.tareaId;

        // Eliminar de la memoria
        comentariosEnMemoria = comentariosEnMemoria.filter(c => c.id !== comentarioId);

        // Obtener todos los comentarios de la tarea
        const comentariosTarea = comentariosEnMemoria.filter(c => c.tareaId === tareaId);

        // Actualizar tarea en memoria
        tareasEnMemoria = tareasEnMemoria.map(t =>
          t.id === tareaId
            ? { ...t, comentarios: comentariosTarea }
            : t
        );

        // Actualizar estado después de un breve retraso
        await new Promise(resolve => setTimeout(resolve, 500));

        // Actualizar el estado
        set(state => ({
          tareas: state.tareas.map(t =>
            t.id === tareaId
              ? { ...t, comentarios: comentariosTarea }
              : t
          ),
          isLoading: false
        }));

        return true;
      }

      // En producción, haríamos una llamada a la API
      // const response = await tareaService.deleteComentario(comentarioId);
      // return response.data.success;

      return false;
    } catch (error: any) {
      console.error('Store deleteComentario: Error:', error);
      set({ error: 'Error al eliminar comentario', isLoading: false });
      return false;
    }
  },

  // Obtener todos los comentarios de una tarea
  getComentariosTarea: async (tareaId: string) => {
    try {
      console.log(`Store getComentariosTarea: Obteniendo comentarios de tarea ${tareaId}`);
      set({ isLoading: true, error: null });

      // En modo desarrollo, obtener de memoria
      if (isDevelopment) {
        const comentariosTarea = comentariosEnMemoria.filter(c => c.tareaId === tareaId);

        // Simular retardo de red
        await new Promise(resolve => setTimeout(resolve, 300));

        set({ isLoading: false });
        return comentariosTarea;
      }

      // En producción, haríamos una llamada a la API
      // const response = await tareaService.getComentariosTarea(tareaId);
      // return response.data;

      return [];
    } catch (error: any) {
      console.error('Store getComentariosTarea: Error:', error);
      set({ error: 'Error al obtener comentarios', isLoading: false });
      return [];
    }
  }
}));
