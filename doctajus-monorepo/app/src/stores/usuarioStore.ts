import { create } from 'zustand';

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: 'admin' | 'abogado' | 'secretario';
  estado: 'activo' | 'inactivo';
  telefono?: string;
  especialidad?: string;
}

interface UsuarioState {
  usuarios: Usuario[];
  usuarioSeleccionado: Usuario | null;
  isLoading: boolean;
  error: string | null;

  // Acciones
  fetchUsuarios: () => Promise<void>;
  getUsuario: (id: string) => Promise<Usuario | null>;
  createUsuario: (usuario: Omit<Usuario, 'id'>) => Promise<Usuario | null>;
  updateUsuario: (id: string, usuario: Partial<Usuario>) => Promise<Usuario | null>;
  deleteUsuario: (id: string) => Promise<boolean>;
  setUsuarioSeleccionado: (usuario: Usuario | null) => void;
  clearError: () => void;
}

// Datos de prueba para desarrollo
const usuariosDePrueba: Usuario[] = [
  {
    id: '1',
    nombre: 'Carlos',
    apellido: 'Rodríguez',
    email: 'carlos.rodriguez@doctajus.com',
    rol: 'abogado',
    estado: 'activo',
    telefono: '123-456-7890',
    especialidad: 'Derecho Civil'
  },
  {
    id: '2',
    nombre: 'Ana',
    apellido: 'Martínez',
    email: 'ana.martinez@doctajus.com',
    rol: 'abogado',
    estado: 'activo',
    telefono: '098-765-4321',
    especialidad: 'Derecho Laboral'
  },
  {
    id: '3',
    nombre: 'Laura',
    apellido: 'González',
    email: 'laura.gonzalez@doctajus.com',
    rol: 'secretario',
    estado: 'activo',
    telefono: '555-123-4567'
  }
];

// Forzar modo desarrollo para pruebas
const isDevelopment = true;

export const useUsuarioStore = create<UsuarioState>((set, get) => ({
  usuarios: [],
  usuarioSeleccionado: null,
  isLoading: false,
  error: null,

  // Cargar todos los usuarios
  fetchUsuarios: async () => {
    try {
      set({ isLoading: true, error: null });

      // En modo desarrollo, usar datos de prueba
      if (isDevelopment) {
        setTimeout(() => {
          set({ usuarios: usuariosDePrueba, isLoading: false });
        }, 800);
        return;
      }

      // Aquí iría la llamada al API real
      // const response = await usuarioService.getUsuarios();
      // set({ usuarios: response.data, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al cargar usuarios';
      set({ error: message, isLoading: false });
    }
  },

  // Obtener un usuario por ID
  getUsuario: async (id: string): Promise<Usuario | null> => {
    try {
      set({ isLoading: true, error: null });

      if (isDevelopment) {
        const usuario = usuariosDePrueba.find(u => u.id === id) || null;
        set({ usuarioSeleccionado: usuario, isLoading: false });
        return usuario;
      }

      // Aquí iría la llamada al API real
      // const response = await usuarioService.getUsuarioById(id);
      // set({ usuarioSeleccionado: response.data, isLoading: false });
      // return response.data;
      return null;
    } catch (error: any) {
      const message = error.response?.data?.message || `Error al obtener usuario ${id}`;
      set({ error: message, isLoading: false });
      return null;
    }
  },

  // Crear un nuevo usuario
  createUsuario: async (usuarioData: Omit<Usuario, 'id'>): Promise<Usuario | null> => {
    try {
      set({ isLoading: true, error: null });

      if (isDevelopment) {
        const nuevoUsuario = {
          ...usuarioData,
          id: Date.now().toString()
        } as Usuario;

        setTimeout(() => {
          set(state => ({
            usuarios: [...state.usuarios, nuevoUsuario],
            isLoading: false
          }));
        }, 800);

        return nuevoUsuario;
      }

      // Aquí iría la llamada al API real
      // const response = await usuarioService.createUsuario(usuarioData);
      // set(state => ({
      //   usuarios: [...state.usuarios, response.data],
      //   isLoading: false
      // }));
      // return response.data;
      return null;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al crear usuario';
      set({ error: message, isLoading: false });
      return null;
    }
  },

  // Actualizar un usuario existente
  updateUsuario: async (id: string, usuarioData: Partial<Usuario>): Promise<Usuario | null> => {
    try {
      set({ isLoading: true, error: null });

      if (isDevelopment) {
        const usuarioActualizado = {
          ...usuarioData,
          id
        } as Usuario;

        setTimeout(() => {
          set(state => ({
            usuarios: state.usuarios.map(u =>
              u.id === id ? usuarioActualizado : u
            ),
            isLoading: false
          }));
        }, 800);

        return usuarioActualizado;
      }

      // Aquí iría la llamada al API real
      // const response = await usuarioService.updateUsuario(id, usuarioData);
      // set(state => ({
      //   usuarios: state.usuarios.map(u =>
      //     u.id === id ? response.data : u
      //   ),
      //   isLoading: false
      // }));
      // return response.data;
      return null;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al actualizar usuario';
      set({ error: message, isLoading: false });
      return null;
    }
  },

  // Eliminar un usuario
  deleteUsuario: async (id: string): Promise<boolean> => {
    try {
      set({ isLoading: true, error: null });

      if (isDevelopment) {
        setTimeout(() => {
          set(state => ({
            usuarios: state.usuarios.filter(u => u.id !== id),
            isLoading: false
          }));
        }, 800);
        return true;
      }

      // Aquí iría la llamada al API real
      // await usuarioService.deleteUsuario(id);
      // set(state => ({
      //   usuarios: state.usuarios.filter(u => u.id !== id),
      //   isLoading: false
      // }));
      // return true;
      return false;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al eliminar usuario';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  setUsuarioSeleccionado: (usuario) => {
    set({ usuarioSeleccionado: usuario });
  },

  clearError: () => {
    set({ error: null });
  }
}));
