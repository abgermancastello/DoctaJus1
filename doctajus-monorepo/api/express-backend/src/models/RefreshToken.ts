import mongoose, { Document, Schema, Types } from 'mongoose';
import { UserRole } from './User';

export interface IRefreshToken extends Document {
  token: string;
  user: Types.ObjectId;
  expires: Date;
  createdByIp: string;
  revoked?: Date;
  revokedByIp?: string;
  replacedByToken?: string;
  isActive: boolean;
}

const refreshTokenSchema = new Schema<IRefreshToken>({
  token: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expires: {
    type: Date,
    required: true
  },
  createdByIp: {
    type: String,
    required: true
  },
  revoked: {
    type: Date
  },
  revokedByIp: {
    type: String
  },
  replacedByToken: {
    type: String
  }
}, {
  timestamps: true
});

// Virtual para verificar si el token está activo
refreshTokenSchema.virtual('isActive').get(function() {
  // El token es activo si no está revocado y no ha expirado
  const isRevoked = !!this.revoked;
  const isExpired = Date.now() >= this.expires.getTime();
  return !isRevoked && !isExpired;
});

// Índices para mejorar rendimiento
refreshTokenSchema.index({ token: 1 });
refreshTokenSchema.index({ user: 1 });
refreshTokenSchema.index({ expires: 1 });

export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema);
