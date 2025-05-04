import mongoose, { Document, Schema } from 'mongoose';

export interface IEtiqueta extends Document {
  nombre: string;
  color: string;
  descripcion?: string;
  fechaCreacion: Date;
}

const EtiquetaSchema = new Schema<IEtiqueta>(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
    },
    color: {
      type: String,
      required: [true, 'El color es obligatorio'],
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'El color debe ser un código hexadecimal válido']
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [200, 'La descripción no puede tener más de 200 caracteres']
    },
    fechaCreacion: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Crear índice para búsquedas eficientes
EtiquetaSchema.index({ nombre: 1 }, { unique: true });

export const Etiqueta = mongoose.model<IEtiqueta>('Etiqueta', EtiquetaSchema);
