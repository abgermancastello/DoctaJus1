// Tipos de usuarios
export enum UserRole {
  ADMIN = 'admin',
  ABOGADO = 'abogado',
  ASISTENTE = 'asistente',
  CLIENTE = 'cliente'
}

export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  role: UserRole;
  especialidad?: string;
  telefono?: string;
  activo: boolean;
}

// Etiquetas personalizadas
export interface Etiqueta {
  id: string;
  nombre: string;
  color: string;
  descripcion?: string;
  fechaCreacion?: Date | string;
}

// Eventos de agenda
export enum TipoEvento {
  REUNION = 'reunion',
  LLAMADA = 'llamada',
  AUDIENCIA = 'audiencia',
  VENCIMIENTO = 'vencimiento',
  OTRO = 'otro'
}

export interface Evento {
  id: string;
  titulo: string;
  descripcion?: string;
  tipo: TipoEvento;
  fechaInicio: Date | string;
  fechaFin?: Date | string;
  completado: boolean;
  contactoId: string;
  expedienteId?: string;
  fechaCreacion: Date | string;
  fechaActualizacion: Date | string;
}

// Archivos adjuntos
export enum TipoArchivo {
  DOCUMENTO = 'documento',
  IMAGEN = 'imagen',
  CONTRATO = 'contrato',
  IDENTIFICACION = 'identificacion',
  OTRO = 'otro'
}

export interface ArchivoAdjunto {
  id: string;
  nombre: string;
  tipo: TipoArchivo;
  url: string;
  tamanio: number;
  extension: string;
  contactoId: string;
  fechaSubida: Date | string;
}

// Tipos de clientes
export enum TipoCliente {
  PERSONA = 'persona',
  EMPRESA = 'empresa',
  PROVEEDOR = 'proveedor',
  COLABORADOR = 'colaborador',
  ABOGADO_EXTERNO = 'abogado_externo',
  JUZGADO = 'juzgado',
  ENTIDAD_GOBIERNO = 'entidad_gobierno',
  OTRO = 'otro'
}

// Categorías de contactos
export enum CategoriaContacto {
  CLIENTE = 'cliente',
  OPOSITOR = 'opositor',
  TESTIGO = 'testigo',
  PERITO = 'perito',
  CONTRAPARTE = 'contraparte',
  PROVEEDOR = 'proveedor',
  OTRO = 'otro'
}

export interface Cliente {
  id: string;
  nombre: string;
  apellido?: string;
  razonSocial?: string;
  tipo: TipoCliente;
  documento: string;
  email: string;
  telefono: string;
  direccion: string;
  notas?: string;
  categorias?: CategoriaContacto[];
  expedientesRelacionados?: string[];
  etiquetas?: string[];
  eventos?: string[];
  archivos?: string[];
  fechaCreacion: Date | string;
  fechaActualizacion: Date | string;
}

// Tipos de expedientes
export enum EstadoExpediente {
  ABIERTO = 'ABIERTO',
  EN_PROCESO = 'EN_PROCESO',
  CERRADO = 'CERRADO',
  ARCHIVADO = 'ARCHIVADO'
}

export interface Expediente {
  id: string;
  numero: string;
  titulo: string;
  descripcion: string;
  clienteId: string;
  abogadoId: string;
  abogadoNombre?: string;
  estado: EstadoExpediente;
  fechaInicio: Date;
  fechaFin?: Date;
  fechaActualizacion: Date;
  tipo?: string;
  observaciones?: string;
}

// Tipos de tareas
export enum PrioridadTarea {
  ALTA = 'alta',
  MEDIA = 'media',
  BAJA = 'baja'
}

export enum EstadoTarea {
  PENDIENTE = 'pendiente',
  EN_PROGRESO = 'en_progreso',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada'
}

// Etiquetas para tareas
export interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  fechaCreacion: Date | string;
  fechaVencimiento: Date | string;
  fechaCompletada?: Date | string;
  prioridad: PrioridadTarea;
  estado: EstadoTarea;
  expedienteId?: string;
  responsableId: string;
  creadorId: string;
  etiquetas?: Etiqueta[];
  // Usuarios con los que se comparte la tarea
  usuariosCompartidos?: UsuarioCompartido[];
  // Comentarios de la tarea
  comentarios?: ComentarioTarea[];
}

// Modelo para usuarios compartidos en tareas
export interface UsuarioCompartido {
  id: string;  // ID único de la asignación
  usuarioId: string;  // ID del usuario con quien se comparte
  tareaId: string;  // ID de la tarea compartida
  permisos: PermisoCompartido;  // Tipo de permiso
  fechaCompartida: Date | string;  // Fecha cuando se compartió
}

// Tipos de permisos para tareas compartidas
export enum PermisoCompartido {
  LECTURA = 'lectura',  // Solo puede ver la tarea
  ESCRITURA = 'escritura',  // Puede editar la tarea
  COMENTARIOS = 'comentarios'  // Solo puede agregar comentarios
}

// Modelo para comentarios de tareas
export interface ComentarioTarea {
  id: string;  // ID único del comentario
  tareaId: string;  // ID de la tarea a la que pertenece
  usuarioId: string;  // ID del usuario que hizo el comentario
  texto: string;  // Contenido del comentario
  fechaCreacion: Date | string;  // Fecha de creación
  fechaEdicion?: Date | string;  // Fecha de última edición, si se editó
  adjuntos?: ArchivoAdjunto[];  // Archivos adjuntos asociados al comentario
}
