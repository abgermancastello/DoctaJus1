import { Cliente, TipoCliente, CategoriaContacto, Etiqueta, Evento, TipoEvento, ArchivoAdjunto, TipoArchivo } from '../types';

// Datos mock para etiquetas
const mockEtiquetas: Etiqueta[] = [
  {
    id: '1',
    nombre: 'VIP',
    color: '#FF5733',
    descripcion: 'Clientes prioritarios',
    fechaCreacion: new Date().toISOString()
  },
  {
    id: '2',
    nombre: 'Pago Pendiente',
    color: '#C70039',
    descripcion: 'Contactos con pagos pendientes',
    fechaCreacion: new Date().toISOString()
  },
  {
    id: '3',
    nombre: 'Referido',
    color: '#FFC300',
    descripcion: 'Contactos que llegaron por referencia',
    fechaCreacion: new Date().toISOString()
  },
  {
    id: '4',
    nombre: 'Frecuente',
    color: '#4CAF50',
    descripcion: 'Clientes habituales',
    fechaCreacion: new Date().toISOString()
  }
];

// Datos mock para eventos
const mockEventos: Evento[] = [
  {
    id: '1',
    titulo: 'Reunión inicial',
    descripcion: 'Primera reunión para evaluar el caso',
    tipo: TipoEvento.REUNION,
    fechaInicio: new Date(Date.now() + 86400000).toISOString(), // Mañana
    completado: false,
    contactoId: '1',
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString()
  },
  {
    id: '2',
    titulo: 'Llamada seguimiento',
    descripcion: 'Llamar para verificar avances',
    tipo: TipoEvento.LLAMADA,
    fechaInicio: new Date(Date.now() + 172800000).toISOString(), // Pasado mañana
    completado: false,
    contactoId: '2',
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString()
  },
  {
    id: '3',
    titulo: 'Audiencia preliminar',
    descripcion: 'Audiencia en Juzgado Civil N° 5',
    tipo: TipoEvento.AUDIENCIA,
    fechaInicio: new Date(Date.now() + 604800000).toISOString(), // En una semana
    fechaFin: new Date(Date.now() + 608400000).toISOString(), // 1 hora después
    completado: false,
    contactoId: '1',
    expedienteId: '1',
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString()
  }
];

// Datos mock para archivos
const mockArchivos: ArchivoAdjunto[] = [
  {
    id: '1',
    nombre: 'Contrato.pdf',
    tipo: TipoArchivo.CONTRATO,
    url: '/uploads/contratos/contrato_1.pdf',
    tamanio: 1024 * 1024, // 1MB
    extension: 'pdf',
    contactoId: '1',
    fechaSubida: new Date().toISOString()
  },
  {
    id: '2',
    nombre: 'DNI.jpg',
    tipo: TipoArchivo.IDENTIFICACION,
    url: '/uploads/identificaciones/dni_2.jpg',
    tamanio: 512 * 1024, // 512KB
    extension: 'jpg',
    contactoId: '1',
    fechaSubida: new Date().toISOString()
  },
  {
    id: '3',
    nombre: 'Escritura.pdf',
    tipo: TipoArchivo.DOCUMENTO,
    url: '/uploads/documentos/escritura_3.pdf',
    tamanio: 2 * 1024 * 1024, // 2MB
    extension: 'pdf',
    contactoId: '2',
    fechaSubida: new Date().toISOString()
  }
];

// Datos mock para clientes
const mockClientes: Cliente[] = [
  {
    id: '1',
    nombre: 'Juan',
    apellido: 'Pérez',
    tipo: TipoCliente.PERSONA,
    documento: '12345678',
    email: 'juan.perez@example.com',
    telefono: '123-456-7890',
    direccion: 'Av. Siempreviva 123, Springfield',
    categorias: [CategoriaContacto.CLIENTE],
    etiquetas: ['1', '4'], // Referencia a las etiquetas VIP y Frecuente
    eventos: ['1', '3'], // Referencia a eventos
    archivos: ['1', '2'], // Referencia a archivos
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString()
  },
  {
    id: '2',
    nombre: 'María',
    apellido: 'González',
    tipo: TipoCliente.PERSONA,
    documento: '87654321',
    email: 'maria.gonzalez@example.com',
    telefono: '987-654-3210',
    direccion: 'Calle Principal 456, Ciudad',
    categorias: [CategoriaContacto.CLIENTE, CategoriaContacto.TESTIGO],
    etiquetas: ['3'], // Referencia a la etiqueta Referido
    eventos: ['2'], // Referencia a eventos
    archivos: ['3'], // Referencia a archivos
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString()
  },
  {
    id: '3',
    nombre: 'Contacto',
    razonSocial: 'Empresa ABC',
    tipo: TipoCliente.EMPRESA,
    documento: '30-12345678-9',
    email: 'contacto@empresaabc.com',
    telefono: '555-123-4567',
    direccion: 'Av. Industrial 789, Parque Empresarial',
    categorias: [CategoriaContacto.PROVEEDOR],
    etiquetas: ['2'], // Referencia a la etiqueta Pago Pendiente
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString()
  },
  {
    id: '4',
    nombre: 'Secretaría',
    razonSocial: 'Juzgado Civil N° 5',
    tipo: TipoCliente.JUZGADO,
    documento: '33-98765432-0',
    email: 'secretaria@juzgadocivil5.gov.ar',
    telefono: '555-987-6543',
    direccion: 'Palacio de Justicia, Piso 3, Oficina 302',
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString()
  }
];

// API mock para etiquetas
export const mockEtiquetaService = {
  getEtiquetas: async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ etiquetas: mockEtiquetas });
      }, 300);
    });
  },

  getEtiquetaById: async (id: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const etiqueta = mockEtiquetas.find(e => e.id === id);
        if (etiqueta) {
          resolve({ etiqueta });
        } else {
          reject(new Error('Etiqueta no encontrada'));
        }
      }, 200);
    });
  },

  createEtiqueta: async (etiquetaData: Omit<Etiqueta, 'id' | 'fechaCreacion'>) => {
    return new Promise(resolve => {
      setTimeout(() => {
        const newEtiqueta = {
          ...etiquetaData,
          id: Math.random().toString(36).substr(2, 9),
          fechaCreacion: new Date().toISOString()
        };
        mockEtiquetas.push(newEtiqueta as Etiqueta);
        resolve({ etiqueta: newEtiqueta });
      }, 300);
    });
  },

  updateEtiqueta: async (id: string, etiquetaData: Partial<Etiqueta>) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockEtiquetas.findIndex(e => e.id === id);
        if (index !== -1) {
          const updatedEtiqueta = {
            ...mockEtiquetas[index],
            ...etiquetaData
          };
          mockEtiquetas[index] = updatedEtiqueta;
          resolve({ etiqueta: updatedEtiqueta });
        } else {
          reject(new Error('Etiqueta no encontrada'));
        }
      }, 300);
    });
  },

  deleteEtiqueta: async (id: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockEtiquetas.findIndex(e => e.id === id);
        if (index !== -1) {
          const deletedEtiqueta = mockEtiquetas.splice(index, 1)[0];
          resolve({ success: true, etiqueta: deletedEtiqueta });
        } else {
          reject(new Error('Etiqueta no encontrada'));
        }
      }, 300);
    });
  }
};

// API mock para eventos
export const mockEventoService = {
  getEventos: async (params?: { contactoId?: string }) => {
    return new Promise(resolve => {
      setTimeout(() => {
        let eventos = [...mockEventos];

        if (params?.contactoId) {
          eventos = eventos.filter(e => e.contactoId === params.contactoId);
        }

        resolve({ eventos });
      }, 300);
    });
  },

  getEventoById: async (id: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const evento = mockEventos.find(e => e.id === id);
        if (evento) {
          resolve({ evento });
        } else {
          reject(new Error('Evento no encontrado'));
        }
      }, 200);
    });
  },

  createEvento: async (eventoData: Omit<Evento, 'id' | 'fechaCreacion' | 'fechaActualizacion'>) => {
    return new Promise(resolve => {
      setTimeout(() => {
        const newEvento = {
          ...eventoData,
          id: Math.random().toString(36).substr(2, 9),
          fechaCreacion: new Date().toISOString(),
          fechaActualizacion: new Date().toISOString()
        };
        mockEventos.push(newEvento as Evento);
        resolve({ evento: newEvento });
      }, 300);
    });
  },

  updateEvento: async (id: string, eventoData: Partial<Evento>) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockEventos.findIndex(e => e.id === id);
        if (index !== -1) {
          const updatedEvento = {
            ...mockEventos[index],
            ...eventoData,
            fechaActualizacion: new Date().toISOString()
          };
          mockEventos[index] = updatedEvento;
          resolve({ evento: updatedEvento });
        } else {
          reject(new Error('Evento no encontrado'));
        }
      }, 300);
    });
  },

  deleteEvento: async (id: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockEventos.findIndex(e => e.id === id);
        if (index !== -1) {
          const deletedEvento = mockEventos.splice(index, 1)[0];
          resolve({ success: true, evento: deletedEvento });
        } else {
          reject(new Error('Evento no encontrado'));
        }
      }, 300);
    });
  }
};

// API mock para archivos
export const mockArchivoService = {
  getArchivos: async (params?: { contactoId?: string }) => {
    return new Promise(resolve => {
      setTimeout(() => {
        let archivos = [...mockArchivos];

        if (params?.contactoId) {
          archivos = archivos.filter(a => a.contactoId === params.contactoId);
        }

        resolve({ archivos });
      }, 300);
    });
  },

  getArchivoById: async (id: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const archivo = mockArchivos.find(a => a.id === id);
        if (archivo) {
          resolve({ archivo });
        } else {
          reject(new Error('Archivo no encontrado'));
        }
      }, 200);
    });
  },

  createArchivo: async (archivoData: Omit<ArchivoAdjunto, 'id' | 'fechaSubida'>) => {
    return new Promise(resolve => {
      setTimeout(() => {
        const newArchivo = {
          ...archivoData,
          id: Math.random().toString(36).substr(2, 9),
          fechaSubida: new Date().toISOString()
        };
        mockArchivos.push(newArchivo as ArchivoAdjunto);
        resolve({ archivo: newArchivo });
      }, 300);
    });
  },

  deleteArchivo: async (id: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockArchivos.findIndex(a => a.id === id);
        if (index !== -1) {
          const deletedArchivo = mockArchivos.splice(index, 1)[0];
          resolve({ success: true, archivo: deletedArchivo });
        } else {
          reject(new Error('Archivo no encontrado'));
        }
      }, 300);
    });
  }
};

// API mock para clientes
export const mockClienteService = {
  getClientes: async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ clientes: mockClientes });
      }, 500); // Simular retraso de red
    });
  },

  getClienteById: async (id: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const cliente = mockClientes.find(c => c.id === id);
        if (cliente) {
          resolve({ cliente });
        } else {
          reject(new Error('Cliente no encontrado'));
        }
      }, 300);
    });
  },

  createCliente: async (clienteData: Omit<Cliente, 'id' | 'fechaCreacion' | 'fechaActualizacion'>) => {
    return new Promise(resolve => {
      setTimeout(() => {
        const newCliente = {
          ...clienteData,
          id: Math.random().toString(36).substr(2, 9),
          fechaCreacion: new Date().toISOString(),
          fechaActualizacion: new Date().toISOString()
        };
        mockClientes.push(newCliente as Cliente);
        resolve({ cliente: newCliente });
      }, 300);
    });
  },

  updateCliente: async (id: string, clienteData: Partial<Cliente>) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockClientes.findIndex(c => c.id === id);
        if (index !== -1) {
          const updatedCliente = {
            ...mockClientes[index],
            ...clienteData,
            fechaActualizacion: new Date().toISOString()
          };
          mockClientes[index] = updatedCliente;
          resolve({ cliente: updatedCliente });
        } else {
          reject(new Error('Cliente no encontrado'));
        }
      }, 300);
    });
  },

  deleteCliente: async (id: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockClientes.findIndex(c => c.id === id);
        if (index !== -1) {
          const deletedCliente = mockClientes.splice(index, 1)[0];
          resolve({ success: true, cliente: deletedCliente });
        } else {
          reject(new Error('Cliente no encontrado'));
        }
      }, 300);
    });
  }
};

// Mock de expedientes relacionados con clientes
export const mockExpedienteService = {
  getExpedientes: async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          expedientes: [
            {
              id: '1',
              numero: `EXP-001-${new Date().getFullYear()}`,
              titulo: 'Expediente de ejemplo 1',
              descripcion: 'Este es un expediente de ejemplo para pruebas',
              estado: 'abierto',
              fechaInicio: new Date(Date.now() - 5000000000).toISOString(),
              fechaActualizacion: new Date().toISOString(),
              clienteId: '1',
              abogadoId: '1'
            },
            {
              id: '2',
              numero: `EXP-002-${new Date().getFullYear()}`,
              titulo: 'Expediente de ejemplo 2',
              descripcion: 'Otro expediente de ejemplo para pruebas',
              estado: 'en_proceso',
              fechaInicio: new Date(Date.now() - 3000000000).toISOString(),
              fechaActualizacion: new Date().toISOString(),
              clienteId: '2',
              abogadoId: '1'
            }
          ]
        });
      }, 300);
    });
  },

  getExpedienteById: async (id: string) => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          expediente: {
            id,
            numero: `EXP-${Math.floor(Math.random() * 1000)}-${new Date().getFullYear()}`,
            titulo: 'Expediente de ejemplo',
            descripcion: 'Este es un expediente de ejemplo para pruebas',
            estado: ['abierto', 'en_proceso', 'cerrado', 'archivado'][Math.floor(Math.random() * 4)],
            fechaInicio: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
            fechaActualizacion: new Date().toISOString(),
            clienteId: '1',
            abogadoId: '1'
          }
        });
      }, 300);
    });
  },

  createExpediente: async (expedienteData: any) => {
    return new Promise(resolve => {
      setTimeout(() => {
        const newExpediente = {
          ...expedienteData,
          id: Math.random().toString(36).substr(2, 9),
          numero: `EXP-${Math.floor(Math.random() * 1000)}-${new Date().getFullYear()}`,
          fechaInicio: new Date().toISOString(),
          fechaActualizacion: new Date().toISOString()
        };
        resolve({ expediente: newExpediente });
      }, 300);
    });
  },

  updateExpediente: async (id: string, expedienteData: any) => {
    return new Promise(resolve => {
      setTimeout(() => {
        const updatedExpediente = {
          id,
          ...expedienteData,
          fechaActualizacion: new Date().toISOString()
        };
        resolve({ expediente: updatedExpediente });
      }, 300);
    });
  },

  deleteExpediente: async (id: string) => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          message: `Expediente ${id} eliminado correctamente`
        });
      }, 300);
    });
  }
};

// Exportar todos los servicios mock
export const mockServices = {
  clienteService: mockClienteService,
  expedienteService: mockExpedienteService,
  etiquetaService: mockEtiquetaService,
  eventoService: mockEventoService,
  archivoService: mockArchivoService
};
