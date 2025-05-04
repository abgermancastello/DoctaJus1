import mongoose from 'mongoose';

export enum EstadoExpediente {
  NUEVO = 'nuevo',
  EN_TRAMITE = 'en_tramite',
  EN_ESPERA = 'en_espera',
  FINALIZADO = 'finalizado',
  ARCHIVADO = 'archivado',
}

export enum TipoExpediente {
  CIVIL = 'civil',
  PENAL = 'penal',
  LABORAL = 'laboral',
  ADMINISTRATIVO = 'administrativo',
  COMERCIAL = 'comercial',
  FAMILIA = 'familia',
  OTRO = 'otro'
}

export interface IExpediente {
  id?: string;
  numero: string;
  titulo: string;
  descripcion: string;
  tipo: TipoExpediente;
  estado: EstadoExpediente;
  clienteId: mongoose.Types.ObjectId | string;
  abogadoId: mongoose.Types.ObjectId | string;
  fechaInicio?: Date;
  fechaFin?: Date;
  juzgado?: string;
  numeroJuzgado?: string;
  juez?: string;
  montoReclamado?: number;
  monedaReclamo?: string;
  etiquetas?: string[];
  notas?: string;
  destacado?: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface IExpedienteDocument extends mongoose.Document, Omit<IExpediente, 'id' | 'clienteId' | 'abogadoId'> {
  clienteId: mongoose.Types.ObjectId;
  abogadoId: mongoose.Types.ObjectId;
  documentosCount?: number;
  tareasCount?: number;
}

const ExpedienteSchema = new mongoose.Schema<IExpedienteDocument>(
  {
    numero: {
      type: String,
      required: [true, 'El número de expediente es obligatorio'],
      unique: true,
      trim: true,
      index: true
    },
    titulo: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
    },
    tipo: {
      type: String,
      enum: Object.values(TipoExpediente),
      default: TipoExpediente.OTRO,
    },
    estado: {
      type: String,
      enum: Object.values(EstadoExpediente),
      default: EstadoExpediente.NUEVO,
    },
    clienteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cliente',
      required: [true, 'El cliente es obligatorio'],
    },
    abogadoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El abogado responsable es obligatorio'],
    },
    fechaInicio: {
      type: Date,
    },
    fechaFin: {
      type: Date,
    },
    juzgado: {
      type: String,
      trim: true,
    },
    numeroJuzgado: {
      type: String,
      trim: true,
    },
    juez: {
      type: String,
      trim: true,
    },
    montoReclamado: {
      type: Number,
    },
    monedaReclamo: {
      type: String,
      trim: true,
    },
    etiquetas: {
      type: [String],
      default: [],
    },
    notas: {
      type: String,
    },
    destacado: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: {
      createdAt: 'fechaCreacion',
      updatedAt: 'fechaActualizacion',
    },
  }
);

// Índices para mejorar búsquedas
ExpedienteSchema.index({ clienteId: 1 });
ExpedienteSchema.index({ abogadoId: 1 });
ExpedienteSchema.index({ estado: 1 });
ExpedienteSchema.index({ tipo: 1 });
ExpedienteSchema.index({ etiquetas: 1 });
ExpedienteSchema.index({ destacado: 1 });
ExpedienteSchema.index({ fechaCreacion: -1 });
ExpedienteSchema.index({ fechaInicio: 1 });
ExpedienteSchema.index({ fechaFin: 1 });

// Índice de texto para búsqueda de texto completo
ExpedienteSchema.index(
  {
    numero: 'text',
    titulo: 'text',
    descripcion: 'text',
    juzgado: 'text',
    juez: 'text',
    notas: 'text'
  },
  {
    weights: {
      numero: 10,
      titulo: 5,
      descripcion: 3,
      juzgado: 1,
      juez: 1,
      notas: 1
    },
    name: "texto_expediente"
  }
);

// Índices compuestos para búsquedas comunes
ExpedienteSchema.index({ abogadoId: 1, estado: 1 });
ExpedienteSchema.index({ clienteId: 1, estado: 1 });
ExpedienteSchema.index({ tipo: 1, estado: 1 });

// Método virtual para obtener la cantidad de documentos asociados
ExpedienteSchema.virtual('documentosCount').get(function() {
  return mongoose.model('Documento').countDocuments({ expedienteId: this._id });
});

// Método virtual para obtener la cantidad de tareas asociadas
ExpedienteSchema.virtual('tareasCount').get(function() {
  return mongoose.model('Tarea').countDocuments({ expedienteId: this._id });
});

// Configurar virtuals cuando se convierte a JSON
ExpedienteSchema.set('toJSON', { virtuals: true });
ExpedienteSchema.set('toObject', { virtuals: true });

export const Expediente = mongoose.model<IExpedienteDocument>('Expediente', ExpedienteSchema);
