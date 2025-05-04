import mongoose from 'mongoose';

export enum TipoDocumento {
  CONTRATO = 'contrato',
  DEMANDA = 'demanda',
  CONTESTACION = 'contestacion',
  APELACION = 'apelacion',
  RECURSO = 'recurso',
  PODER = 'poder',
  SENTENCIA = 'sentencia',
  RESOLUCION = 'resolucion',
  PERICIA = 'pericia',
  FACTURA = 'factura',
  OTRO = 'otro'
}

export enum EstadoDocumento {
  BORRADOR = 'borrador',
  FINALIZADO = 'finalizado',
  ARCHIVADO = 'archivado',
  PENDIENTE_REVISION = 'pendiente_revision',
  APROBADO = 'aprobado'
}

export interface IDocumento {
  id?: string;
  nombre: string;
  descripcion?: string;
  tipo: TipoDocumento;
  estado: EstadoDocumento;
  expedienteId?: mongoose.Types.ObjectId | string;
  clienteId?: mongoose.Types.ObjectId | string;
  archivoUrl: string;
  archivoNombre: string;
  archivoTamanio: number;
  archivoFormato: string;
  etiquetas?: string[];
  destacado: boolean;
  esPublico: boolean;
  versionActual: number;
  indexadoParaBusqueda: boolean;
  contenidoIndexado?: string;
  creadoPorId: mongoose.Types.ObjectId | string;
  modificadoPorId?: mongoose.Types.ObjectId | string;
  fechaCreacion: Date;
  fechaModificacion: Date;
}

export interface IDocumentoDocument extends mongoose.Document, Omit<IDocumento, 'id' | 'expedienteId' | 'clienteId' | 'creadoPorId' | 'modificadoPorId'> {
  expedienteId?: mongoose.Types.ObjectId;
  clienteId?: mongoose.Types.ObjectId;
  creadoPorId: mongoose.Types.ObjectId;
  modificadoPorId?: mongoose.Types.ObjectId;
}

const DocumentoSchema = new mongoose.Schema<IDocumentoDocument>(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del documento es obligatorio'],
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
    },
    tipo: {
      type: String,
      enum: Object.values(TipoDocumento),
      default: TipoDocumento.OTRO,
      required: true,
    },
    estado: {
      type: String,
      enum: Object.values(EstadoDocumento),
      default: EstadoDocumento.BORRADOR,
      required: true,
    },
    expedienteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expediente',
    },
    clienteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cliente',
    },
    archivoUrl: {
      type: String,
      required: [true, 'La URL del archivo es obligatoria'],
    },
    archivoNombre: {
      type: String,
      required: [true, 'El nombre del archivo es obligatorio'],
    },
    archivoTamanio: {
      type: Number,
      required: [true, 'El tamaño del archivo es obligatorio'],
    },
    archivoFormato: {
      type: String,
      required: [true, 'El formato del archivo es obligatorio'],
    },
    etiquetas: {
      type: [String],
      default: [],
    },
    destacado: {
      type: Boolean,
      default: false,
    },
    esPublico: {
      type: Boolean,
      default: false,
    },
    versionActual: {
      type: Number,
      default: 1,
    },
    indexadoParaBusqueda: {
      type: Boolean,
      default: false,
    },
    contenidoIndexado: {
      type: String,
    },
    creadoPorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario creador es obligatorio'],
    },
    modificadoPorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: {
      createdAt: 'fechaCreacion',
      updatedAt: 'fechaModificacion',
    },
  }
);

// Índices para mejorar búsquedas
DocumentoSchema.index({ nombre: 1 });
DocumentoSchema.index({ expedienteId: 1 });
DocumentoSchema.index({ clienteId: 1 });
DocumentoSchema.index({ creadoPorId: 1 });
DocumentoSchema.index({ tipo: 1 });
DocumentoSchema.index({ estado: 1 });
DocumentoSchema.index({ destacado: 1 });
DocumentoSchema.index({ fechaCreacion: -1 });
DocumentoSchema.index({ fechaModificacion: -1 });
DocumentoSchema.index({ etiquetas: 1 });

// Índice de texto para búsqueda full-text
DocumentoSchema.index(
  {
    nombre: 'text',
    descripcion: 'text',
    contenidoIndexado: 'text',
  },
  {
    weights: {
      nombre: 10,
      descripcion: 5,
      contenidoIndexado: 1,
    },
    name: 'texto_documento',
  }
);

export const Documento = mongoose.model<IDocumentoDocument>('Documento', DocumentoSchema);
