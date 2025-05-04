import mongoose from 'mongoose';

export enum TipoCliente {
  PERSONA = 'persona',
  EMPRESA = 'empresa',
}

export interface ICliente {
  id?: string;
  nombre: string;
  apellido?: string;
  razonSocial?: string;
  tipo: TipoCliente;
  documento: string;
  email: string;
  telefono: string;
  direccion: string;
  notas?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface IClienteDocument extends mongoose.Document, Omit<ICliente, 'id'> {}

const ClienteSchema = new mongoose.Schema<IClienteDocument>(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    apellido: {
      type: String,
      trim: true,
      required: function(this: IClienteDocument) {
        return this.tipo === TipoCliente.PERSONA;
      },
    },
    razonSocial: {
      type: String,
      trim: true,
      required: function(this: IClienteDocument) {
        return this.tipo === TipoCliente.EMPRESA;
      },
    },
    tipo: {
      type: String,
      enum: Object.values(TipoCliente),
      required: true,
    },
    documento: {
      type: String,
      required: [true, 'El documento/CUIT es obligatorio'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Por favor ingrese un email válido'],
    },
    telefono: {
      type: String,
      required: [true, 'El teléfono es obligatorio'],
      trim: true,
    },
    direccion: {
      type: String,
      required: [true, 'La dirección es obligatoria'],
      trim: true,
    },
    notas: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: {
      createdAt: 'fechaCreacion',
      updatedAt: 'fechaActualizacion',
    },
  }
);

// Índices para mejorar búsquedas
ClienteSchema.index({ email: 1 });
ClienteSchema.index({
  nombre: 'text',
  apellido: 'text',
  razonSocial: 'text'
}, {
  weights: {
    nombre: 3,
    apellido: 2,
    razonSocial: 3
  },
  name: "texto_cliente"
});

export const Cliente = mongoose.model<IClienteDocument>('Cliente', ClienteSchema);
