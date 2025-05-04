import { create } from 'zustand';

export interface Cliente {
  id: string;
  nombre: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  tipo: 'persona' | 'empresa';
  documento?: string;
  tipoDocumento?: string;
}

interface ClienteState {
  clientes: Cliente[];
  clienteSeleccionado: Cliente | null;
  isLoading: boolean;
  error: string | null;

  // Acciones
  fetchClientes: () => Promise<void>;
  getCliente: (id: string) => Promise<Cliente | null>;
  createCliente: (cliente: Omit<Cliente, 'id'>) => Promise<Cliente | null>;
  updateCliente: (id: string, cliente: Partial<Cliente>) => Promise<Cliente | null>;
  deleteCliente: (id: string) => Promise<boolean>;
  setClienteSeleccionado: (cliente: Cliente | null) => void;
  clearError: () => void;
}

// Datos de prueba para desarrollo
const clientesDePrueba: Cliente[] = [
  {
    id: '1',
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan.perez@email.com',
    telefono: '123-456-7890',
    tipo: 'persona',
    documento: '12345678',
    tipoDocumento: 'DNI'
  },
  {
    id: '2',
    nombre: 'María',
    apellido: 'García',
    email: 'maria.garcia@email.com',
    telefono: '098-765-4321',
    tipo: 'persona',
    documento: '87654321',
    tipoDocumento: 'DNI'
  },
  {
    id: '3',
    nombre: 'Empresa XYZ S.A.',
    email: 'contacto@xyz.com',
    telefono: '555-123-4567',
    tipo: 'empresa',
    documento: '30-12345678-9',
    tipoDocumento: 'CUIT'
  }
];

// Forzar modo desarrollo para pruebas
const isDevelopment = true;

export const useClienteStore = create<ClienteState>((set, get) => ({
  clientes: [],
  clienteSeleccionado: null,
  isLoading: false,
  error: null,

  // Cargar todos los clientes
  fetchClientes: async () => {
    try {
      set({ isLoading: true, error: null });

      // En modo desarrollo, usar datos de prueba
      if (isDevelopment) {
        setTimeout(() => {
          set({ clientes: clientesDePrueba, isLoading: false });
        }, 800);
        return;
      }

      // Aquí iría la llamada al API real
      // const response = await clienteService.getClientes();
      // set({ clientes: response.data, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al cargar clientes';
      set({ error: message, isLoading: false });
    }
  },

  // Obtener un cliente por ID
  getCliente: async (id: string): Promise<Cliente | null> => {
    try {
      set({ isLoading: true, error: null });

      if (isDevelopment) {
        const cliente = clientesDePrueba.find(c => c.id === id) || null;
        set({ clienteSeleccionado: cliente, isLoading: false });
        return cliente;
      }

      // Aquí iría la llamada al API real
      // const response = await clienteService.getClienteById(id);
      // set({ clienteSeleccionado: response.data, isLoading: false });
      // return response.data;
      return null;
    } catch (error: any) {
      const message = error.response?.data?.message || `Error al obtener cliente ${id}`;
      set({ error: message, isLoading: false });
      return null;
    }
  },

  // Crear un nuevo cliente
  createCliente: async (clienteData: Omit<Cliente, 'id'>): Promise<Cliente | null> => {
    try {
      set({ isLoading: true, error: null });

      if (isDevelopment) {
        const nuevoCliente = {
          ...clienteData,
          id: Date.now().toString()
        } as Cliente;

        setTimeout(() => {
          set(state => ({
            clientes: [...state.clientes, nuevoCliente],
            isLoading: false
          }));
        }, 800);

        return nuevoCliente;
      }

      // Aquí iría la llamada al API real
      // const response = await clienteService.createCliente(clienteData);
      // set(state => ({
      //   clientes: [...state.clientes, response.data],
      //   isLoading: false
      // }));
      // return response.data;
      return null;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al crear cliente';
      set({ error: message, isLoading: false });
      return null;
    }
  },

  // Actualizar un cliente existente
  updateCliente: async (id: string, clienteData: Partial<Cliente>): Promise<Cliente | null> => {
    try {
      set({ isLoading: true, error: null });

      if (isDevelopment) {
        const clienteActualizado = {
          ...clienteData,
          id
        } as Cliente;

        setTimeout(() => {
          set(state => ({
            clientes: state.clientes.map(c =>
              c.id === id ? clienteActualizado : c
            ),
            isLoading: false
          }));
        }, 800);

        return clienteActualizado;
      }

      // Aquí iría la llamada al API real
      // const response = await clienteService.updateCliente(id, clienteData);
      // set(state => ({
      //   clientes: state.clientes.map(c =>
      //     c.id === id ? response.data : c
      //   ),
      //   isLoading: false
      // }));
      // return response.data;
      return null;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al actualizar cliente';
      set({ error: message, isLoading: false });
      return null;
    }
  },

  // Eliminar un cliente
  deleteCliente: async (id: string): Promise<boolean> => {
    try {
      set({ isLoading: true, error: null });

      if (isDevelopment) {
        setTimeout(() => {
          set(state => ({
            clientes: state.clientes.filter(c => c.id !== id),
            isLoading: false
          }));
        }, 800);
        return true;
      }

      // Aquí iría la llamada al API real
      // await clienteService.deleteCliente(id);
      // set(state => ({
      //   clientes: state.clientes.filter(c => c.id !== id),
      //   isLoading: false
      // }));
      // return true;
      return false;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al eliminar cliente';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  setClienteSeleccionado: (cliente) => {
    set({ clienteSeleccionado: cliente });
  },

  clearError: () => {
    set({ error: null });
  }
}));
