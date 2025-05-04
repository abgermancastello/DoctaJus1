import crypto from 'crypto';
import { Types } from 'mongoose';
import { Response } from 'express';
import { RefreshToken } from '../models/RefreshToken';
import { User, UserRole } from '../models/User';
import logger from '../config/logger';

// Generar access token (corta duración)
export const generateAccessToken = (id: string, role: UserRole): string => {
  const options: SignOptions = { expiresIn: process.env.JWT_EXPIRATION || '15m' };
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'doctajus_jwt_secret_dev_key',
    options
  );
};

// Generar refresh token (larga duración)
export const generateRefreshToken = (id: string, ip?: string): string => {
  const options: SignOptions = { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '7d' };
  return jwt.sign(
    { id, type: 'refresh', ip: ip || 'unknown' },
    process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || 'doctajus_refresh_secret_dev_key',
    options
  );
};

// Guardar refresh token en la base de datos
export const saveRefreshToken = async (userId: string, token: string, ipAddress?: string) => {
  try {
    // Crear hash del token para almacenamiento seguro
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Calcular fecha de expiración
    const expirationDays = process.env.REFRESH_TOKEN_EXPIRATION_DAYS
      ? parseInt(process.env.REFRESH_TOKEN_EXPIRATION_DAYS)
      : 7;
    const expires = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000);

    // Crear objeto de refresh token
    const refreshToken = new RefreshToken({
      token: tokenHash,
      user: new Types.ObjectId(userId),
      expires,
      createdByIp: ipAddress || 'unknown'
    });

    // Guardar el token
    await refreshToken.save();

    // Actualizar referencia en usuario (comentado para evitar cambiar el modelo User)
    // await User.findByIdAndUpdate(userId, { $push: { refreshTokens: refreshToken._id } });

    return refreshToken;
  } catch (error) {
    logger.error('Error al guardar refresh token:', error);
    throw error;
  }
};

// Configurar cookie con refresh token
export const setTokenCookie = (res: Response, token: string) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    signed: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' as const : 'lax' as const
  };

  res.cookie('refreshToken', token, cookieOptions);
};

// Verificar refresh token
export const verifyRefreshToken = async (token: string) => {
  try {
    // Crear hash del token
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Buscar token en la base de datos
    const storedToken = await RefreshToken.findOne({ token: tokenHash }).populate('user');

    if (!storedToken) {
      throw new Error('Token no encontrado');
    }

    // Verificar si el token es activo
    if (!storedToken.isActive) {
      throw new Error('Token inactivo');
    }

    return storedToken;
  } catch (error) {
    logger.error('Error al verificar refresh token:', error);
    throw error;
  }
};

// Revocar refresh token
export const revokeRefreshToken = async (token: string, ipAddress?: string) => {
  try {
    // Crear hash del token
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Buscar y actualizar el token
    const storedToken = await RefreshToken.findOne({ token: tokenHash });

    if (!storedToken) {
      return false;
    }

    // Revocar el token
    storedToken.revoked = new Date();
    storedToken.revokedByIp = ipAddress || 'unknown';
    await storedToken.save();

    return true;
  } catch (error) {
    logger.error('Error al revocar refresh token:', error);
    throw error;
  }
};

// Revocar todos los tokens de un usuario
export const revokeAllUserTokens = async (userId: string, ipAddress?: string) => {
  try {
    const tokensToRevoke = await RefreshToken.find({
      user: new Types.ObjectId(userId),
      revoked: { $exists: false }
    });

    const updatePromises = tokensToRevoke.map(token => {
      token.revoked = new Date();
      token.revokedByIp = ipAddress || 'unknown';
      return token.save();
    });

    await Promise.all(updatePromises);
    return tokensToRevoke.length;
  } catch (error) {
    logger.error('Error al revocar todos los tokens del usuario:', error);
    throw error;
  }
};
