import axios from 'axios';
import { User, Expediente, Tarea, TipoArchivo, Cliente } from '../types';
import { mockServices } from './mockServices';

// Configuración base de axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4002',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Variable para controlar el uso de datos mock
let useMockData = false;

// Interceptor para añadir el token de autenticación a las solicitudes
api.interceptors.request.use(
  (config) => {
    console.log(`Enviando petición a: ${config.url}`, config);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Error en la petición Axios:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => {
    // Solo loguear en modo desarrollo para mejorar el rendimiento
    if (process.env.NODE_ENV === 'development') {
      console.log(`Respuesta recibida de: ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    // Mensaje detallado del error para depuración
    if (process.env.NODE_ENV === 'development') {
      console.error('Error en respuesta Axios:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        code: error.code
      });
    } else {
      // En producción, log más simple
      console.error(`Error API: ${error.message}`);
    }

    // Si es un error de red/conexión, no redirigir al login
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      console.warn('No se pudo conectar al backend.');
      return Promise.reject(error);
    }

    // Capturar errores 401 (no autorizado) para redirigir al login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Usar replace para redirección más rápida
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }

    // Errores 429 (Too Many Requests)
    if (error.response && error.response.status === 429) {
      console.warn('Demasiadas solicitudes. Por favor, espere un momento antes de intentar nuevamente.');
    }

    const message = error.response?.data?.message || 'Ha ocurrido un error';
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', message);
    }
    return Promise.reject(error);
  }
);

// Función para verificar si se debe usar mock data
const checkApiAvailability = async () => {
  // No necesitamos verificar, siempre queremos datos reales
  // if (useMockData) return;

  try {
    await api.get('/api/health');
    useMockData = false;
  } catch (error) {
    // No activamos datos mock en caso de error
    // console.warn('No se pudo conectar al backend. Usando datos mock de ejemplo.');
    // useMockData = true;
    console.error('No se pudo conectar al backend. Comprueba que el servidor esté en ejecución.');
  }
};

// Intentar comprobar disponibilidad del backend inmediatamente
checkApiAvailability();

// Servicios de autenticación
export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });

      // Verificar que la respuesta contenga los datos esperados
      if (response.data && response.data.success === true && response.data.data) {
        // Formato correcto de la API: { success: true, data: { token, user } }
        return {
          data: {
            token: response.data.data.token,
            user: response.data.data.user
          }
        };
      } else if (response.data && response.data.token && response.data.user) {
        // Formato alternativo: { token, user }
        return {
          data: {
            token: response.data.token,
            user: response.data.user
          }
        };
      } else {
        // Formato inesperado, pero hay datos, retornarlos como están
        console.warn('Formato de respuesta inesperado en login:', response.data);
        return response;
      }
    } catch (error) {
      console.error('Error en authService.login:', error);
      throw error;
    }
  },
  register: async (userData: {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    role?: string;
  }) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },
  getCurrentUser: async () => {
    try {
      const response = await api.get('/api/auth/profile');
      console.log('Respuesta de getCurrentUser:', response.data);

      // Manejar diferentes formatos de respuesta
      if (response.data && response.data.success === true && response.data.data) {
        // Formato: { success: true, data: { user... } }
        return response.data.data;
      } else if (response.data && response.data.user) {
        // Formato: { user: { ... } }
        return response.data.user;
      } else if (response.data && response.data.id) {
        // El usuario ya viene directamente
        return response.data;
      }

      // Si llegamos aquí, el formato no es reconocido
      console.warn('Formato de respuesta inesperado en getCurrentUser:', response.data);
      throw new Error('Formato de respuesta no válido');
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      // Si estamos en desarrollo y hay un error, podemos usar el usuario de prueba
      if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
        console.log('Usando usuario de prueba en desarrollo');
        return {
          id: '1',
          nombre: 'Administrador',
          apellido: 'DoctaJus',
          email: 'admin@doctajus.com',
          role: 'admin',
          especialidad: 'Administración',
          activo: true
        };
      }
      throw error;
    }
  },
  changePassword: async (oldPassword: string, newPassword: string) => {
    const response = await api.post('/api/auth/change-password', { oldPassword, newPassword });
    return response.data;
  },
  logout: async () => {
    // Simplemente limpiamos el token del localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { success: true };
  },
  forgotPassword: async (email: string) => {
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Error en authService.forgotPassword:', error);
      throw error;
    }
  },
  validateResetToken: async (token: string) => {
    try {
      const response = await api.get(`/api/auth/validate-reset-token?token=${token}`);
      return response.data;
    } catch (error) {
      console.error('Error en authService.validateResetToken:', error);
      throw error;
    }
  },
  resetPassword: async (token: string, password: string) => {
    try {
      const response = await api.post('/api/auth/reset-password', { token, password });
      return response.data;
    } catch (error) {
      console.error('Error en authService.resetPassword:', error);
      throw error;
    }
  }
};

// Servicios de usuarios
export const userService = {
  getUsers: async () => {
    const response = await api.get('/api/users');
    return response.data;
  },
  getUserById: async (id: string) => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },
  createUser: async (userData: any) => {
    const response = await api.post('/api/users', userData);
    return response.data;
  },
  updateUser: async (id: string, userData: any) => {
    const response = await api.put(`/api/users/${id}`, userData);
    return response.data;
  },
  deleteUser: async (id: string) => {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  },
};

// Servicios de etiquetas
export const etiquetaService = {
  getEtiquetas: async () => {
    try {
      await checkApiAvailability();

      // Siempre intentar usar datos reales primero
      const response = await api.get('/api/etiquetas');
      return response.data;
    } catch (error) {
      // Solo en caso de error, usar datos mock
      console.error('Error al obtener etiquetas del backend. Usando datos de respaldo:', error);
      return mockServices.etiquetaService.getEtiquetas();
    }
  },

  getEtiquetaById: async (id: string) => {
    try {
      await checkApiAvailability();

      // Siempre intentar usar datos reales primero
      const response = await api.get(`/api/etiquetas/${id}`);
      return response.data;
    } catch (error) {
      // Solo en caso de error, usar datos mock
      console.error(`Error al obtener etiqueta ${id} del backend. Usando datos de respaldo:`, error);
      return mockServices.etiquetaService.getEtiquetaById(id);
    }
  },

  createEtiqueta: async (etiquetaData: any) => {
    try {
      await checkApiAvailability();

      // Siempre intentar usar datos reales primero
      const response = await api.post('/api/etiquetas', etiquetaData);
      return response.data;
    } catch (error) {
      // Solo en caso de error, usar datos mock
      console.error('Error al crear etiqueta en el backend. Usando datos de respaldo:', error);
      return mockServices.etiquetaService.createEtiqueta(etiquetaData);
    }
  },

  updateEtiqueta: async (id: string, etiquetaData: any) => {
    try {
      await checkApiAvailability();

      // Siempre intentar usar datos reales primero
      const response = await api.put(`/api/etiquetas/${id}`, etiquetaData);
      return response.data;
    } catch (error) {
      // Solo en caso de error, usar datos mock
      console.error(`Error al actualizar etiqueta ${id} en el backend. Usando datos de respaldo:`, error);
      return mockServices.etiquetaService.updateEtiqueta(id, etiquetaData);
    }
  },

  deleteEtiqueta: async (id: string) => {
    try {
      await checkApiAvailability();

      // Siempre intentar usar datos reales primero
      const response = await api.delete(`/api/etiquetas/${id}`);
      return response.data;
    } catch (error) {
      // Solo en caso de error, usar datos mock
      console.error(`Error al eliminar etiqueta ${id} del backend. Usando datos de respaldo:`, error);
      return mockServices.etiquetaService.deleteEtiqueta(id);
    }
  }
};

// Servicios de eventos
export const eventoService = {
  getEventos: async (params?: any) => {
    try {
      await checkApiAvailability();

      if (useMockData) {
        return mockServices.eventoService.getEventos(params);
      }

      const response = await api.get('/api/eventos', { params });
      return response.data;
    } catch (error) {
      if (useMockData) {
        return mockServices.eventoService.getEventos(params);
      }
      throw error;
    }
  },

  getEventoById: async (id: string) => {
    try {
      await checkApiAvailability();

      if (useMockData) {
        return mockServices.eventoService.getEventoById(id);
      }

      const response = await api.get(`/api/eventos/${id}`);
      return response.data;
    } catch (error) {
      if (useMockData) {
        return mockServices.eventoService.getEventoById(id);
      }
      throw error;
    }
  },

  createEvento: async (eventoData: any) => {
    try {
      await checkApiAvailability();

      if (useMockData) {
        return mockServices.eventoService.createEvento(eventoData);
      }

      const response = await api.post('/api/eventos', eventoData);
      return response.data;
    } catch (error) {
      if (useMockData) {
        return mockServices.eventoService.createEvento(eventoData);
      }
      throw error;
    }
  },

  updateEvento: async (id: string, eventoData: any) => {
    try {
      await checkApiAvailability();

      if (useMockData) {
        return mockServices.eventoService.updateEvento(id, eventoData);
      }

      const response = await api.put(`/api/eventos/${id}`, eventoData);
      return response.data;
    } catch (error) {
      if (useMockData) {
        return mockServices.eventoService.updateEvento(id, eventoData);
      }
      throw error;
    }
  },

  deleteEvento: async (id: string) => {
    try {
      await checkApiAvailability();

      if (useMockData) {
        return mockServices.eventoService.deleteEvento(id);
      }

      const response = await api.delete(`/api/eventos/${id}`);
      return response.data;
    } catch (error) {
      if (useMockData) {
        return mockServices.eventoService.deleteEvento(id);
      }
      throw error;
    }
  }
};

// Servicios de archivos
export const archivoService = {
  getArchivos: async (params?: any) => {
    try {
      await checkApiAvailability();

      if (useMockData) {
        return mockServices.archivoService.getArchivos(params);
      }

      const response = await api.get('/api/archivos', { params });
      return response.data;
    } catch (error) {
      if (useMockData) {
        return mockServices.archivoService.getArchivos(params);
      }
      throw error;
    }
  },

  getArchivoById: async (id: string) => {
    try {
      await checkApiAvailability();

      if (useMockData) {
        return mockServices.archivoService.getArchivoById(id);
      }

      const response = await api.get(`/api/archivos/${id}`);
      return response.data;
    } catch (error) {
      if (useMockData) {
        return mockServices.archivoService.getArchivoById(id);
      }
      throw error;
    }
  },

  createArchivo: async (formData: FormData) => {
    try {
      await checkApiAvailability();

      if (useMockData) {
        // Extraer los datos para el mock
        const archivoData = {
          nombre: formData.get('nombre') as string,
          tipo: (formData.get('tipo') as string) as TipoArchivo, // Conversión al tipo adecuado
          contactoId: formData.get('contactoId') as string,
          extension: formData.get('extension') as string,
          url: `/uploads/mock/${Date.now()}_${formData.get('nombre')}`,
          tamanio: 1024 * 1024 // Mock size de 1MB
        };
        return mockServices.archivoService.createArchivo(archivoData);
      }

      // Para archivos, usamos FormData sin el header Content-Type (axios lo establece automáticamente)
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      const response = await api.post('/api/archivos', formData, config);
      return response.data;
    } catch (error) {
      if (useMockData) {
        // Extraer los datos para el mock
        const archivoData = {
          nombre: formData.get('nombre') as string,
          tipo: (formData.get('tipo') as string) as TipoArchivo, // Conversión al tipo adecuado
          contactoId: formData.get('contactoId') as string,
          extension: formData.get('extension') as string,
          url: `/uploads/mock/${Date.now()}_${formData.get('nombre')}`,
          tamanio: 1024 * 1024 // Mock size de 1MB
        };
        return mockServices.archivoService.createArchivo(archivoData);
      }
      throw error;
    }
  },

  deleteArchivo: async (id: string) => {
    try {
      await checkApiAvailability();

      if (useMockData) {
        return mockServices.archivoService.deleteArchivo(id);
      }

      const response = await api.delete(`/api/archivos/${id}`);
      return response.data;
    } catch (error) {
      if (useMockData) {
        return mockServices.archivoService.deleteArchivo(id);
      }
      throw error;
    }
  }
};

// Servicios de clientes
export const clienteService = {
  getClientes: async (params?: any) => {
    try {
      await checkApiAvailability();

      // Siempre intentar usar datos reales primero
      const response = await api.get('/api/clientes', { params });
      // Extraer correctamente los datos del formato de respuesta del backend
      return {
        clientes: response.data.data || []
      };
    } catch (error) {
      console.error('Error fetching contactos:', error);
      // Solo devolver error, no datos mock
      throw error;
    }
  },
  getClienteById: async (id: string) => {
    try {
      // Comprobar si se debe usar mock data
      await checkApiAvailability();

      if (useMockData) {
        return mockServices.clienteService.getClienteById(id);
      }

      const response = await api.get(`/api/clientes/${id}`);
      return {
        cliente: response.data.data || null
      };
    } catch (error) {
      if (useMockData) {
        return mockServices.clienteService.getClienteById(id);
      }
      throw error;
    }
  },
  createCliente: async (clienteData: any): Promise<{ cliente: any }> => {
    try {
      // Comprobar si se debe usar mock data
      await checkApiAvailability();

      if (useMockData) {
        // Forzar el tipo any para resolver el problema de tipado
        return await mockServices.clienteService.createCliente(clienteData) as any;
      }

      const response = await api.post('/api/clientes', clienteData);
      return {
        cliente: response.data.data || null
      };
    } catch (error) {
      if (useMockData) {
        // Forzar el tipo any para resolver el problema de tipado
        return await mockServices.clienteService.createCliente(clienteData) as any;
      }
      throw error;
    }
  },
  updateCliente: async (id: string, clienteData: any): Promise<{ cliente: any }> => {
    try {
      // Comprobar si se debe usar mock data
      await checkApiAvailability();

      if (useMockData) {
        // Forzar el tipo any para resolver el problema de tipado
        return await mockServices.clienteService.updateCliente(id, clienteData) as any;
      }

      const response = await api.put(`/api/clientes/${id}`, clienteData);
      return {
        cliente: response.data.data || null
      };
    } catch (error) {
      if (useMockData) {
        // Forzar el tipo any para resolver el problema de tipado
        return await mockServices.clienteService.updateCliente(id, clienteData) as any;
      }
      throw error;
    }
  },
  deleteCliente: async (id: string) => {
    try {
      // Comprobar si se debe usar mock data
      await checkApiAvailability();

      if (useMockData) {
        return mockServices.clienteService.deleteCliente(id);
      }

      const response = await api.delete(`/api/clientes/${id}`);
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      if (useMockData) {
        return mockServices.clienteService.deleteCliente(id);
      }
      throw error;
    }
  },
};

// Servicios de expedientes
export const expedienteService = {
  getExpedientes: async () => {
    try {
      await checkApiAvailability();

      if (useMockData) {
        return mockServices.expedienteService.getExpedientes();
      }

      const response = await api.get('/api/expedientes');
      return response.data;
    } catch (error) {
      if (useMockData) {
        return mockServices.expedienteService.getExpedientes();
      }
      throw error;
    }
  },

  getExpedienteById: async (id: string) => {
    try {
      await checkApiAvailability();

      if (useMockData) {
        return mockServices.expedienteService.getExpedienteById(id);
      }

      const response = await api.get(`/api/expedientes/${id}`);
      return response.data;
    } catch (error) {
      if (useMockData) {
        return mockServices.expedienteService.getExpedienteById(id);
      }
      throw error;
    }
  },

  createExpediente: async (expedienteData: any) => {
    try {
      await checkApiAvailability();

      if (useMockData) {
        return mockServices.expedienteService.createExpediente(expedienteData);
      }

      const response = await api.post('/api/expedientes', expedienteData);
      return response.data;
    } catch (error) {
      if (useMockData) {
        return mockServices.expedienteService.createExpediente(expedienteData);
      }
      throw error;
    }
  },

  updateExpediente: async (id: string, expedienteData: any) => {
    try {
      await checkApiAvailability();

      if (useMockData) {
        return mockServices.expedienteService.updateExpediente(id, expedienteData);
      }

      const response = await api.put(`/api/expedientes/${id}`, expedienteData);
      return response.data;
    } catch (error) {
      if (useMockData) {
        return mockServices.expedienteService.updateExpediente(id, expedienteData);
      }
      throw error;
    }
  },

  deleteExpediente: async (id: string) => {
    try {
      await checkApiAvailability();

      if (useMockData) {
        return mockServices.expedienteService.deleteExpediente(id);
      }

      const response = await api.delete(`/api/expedientes/${id}`);
      return response.data;
    } catch (error) {
      if (useMockData) {
        return mockServices.expedienteService.deleteExpediente(id);
      }
      throw error;
    }
  }
};

// Servicios de tareas
export const tareaService = {
  getTareas: async (params?: any) => {
    try {
      await checkApiAvailability();

      if (useMockData) {
        return mockServices.tareaService.getTareas(params);
      }

      const response = await api.get('/api/tareas', { params });
      return response.data;
    } catch (error) {
      if (useMockData) {
        return mockServices.tareaService.getTareas(params);
      }
      throw error;
    }
  },
  getTareaById: async (id: string) => {
    const response = await api.get(`/api/tareas/${id}`);
    return response.data;
  },
  createTarea: async (tareaData: any) => {
    const response = await api.post('/api/tareas', tareaData);
    return response.data;
  },
  updateTarea: async (id: string, tareaData: any) => {
    const response = await api.put(`/api/tareas/${id}`, tareaData);
    return response.data;
  },
  deleteTarea: async (id: string) => {
    const response = await api.delete(`/api/tareas/${id}`);
    return response.data;
  },
};

// Servicios de documentos
export const documentoService = {
  getDocumentos: async (filters = {}) => {
    try {
      await checkApiAvailability();

      // Construir parámetros de consulta
      const params = { ...filters };

      const response = await api.get('/api/documentos', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener documentos:', error);
      throw error;
    }
  },

  getDocumentoById: async (id: string) => {
    try {
      await checkApiAvailability();

      const response = await api.get(`/api/documentos/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener documento ${id}:`, error);
      throw error;
    }
  },

  getClientes: async () => {
    try {
      await checkApiAvailability();

      const response = await api.get('/api/documento-data/clientes');
      return response.data;
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      // Si falla, devolver un array vacío
      return [];
    }
  },

  getExpedientes: async () => {
    try {
      await checkApiAvailability();

      const response = await api.get('/api/documento-data/expedientes');
      return response.data;
    } catch (error) {
      console.error('Error al obtener expedientes:', error);
      // Si falla, devolver un array vacío
      return [];
    }
  },

  createDocumento: async (documentoData: any, archivo: File) => {
    try {
      await checkApiAvailability();

      // Crear FormData para enviar el archivo junto con los datos
      const formData = new FormData();
      formData.append('archivo', archivo);

      // Añadir los datos del documento como JSON
      Object.keys(documentoData).forEach(key => {
        if (key === 'etiquetas' && Array.isArray(documentoData[key])) {
          // Para arrays como etiquetas, manejamos cada elemento por separado
          documentoData[key].forEach((etiqueta: string) => {
            formData.append(`${key}[]`, etiqueta);
          });
        } else {
          formData.append(key, documentoData[key]);
        }
      });

      const response = await api.post('/api/documentos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error al crear documento:', error);
      throw error;
    }
  },

  updateDocumento: async (id: string, documentoData: any, archivo?: File) => {
    try {
      await checkApiAvailability();

      // Crear FormData para enviar datos
      const formData = new FormData();

      // Si hay un archivo nuevo, lo añadimos
      if (archivo) {
        formData.append('archivo', archivo);
      }

      // Añadir los datos del documento
      Object.keys(documentoData).forEach(key => {
        if (key === 'etiquetas' && Array.isArray(documentoData[key])) {
          documentoData[key].forEach((etiqueta: string) => {
            formData.append(`${key}[]`, etiqueta);
          });
        } else {
          formData.append(key, documentoData[key]);
        }
      });

      const response = await api.patch(`/api/documentos/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      console.error(`Error al actualizar documento ${id}:`, error);
      throw error;
    }
  },

  deleteDocumento: async (id: string) => {
    try {
      await checkApiAvailability();

      const response = await api.delete(`/api/documentos/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar documento ${id}:`, error);
      throw error;
    }
  },

  downloadDocumento: async (id: string) => {
    try {
      await checkApiAvailability();

      const response = await api.get(`/api/documentos/${id}/download`);

      // La respuesta incluye una URL firmada para descargar el documento
      const downloadInfo = response.data;

      // Iniciamos la descarga usando la URL proporcionada
      window.open(downloadInfo.url, '_blank');

      return downloadInfo;
    } catch (error) {
      console.error(`Error al descargar documento ${id}:`, error);
      throw error;
    }
  },

  getVersiones: async (id: string) => {
    try {
      await checkApiAvailability();

      const response = await api.get(`/api/documentos/${id}/versions`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener versiones del documento ${id}:`, error);
      throw error;
    }
  },

  downloadVersion: async (documentoId: string, versionId: string) => {
    try {
      await checkApiAvailability();

      const response = await api.get(`/api/documentos/${documentoId}/versions/${versionId}`);

      // La respuesta incluye una URL firmada para descargar la versión
      const downloadInfo = response.data;

      // Iniciamos la descarga usando la URL proporcionada
      window.open(downloadInfo.url, '_blank');

      return downloadInfo;
    } catch (error) {
      console.error(`Error al descargar versión ${versionId} del documento ${documentoId}:`, error);
      throw error;
    }
  },

  getPermisos: async (id: string) => {
    try {
      await checkApiAvailability();

      const response = await api.get(`/api/documentos/${id}/permissions`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener permisos del documento ${id}:`, error);
      throw error;
    }
  },

  addPermiso: async (id: string, permisoData: { usuarioId: string, tipoPermiso: string }) => {
    try {
      await checkApiAvailability();

      const response = await api.post(`/api/documentos/${id}/permissions`, permisoData);
      return response.data;
    } catch (error) {
      console.error(`Error al añadir permiso al documento ${id}:`, error);
      throw error;
    }
  },

  removePermiso: async (id: string, usuarioId: string) => {
    try {
      await checkApiAvailability();

      const response = await api.delete(`/api/documentos/${id}/permissions/${usuarioId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar permiso del usuario ${usuarioId} en documento ${id}:`, error);
      throw error;
    }
  },

  getHistorial: async (id: string) => {
    try {
      await checkApiAvailability();

      const response = await api.get(`/api/documentos/${id}/history`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener historial del documento ${id}:`, error);
      throw error;
    }
  },

  cambiarEstado: async (id: string, estado: string) => {
    try {
      await checkApiAvailability();

      const response = await api.patch(`/api/documentos/${id}/estado`, { estado });
      return response.data;
    } catch (error) {
      console.error(`Error al cambiar estado del documento ${id}:`, error);
      throw error;
    }
  },

  toggleDestacado: async (id: string, destacado: boolean) => {
    try {
      await checkApiAvailability();

      const response = await api.patch(`/api/documentos/${id}/destacar`, { destacado });
      return response.data;
    } catch (error) {
      console.error(`Error al ${destacado ? 'destacar' : 'quitar destacado de'} documento ${id}:`, error);
      throw error;
    }
  }
};

// Exportar la instancia de axios y la función de verificación
export { api, checkApiAvailability, useMockData };
