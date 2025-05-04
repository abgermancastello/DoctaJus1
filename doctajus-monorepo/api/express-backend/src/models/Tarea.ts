import mongoose from 'mongoose';

export enum EstadoTarea {
  PENDIENTE = 'pendiente',
  EN_PROGRESO = 'en_progreso',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
}

export enum PrioridadTarea {
  ALTA = 'alta',
  MEDIA = 'media',
  BAJA = 'baja',
}

export interface ITarea {
  id?: string;
  titulo: string;
  descripcion: string;
  fechaCreacion: Date;
  fechaVencimiento: Date;
  fechaCompletada?: Date;
  prioridad: PrioridadTarea;
  estado: EstadoTarea;
  expedienteId?: mongoose.Types.ObjectId | string;
  responsableId: mongoose.Types.ObjectId | string;
  creadorId: mongoose.Types.ObjectId | string;
  fechaActualizacion: Date;
}

export interface ITareaDocument extends mongoose.Document, Omit<ITarea, 'id' | 'expedienteId' | 'responsableId' | 'creadorId'> {
  expedienteId?: mongoose.Types.ObjectId;
  responsableId: mongoose.Types.ObjectId;
  creadorId: mongoose.Types.ObjectId;
}

const TareaSchema = new mongoose.Schema<ITareaDocument>(
  {
    titulo: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
    },
    fechaVencimiento: {
      type: Date,
      required: [true, 'La fecha de vencimiento es obligatoria'],
    },
    fechaCompletada: {
      type: Date,
    },
    prioridad: {
      type: String,
      enum: Object.values(PrioridadTarea),
      default: PrioridadTarea.MEDIA,
    },
    estado: {
      type: String,
      enum: Object.values(EstadoTarea),
      default: EstadoTarea.PENDIENTE,
    },
    expedienteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expediente',
    },
    responsableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El responsable es obligatorio'],
    },
    creadorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El creador es obligatorio'],
    },
  },
  {
    timestamps: {
      createdAt: 'fechaCreacion',
      updatedAt: 'fechaActualizacion',
    },
  }
);

// Middleware pre-save para manejar cambios de estado
TareaSchema.pre('save', function(next) {
  if (this.isModified('estado') && this.estado === EstadoTarea.COMPLETADA && !this.fechaCompletada) {
    this.fechaCompletada = new Date();
  }
  if (this.isModified('estado') && this.estado !== EstadoTarea.COMPLETADA) {
    this.fechaCompletada = undefined;
  }
  next();
});

// Índices para mejorar búsquedas
TareaSchema.index({ estado: 1 });
TareaSchema.index({ prioridad: 1 });
TareaSchema.index({ fechaVencimiento: 1 });
TareaSchema.index({ responsableId: 1 });
TareaSchema.index({ expedienteId: 1 });
TareaSchema.index({ creadorId: 1 });
TareaSchema.index({ fechaCreacion: -1 });
TareaSchema.index({
  titulo: 'text',
  descripcion: 'text'
}, {
  weights: {
    titulo: 2,
    descripcion: 1
  },
  name: "texto_tarea"
});

// Índices compuestos para búsquedas comunes
TareaSchema.index({ responsableId: 1, estado: 1 });
TareaSchema.index({ expedienteId: 1, estado: 1 });
TareaSchema.index({ fechaVencimiento: 1, estado: 1 });
TareaSchema.index({ prioridad: 1, estado: 1 });

export const Tarea = mongoose.model<ITareaDocument>('Tarea', TareaSchema);
