import { create } from 'zustand';
import { CategoriaMovimiento, TipoMovimiento } from './tesoreriaStore';
import { useUIStore } from './uiStore';

// Interfaces para la configuración
export interface CategoriaPersonalizada {
  id: string;
  nombre: string;
  tipo: TipoMovimiento;
  descripcion?: string;
  activa: boolean;
}

export interface LimiteAprobacion {
  id: string;
  rolUsuario: string;
  montoMaximo: number;
  requiereAprobacionAdicional: boolean;
  descripcion: string;
}

export interface PermisoFinanzas {
  id: string;
  rolUsuario: string;
  verMovimientos: boolean;
  crearMovimientos: boolean;
  editarMovimientos: boolean;
  eliminarMovimientos: boolean;
  verDashboard: boolean;
  exportarReportes: boolean;
  configuraCategoriasYLimites: boolean;
  gestionarPermisos: boolean;
}

export interface ConfigFinanzasState {
  categoriasPersonalizadas: CategoriaPersonalizada[];
  categoriasPredeterminadas: CategoriaMovimiento[];
  limitesAprobacion: LimiteAprobacion[];
  permisosFinanzas: PermisoFinanzas[];
  loading: boolean;
  error: string | null;

  // Acciones para categorías
  fetchCategorias: () => Promise<void>;
  addCategoria: (categoria: Omit<CategoriaPersonalizada, 'id'>) => Promise<void>;
  updateCategoria: (id: string, datos: Partial<CategoriaPersonalizada>) => Promise<void>;
  deleteCategoria: (id: string) => Promise<void>;

  // Acciones para límites de aprobación
  fetchLimitesAprobacion: () => Promise<void>;
  addLimiteAprobacion: (limite: Omit<LimiteAprobacion, 'id'>) => Promise<void>;
  updateLimiteAprobacion: (id: string, datos: Partial<LimiteAprobacion>) => Promise<void>;
  deleteLimiteAprobacion: (id: string) => Promise<void>;

  // Acciones para permisos
  fetchPermisosFinanzas: () => Promise<void>;
  addPermisoFinanzas: (permiso: Omit<PermisoFinanzas, 'id'>) => Promise<void>;
  updatePermisoFinanzas: (id: string, datos: Partial<PermisoFinanzas>) => Promise<void>;
  deletePermisoFinanzas: (id: string) => Promise<void>;
}

// Datos de ejemplo
const categoriasPredeterminadasArray: CategoriaMovimiento[] = [
  // Categorías de ingresos
  'honorarios',
  'consultas',
  'abonos',
  'juicios_ganados',
  'otros_ingresos',
  // Categorías de egresos
  'salarios',
  'alquiler',
  'servicios',
  'impuestos',
  'gastos_judiciales',
  'papeleria',
  'software',
  'otros_gastos'
];

const categoriasPersonalizadasIniciales: CategoriaPersonalizada[] = [
  {
    id: '1',
    nombre: 'Asesoría corporativa',
    tipo: 'ingreso',
    descripcion: 'Ingresos por asesoría a empresas',
    activa: true
  },
  {
    id: '2',
    nombre: 'Viáticos',
    tipo: 'egreso',
    descripcion: 'Gastos de transporte y viajes para casos',
    activa: true
  },
  {
    id: '3',
    nombre: 'Mediación',
    tipo: 'ingreso',
    descripcion: 'Honorarios por sesiones de mediación',
    activa: true
  }
];

const limitesAprobacionIniciales: LimiteAprobacion[] = [
  {
    id: '1',
    rolUsuario: 'asistente',
    montoMaximo: 5000,
    requiereAprobacionAdicional: true,
    descripcion: 'Límite para asistentes'
  },
  {
    id: '2',
    rolUsuario: 'abogado',
    montoMaximo: 20000,
    requiereAprobacionAdicional: false,
    descripcion: 'Límite para abogados'
  },
  {
    id: '3',
    rolUsuario: 'admin',
    montoMaximo: 100000,
    requiereAprobacionAdicional: false,
    descripcion: 'Límite para administradores'
  }
];

const permisosFinanzasIniciales: PermisoFinanzas[] = [
  {
    id: '1',
    rolUsuario: 'asistente',
    verMovimientos: true,
    crearMovimientos: true,
    editarMovimientos: false,
    eliminarMovimientos: false,
    verDashboard: true,
    exportarReportes: false,
    configuraCategoriasYLimites: false,
    gestionarPermisos: false
  },
  {
    id: '2',
    rolUsuario: 'abogado',
    verMovimientos: true,
    crearMovimientos: true,
    editarMovimientos: true,
    eliminarMovimientos: false,
    verDashboard: true,
    exportarReportes: true,
    configuraCategoriasYLimites: false,
    gestionarPermisos: false
  },
  {
    id: '3',
    rolUsuario: 'admin',
    verMovimientos: true,
    crearMovimientos: true,
    editarMovimientos: true,
    eliminarMovimientos: true,
    verDashboard: true,
    exportarReportes: true,
    configuraCategoriasYLimites: true,
    gestionarPermisos: true
  }
];

// Creación del store
export const useConfigFinanzasStore = create<ConfigFinanzasState>((set, get) => ({
  categoriasPersonalizadas: categoriasPersonalizadasIniciales,
  categoriasPredeterminadas: categoriasPredeterminadasArray,
  limitesAprobacion: limitesAprobacionIniciales,
  permisosFinanzas: permisosFinanzasIniciales,
  loading: false,
  error: null,

  // Acciones para categorías
  fetchCategorias: async () => {
    set({ loading: true, error: null });
    try {
      // Simulación de llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));

      // En producción, aquí haríamos fetch a una API real
      set({
        categoriasPersonalizadas: categoriasPersonalizadasIniciales,
        loading: false
      });
    } catch (error: any) {
      const message = error.message || 'Error al cargar las categorías';
      set({ error: message, loading: false });
      useUIStore.getState().addNotification({
        type: 'error',
        message
      });
    }
  },

  addCategoria: async (categoria) => {
    set({ loading: true, error: null });
    try {
      // Simulación de llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));

      const newId = Date.now().toString();
      const nuevaCategoria = { ...categoria, id: newId };

      set(state => ({
        categoriasPersonalizadas: [...state.categoriasPersonalizadas, nuevaCategoria],
        loading: false
      }));

      useUIStore.getState().addNotification({
        type: 'success',
        message: 'Categoría creada correctamente'
      });
    } catch (error: any) {
      const message = error.message || 'Error al crear la categoría';
      set({ error: message, loading: false });
      useUIStore.getState().addNotification({
        type: 'error',
        message
      });
    }
  },

  updateCategoria: async (id, datos) => {
    set({ loading: true, error: null });
    try {
      // Simulación de llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));

      set(state => ({
        categoriasPersonalizadas: state.categoriasPersonalizadas.map(cat =>
          cat.id === id ? { ...cat, ...datos } : cat
        ),
        loading: false
      }));

      useUIStore.getState().addNotification({
        type: 'success',
        message: 'Categoría actualizada correctamente'
      });
    } catch (error: any) {
      const message = error.message || 'Error al actualizar la categoría';
      set({ error: message, loading: false });
      useUIStore.getState().addNotification({
        type: 'error',
        message
      });
    }
  },

  deleteCategoria: async (id) => {
    set({ loading: true, error: null });
    try {
      // Simulación de llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));

      set(state => ({
        categoriasPersonalizadas: state.categoriasPersonalizadas.filter(cat => cat.id !== id),
        loading: false
      }));

      useUIStore.getState().addNotification({
        type: 'success',
        message: 'Categoría eliminada correctamente'
      });
    } catch (error: any) {
      const message = error.message || 'Error al eliminar la categoría';
      set({ error: message, loading: false });
      useUIStore.getState().addNotification({
        type: 'error',
        message
      });
    }
  },

  // Acciones para límites de aprobación
  fetchLimitesAprobacion: async () => {
    set({ loading: true, error: null });
    try {
      // Simulación de llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));

      // En producción, aquí haríamos fetch a una API real
      set({
        limitesAprobacion: limitesAprobacionIniciales,
        loading: false
      });
    } catch (error: any) {
      const message = error.message || 'Error al cargar los límites de aprobación';
      set({ error: message, loading: false });
      useUIStore.getState().addNotification({
        type: 'error',
        message
      });
    }
  },

  addLimiteAprobacion: async (limite) => {
    set({ loading: true, error: null });
    try {
      // Simulación de llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));

      const newId = Date.now().toString();
      const nuevoLimite = { ...limite, id: newId };

      set(state => ({
        limitesAprobacion: [...state.limitesAprobacion, nuevoLimite],
        loading: false
      }));

      useUIStore.getState().addNotification({
        type: 'success',
        message: 'Límite de aprobación creado correctamente'
      });
    } catch (error: any) {
      const message = error.message || 'Error al crear el límite de aprobación';
      set({ error: message, loading: false });
      useUIStore.getState().addNotification({
        type: 'error',
        message
      });
    }
  },

  updateLimiteAprobacion: async (id, datos) => {
    set({ loading: true, error: null });
    try {
      // Simulación de llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));

      set(state => ({
        limitesAprobacion: state.limitesAprobacion.map(lim =>
          lim.id === id ? { ...lim, ...datos } : lim
        ),
        loading: false
      }));

      useUIStore.getState().addNotification({
        type: 'success',
        message: 'Límite de aprobación actualizado correctamente'
      });
    } catch (error: any) {
      const message = error.message || 'Error al actualizar el límite de aprobación';
      set({ error: message, loading: false });
      useUIStore.getState().addNotification({
        type: 'error',
        message
      });
    }
  },

  deleteLimiteAprobacion: async (id) => {
    set({ loading: true, error: null });
    try {
      // Simulación de llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));

      set(state => ({
        limitesAprobacion: state.limitesAprobacion.filter(lim => lim.id !== id),
        loading: false
      }));

      useUIStore.getState().addNotification({
        type: 'success',
        message: 'Límite de aprobación eliminado correctamente'
      });
    } catch (error: any) {
      const message = error.message || 'Error al eliminar el límite de aprobación';
      set({ error: message, loading: false });
      useUIStore.getState().addNotification({
        type: 'error',
        message
      });
    }
  },

  // Acciones para permisos
  fetchPermisosFinanzas: async () => {
    set({ loading: true, error: null });
    try {
      // Simulación de llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));

      // En producción, aquí haríamos fetch a una API real
      set({
        permisosFinanzas: permisosFinanzasIniciales,
        loading: false
      });
    } catch (error: any) {
      const message = error.message || 'Error al cargar los permisos';
      set({ error: message, loading: false });
      useUIStore.getState().addNotification({
        type: 'error',
        message
      });
    }
  },

  addPermisoFinanzas: async (permiso) => {
    set({ loading: true, error: null });
    try {
      // Simulación de llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));

      const newId = Date.now().toString();
      const nuevoPermiso = { ...permiso, id: newId };

      set(state => ({
        permisosFinanzas: [...state.permisosFinanzas, nuevoPermiso],
        loading: false
      }));

      useUIStore.getState().addNotification({
        type: 'success',
        message: 'Permiso creado correctamente'
      });
    } catch (error: any) {
      const message = error.message || 'Error al crear el permiso';
      set({ error: message, loading: false });
      useUIStore.getState().addNotification({
        type: 'error',
        message
      });
    }
  },

  updatePermisoFinanzas: async (id, datos) => {
    set({ loading: true, error: null });
    try {
      // Simulación de llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));

      set(state => ({
        permisosFinanzas: state.permisosFinanzas.map(perm =>
          perm.id === id ? { ...perm, ...datos } : perm
        ),
        loading: false
      }));

      useUIStore.getState().addNotification({
        type: 'success',
        message: 'Permiso actualizado correctamente'
      });
    } catch (error: any) {
      const message = error.message || 'Error al actualizar el permiso';
      set({ error: message, loading: false });
      useUIStore.getState().addNotification({
        type: 'error',
        message
      });
    }
  },

  deletePermisoFinanzas: async (id) => {
    set({ loading: true, error: null });
    try {
      // Simulación de llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));

      set(state => ({
        permisosFinanzas: state.permisosFinanzas.filter(perm => perm.id !== id),
        loading: false
      }));

      useUIStore.getState().addNotification({
        type: 'success',
        message: 'Permiso eliminado correctamente'
      });
    } catch (error: any) {
      const message = error.message || 'Error al eliminar el permiso';
      set({ error: message, loading: false });
      useUIStore.getState().addNotification({
        type: 'error',
        message
      });
    }
  }
}));
