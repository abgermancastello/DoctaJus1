import mongoose from 'mongoose';
import { User, UserRole } from '../models/User';
import { Cliente, TipoCliente } from '../models/Cliente';
import { Expediente, EstadoExpediente } from '../models/Expediente';
import { Tarea, EstadoTarea, PrioridadTarea } from '../models/Tarea';
import { connectDB } from '../config/database';
import logger from '../config/logger';

// Datos de prueba para usuarios
const usuariosPrueba = [
  {
    nombre: 'Admin',
    apellido: 'Sistema',
    email: 'admin@doctajus.com',
    password: 'admin123',
    role: UserRole.ADMIN,
  },
  {
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan.perez@doctajus.com',
    password: 'abogado123',
    role: UserRole.ABOGADO,
  },
  {
    nombre: 'María',
    apellido: 'González',
    email: 'maria.gonzalez@doctajus.com',
    password: 'abogado123',
    role: UserRole.ABOGADO,
  },
  {
    nombre: 'Carlos',
    apellido: 'Rodríguez',
    email: 'carlos.rodriguez@doctajus.com',
    password: 'asistente123',
    role: UserRole.ASISTENTE,
  },
];

// Datos de prueba para clientes
const clientesPrueba = [
  {
    nombre: 'Juan',
    apellido: 'Martínez',
    tipo: TipoCliente.PERSONA,
    documento: '12345678',
    email: 'juan.martinez@email.com',
    telefono: '1234567890',
    direccion: 'Calle Principal 123',
  },
  {
    nombre: 'María',
    apellido: 'López',
    tipo: TipoCliente.PERSONA,
    documento: '87654321',
    email: 'maria.lopez@email.com',
    telefono: '0987654321',
    direccion: 'Avenida Central 456',
  },
  {
    nombre: 'Empresa ABC',
    razonSocial: 'ABC S.A.',
    tipo: TipoCliente.EMPRESA,
    documento: '30-12345678-9',
    email: 'contacto@empresaabc.com',
    telefono: '1234567890',
    direccion: 'Zona Industrial 789',
  },
];

// Función para crear usuarios
const seedUsers = async () => {
  try {
    await User.deleteMany({});
    const users = await User.insertMany(usuariosPrueba);
    logger.info(`${users.length} usuarios creados`);
    return users;
  } catch (error) {
    logger.error('Error al crear usuarios:', error);
    throw error;
  }
};

// Función para crear clientes
const seedClientes = async () => {
  try {
    await Cliente.deleteMany({});
    const clientes = await Cliente.insertMany(clientesPrueba);
    logger.info(`${clientes.length} clientes creados`);
    return clientes;
  } catch (error) {
    logger.error('Error al crear clientes:', error);
    throw error;
  }
};

// Función para crear expedientes
const seedExpedientes = async (clientes: any[], abogados: any[]) => {
  const expedientesPrueba = [
    {
      numero: 'EXP-2024-001',
      titulo: 'Demanda Laboral',
      descripcion: 'Caso de despido injustificado',
      estado: EstadoExpediente.EN_TRAMITE,
      clienteId: clientes[0]._id,
      abogadoId: abogados[1]._id,
    },
    {
      numero: 'EXP-2024-002',
      titulo: 'Contrato Comercial',
      descripcion: 'Revisión de contrato de servicios',
      estado: EstadoExpediente.NUEVO,
      clienteId: clientes[2]._id,
      abogadoId: abogados[2]._id,
    },
    {
      numero: 'EXP-2024-003',
      titulo: 'Divorcio',
      descripcion: 'Proceso de divorcio de mutuo acuerdo',
      estado: EstadoExpediente.EN_ESPERA,
      clienteId: clientes[1]._id,
      abogadoId: abogados[1]._id,
    },
  ];

  try {
    await Expediente.deleteMany({});
    const expedientes = await Expediente.insertMany(expedientesPrueba);
    logger.info(`${expedientes.length} expedientes creados`);
    return expedientes;
  } catch (error) {
    logger.error('Error al crear expedientes:', error);
    throw error;
  }
};

// Función para crear tareas
const seedTareas = async (expedientes: any[], usuarios: any[]) => {
  const tareasPrueba = [
    {
      titulo: 'Preparar demanda inicial',
      descripcion: 'Redactar demanda laboral con todos los detalles',
      fechaVencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
      prioridad: PrioridadTarea.ALTA,
      estado: EstadoTarea.PENDIENTE,
      expedienteId: expedientes[0]._id,
      responsableId: usuarios[1]._id,
      creadorId: usuarios[0]._id,
    },
    {
      titulo: 'Revisar documentación',
      descripcion: 'Verificar toda la documentación del cliente',
      fechaVencimiento: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 días
      prioridad: PrioridadTarea.MEDIA,
      estado: EstadoTarea.EN_PROGRESO,
      expedienteId: expedientes[1]._id,
      responsableId: usuarios[3]._id,
      creadorId: usuarios[2]._id,
    },
    {
      titulo: 'Agendar audiencia',
      descripcion: 'Coordinar fecha de audiencia con el juzgado',
      fechaVencimiento: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 días
      prioridad: PrioridadTarea.BAJA,
      estado: EstadoTarea.PENDIENTE,
      expedienteId: expedientes[2]._id,
      responsableId: usuarios[3]._id,
      creadorId: usuarios[1]._id,
    },
  ];

  try {
    await Tarea.deleteMany({});
    const tareas = await Tarea.insertMany(tareasPrueba);
    logger.info(`${tareas.length} tareas creadas`);
    return tareas;
  } catch (error) {
    logger.error('Error al crear tareas:', error);
    throw error;
  }
};

// Función principal para sembrar todos los datos
const seedAll = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();

    logger.info('Comenzando proceso de siembra de datos...');

    // Sembrar datos en orden
    const users = await seedUsers();
    const clientes = await seedClientes();
    const expedientes = await seedExpedientes(clientes, users);
    await seedTareas(expedientes, users);

    logger.info('Datos sembrados exitosamente');

    // Cerrar conexión
    await mongoose.connection.close();
    logger.info('Conexión cerrada');

    process.exit(0);
  } catch (error) {
    logger.error('Error en proceso de siembra:', error);
    process.exit(1);
  }
};

// Ejecutar la siembra de datos
seedAll();
