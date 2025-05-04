import mongoose from 'mongoose';

export interface IDocumentoVersion {
  id?: string;
  documentoId: mongoose.Types.ObjectId | string;
  numeroVersion: number;
  archivoUrl: string;
  archivoNombre: string;
  archivoTamanio: number;
  archivoFormato: string;
  descripcionCambios?: string;
  creadoPorId: mongoose.Types.ObjectId | string;
  fechaCreacion: Date;
}

export interface IDocumentoVersionDocument extends mongoose.Document, Omit<IDocumentoVersion, 'id' | 'documentoId' | 'creadoPorId'> {
  documentoId: mongoose.Types.ObjectId;
  creadoPorId: mongoose.Types.ObjectId;
}

const DocumentoVersionSchema = new mongoose.Schema<IDocumentoVersionDocument>(
  {
    documentoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Documento',
      required: [true, 'El ID del documento es obligatorio'],
    },
    numeroVersion: {
      type: Number,
      required: [true, 'El número de versión es obligatorio'],
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
    descripcionCambios: {
      type: String,
    },
    creadoPorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario creador es obligatorio'],
    },
  },
  {
    timestamps: {
      createdAt: 'fechaCreacion',
      updatedAt: false, // No queremos campo updatedAt en las versiones
    },
  }
);

// Índices para mejorar búsquedas
DocumentoVersionSchema.index({ documentoId: 1 });
DocumentoVersionSchema.index({ documentoId: 1, numeroVersion: -1 });
DocumentoVersionSchema.index({ creadoPorId: 1 });

export const DocumentoVersion = mongoose.model<IDocumentoVersionDocument>('DocumentoVersion', DocumentoVersionSchema);
