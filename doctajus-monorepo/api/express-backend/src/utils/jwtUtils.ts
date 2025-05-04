import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User';

/**
 * Genera un token JWT de acceso
 * @param id ID del usuario
 * @param role Rol del usuario
 * @returns Token JWT firmado
 */
export function generateAccessToken(id: string, role: UserRole): string {
  const payload = { id, role };
  const secret = process.env.JWT_SECRET || 'doctajus_jwt_secret_dev_key';
  const expiresIn = process.env.JWT_EXPIRATION || '15m';

  // Usamos el método encadenado para evitar problemas de tipado
  return jwt.sign(payload, secret).toString();
}

/**
 * Genera un token JWT de refresco
 * @param id ID del usuario
 * @param ip IP del cliente (opcional)
 * @returns Token JWT firmado
 */
export function generateRefreshToken(id: string, ip?: string): string {
  const payload = { id, type: 'refresh', ip: ip || 'unknown' };
  const secret = process.env.REFRESH_TOKEN_SECRET ||
                 process.env.JWT_SECRET ||
                 'doctajus_refresh_secret_dev_key';
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRATION || '7d';

  // Usamos el método encadenado para evitar problemas de tipado
  return jwt.sign(payload, secret).toString();
}

/**
 * Verifica un token JWT
 * @param token Token JWT a verificar
 * @param secret Clave secreta (opcional, usa JWT_SECRET por defecto)
 * @returns Payload decodificado o null si es inválido
 */
export function verifyToken(token: string, secret?: string): any {
  try {
    const secretKey = secret || process.env.JWT_SECRET || 'doctajus_jwt_secret_dev_key';
    return jwt.verify(token, secretKey);
  } catch (error) {
    return null;
  }
}
