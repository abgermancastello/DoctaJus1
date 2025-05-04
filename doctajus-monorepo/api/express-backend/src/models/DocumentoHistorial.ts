import mongoose from 'mongoose';

export enum TipoAccion {
  CREACION = 'creacion',
  MODIFICACION = 'modificacion',
  CAMBIO_ESTADO = 'cambio_estado',
  NUEVA_VERSION = 'nueva_version',
  DESCARGA = 'descarga',
  CAMBIO_PERMISOS = 'cambio_permisos',
  ELIMINACION = 'eliminacion',
  RESTAURACION = 'restauracion',
  VISUALIZACION = 'visualizacion'
}

export interface IDocumentoHistorial {
  id?: string;
  documentoId: mongoose.Types.ObjectId | string;
  usuarioId: mongoose.Types.ObjectId | string;
  tipoAccion: TipoAccion;
  detalles?: string;
  metadatos?: Record<string, any>;
  ipCliente?: string;
  userAgent?: string;
  fechaAccion: Date;
}

export interface IDocumentoHistorialDocument extends mongoose.Document, Omit<IDocumentoHistorial, 'id' | 'documentoId' | 'usuarioId'> {
  documentoId: mongoose.Types.ObjectId;
  usuarioId: mongoose.Types.ObjectId;
}

const DocumentoHistorialSchema = new mongoose.Schema<IDocumentoHistorialDocument>(
  {
    documentoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Documento',
      required: [true, 'El ID del documento es obligatorio'],
    },
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El ID del usuario es obligatorio'],
    },
    tipoAccion: {
      type: String,
      enum: Object.values(TipoAccion),
      required: [true, 'El tipo de acción es obligatorio'],
    },
    detalles: {
      type: String,
    },
    metadatos: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipCliente: {
      type: String,
      maxlength: 45,
    },
    userAgent: {
      type: String,
      maxlength: 255,
    },
    fechaAccion: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: {
      createdAt: 'fechaAccion',
      updatedAt: false, // No queremos campo updatedAt en el historial
    },
  }
);

// Índices para mejorar búsquedas
DocumentoHistorialSchema.index({ documentoId: 1 });
DocumentoHistorialSchema.index({ usuarioId: 1 });
DocumentoHistorialSchema.index({ tipoAccion: 1 });
DocumentoHistorialSchema.index({ fechaAccion: -1 });
DocumentoHistorialSchema.index({ documentoId: 1, fechaAccion: -1 });

export const DocumentoHistorial = mongoose.model<IDocumentoHistorialDocument>('DocumentoHistorial', DocumentoHistorialSchema);
