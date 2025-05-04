import mongoose from 'mongoose';

export enum TipoPermiso {
  LECTURA = 'lectura',
  ESCRITURA = 'escritura',
  ADMINISTRADOR = 'administrador'
}

export interface IDocumentoPermiso {
  id?: string;
  documentoId: mongoose.Types.ObjectId | string;
  usuarioId: mongoose.Types.ObjectId | string;
  tipoPermiso: TipoPermiso;
  otorgadoPorId: mongoose.Types.ObjectId | string;
  fechaCreacion: Date;
  fechaModificacion: Date;
}

export interface IDocumentoPermisoDocument extends mongoose.Document, Omit<IDocumentoPermiso, 'id' | 'documentoId' | 'usuarioId' | 'otorgadoPorId'> {
  documentoId: mongoose.Types.ObjectId;
  usuarioId: mongoose.Types.ObjectId;
  otorgadoPorId: mongoose.Types.ObjectId;
}

const DocumentoPermisoSchema = new mongoose.Schema<IDocumentoPermisoDocument>(
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
    tipoPermiso: {
      type: String,
      enum: Object.values(TipoPermiso),
      default: TipoPermiso.LECTURA,
      required: true,
    },
    otorgadoPorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El ID del usuario que otorga el permiso es obligatorio'],
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
DocumentoPermisoSchema.index({ documentoId: 1 });
DocumentoPermisoSchema.index({ usuarioId: 1 });
DocumentoPermisoSchema.index({ documentoId: 1, usuarioId: 1 }, { unique: true });
DocumentoPermisoSchema.index({ otorgadoPorId: 1 });

export const DocumentoPermiso = mongoose.model<IDocumentoPermisoDocument>('DocumentoPermiso', DocumentoPermisoSchema);
