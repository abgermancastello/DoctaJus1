import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum UserRole {
  ADMIN = 'admin',
  ABOGADO = 'abogado',
  ASISTENTE = 'asistente',
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  id?: string;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  role: UserRole;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
  },
  apellido: {
    type: String,
    required: [true, 'El apellido es requerido'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingrese un email válido'],
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.ASISTENTE,
  },
  activo: {
    type: Boolean,
    default: true,
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    select: false
  }
}, {
  timestamps: true,
});

// Middleware para encriptar contraseña antes de guardar
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Índices para mejorar búsquedas
UserSchema.index({ role: 1 });
UserSchema.index({ activo: 1 });
UserSchema.index({
  nombre: 'text',
  apellido: 'text'
}, {
  weights: {
    nombre: 2,
    apellido: 2
  },
  name: "texto_usuario"
});

export const User = mongoose.model<IUser>('User', UserSchema);
