import { User, Expediente, Tarea, TipoArchivo, Etiqueta } from '../types';
import {
  mockEtiquetaService,
  mockEventoService,
  mockArchivoService,
  mockClienteService,
  mockExpedienteService
} from './mockApi';

// Datos mock para pruebas
const mockData = {
  users: [
    {
      id: '1',
      name: 'Juan Pérez',
      email: 'juan@example.com',
      role: 'admin',
    },
    {
      id: '2',
      name: 'María García',
      email: 'maria@example.com',
      role: 'abogado',
    },
  ],
  expedientes: [
    {
      id: '1',
      numero: 'EXP-2024-001',
      titulo: 'Caso Civil',
      descripcion: 'Demanda por daños y perjuicios',
      estado: 'ABIERTO',
      fechaCreacion: '2024-01-01',
      cliente: {
        id: '1',
        nombre: 'Cliente A',
      },
      responsable: {
        id: '1',
        nombre: 'Juan Pérez',
      },
    },
  ],
  tareas: [
    {
      id: '1',
      titulo: 'Revisar documentación',
      descripcion: 'Revisar la documentación del caso',
      estado: 'PENDIENTE',
      fechaVencimiento: '2024-02-01',
      expediente: {
        id: '1',
        numero: 'EXP-2024-001',
      },
      asignado: {
        id: '1',
        nombre: 'Juan Pérez',
      },
    },
  ],
};

// Servicios mock
export const mockServices = {
  userService: {
    getUsers: async () => mockData.users,
    getUserById: async (id: string) => mockData.users.find(u => u.id === id),
  },
  expedienteService: mockExpedienteService,
  tareaService: {
    getTareas: async (params?: any) => mockData.tareas,
    getTareaById: async (id: string) => mockData.tareas.find(t => t.id === id),
    createTarea: async (data: Partial<Tarea>) => ({
      id: String(mockData.tareas.length + 1),
      ...data,
    }),
    updateTarea: async (id: string, data: Partial<Tarea>) => ({
      id,
      ...data,
    }),
    deleteTarea: async (id: string) => true,
  },
  etiquetaService: mockEtiquetaService,
  eventoService: mockEventoService,
  archivoService: mockArchivoService,
  clienteService: mockClienteService,
};
