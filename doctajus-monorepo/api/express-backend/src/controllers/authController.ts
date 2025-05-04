import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, UserRole } from '../models/User';
import logger from '../config/logger';
import * as jwtUtils from '../utils/jwtUtils';
import { RefreshToken } from '../models/RefreshToken';
import crypto from 'crypto';

// Generar token JWT (mantenido para compatibilidad)
const generateToken = (id: string, role: UserRole): string => {
  return jwtUtils.generateAccessToken(id, role);
};

// Guardar refresh token
const saveRefreshToken = async (userId: string, token: string, ipAddress: string) => {
  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const expirationDays = process.env.REFRESH_TOKEN_EXPIRATION_DAYS
      ? parseInt(process.env.REFRESH_TOKEN_EXPIRATION_DAYS)
      : 7;
    const expires = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000);

    const refreshToken = new RefreshToken({
      token: tokenHash,
      user: userId,
      expires,
      createdByIp: ipAddress || 'unknown'
    });

    await refreshToken.save();
    return refreshToken;
  } catch (error) {
    logger.error('Error al guardar refresh token:', error);
    throw error;
  }
};

// Configurar cookie
const setTokenCookie = (res: Response, token: string) => {
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
const verifyRefreshToken = async (token: string) => {
  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const storedToken = await RefreshToken.findOne({ token: tokenHash }).populate('user');

    if (!storedToken) {
      throw new Error('Token no encontrado');
    }

    const isRevoked = !!storedToken.revoked;
    const isExpired = Date.now() >= storedToken.expires.getTime();

    if (isRevoked || isExpired) {
      throw new Error('Token inactivo');
    }

    return storedToken;
  } catch (error) {
    logger.error('Error al verificar refresh token:', error);
    throw error;
  }
};

// Revocar refresh token
const revokeRefreshToken = async (token: string, ipAddress: string) => {
  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const storedToken = await RefreshToken.findOne({ token: tokenHash });

    if (!storedToken) {
      return false;
    }

    storedToken.revoked = new Date();
    storedToken.revokedByIp = ipAddress || 'unknown';
    await storedToken.save();

    return true;
  } catch (error) {
    logger.error('Error al revocar refresh token:', error);
    throw error;
  }
};

// Login - Mejorado con refresh tokens pero manteniendo comportamiento existente
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validación básica
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor ingrese email y contraseña'
      });
    }

    // Buscar usuario
    const user = await User.findOne({ email });

    // Verificar existencia y estado
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    if (!user.activo) {
      return res.status(401).json({
        success: false,
        message: 'Usuario desactivado'
      });
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar tokens
    const accessToken = jwtUtils.generateAccessToken(user._id.toString(), user.role);

    // Para no romper la compatibilidad, seguimos devolviendo el token como antes
    // Pero ahora internamente es un accessToken de corta duración
    const token = generateToken(user._id.toString(), user.role);

    // Generar refresh token solo si está habilitado en configuración
    if (process.env.USE_REFRESH_TOKENS === 'true') {
      const refreshToken = jwtUtils.generateRefreshToken(user._id.toString(), req.ip || 'unknown');

      // Guardar en BD
      await saveRefreshToken(user._id.toString(), refreshToken, req.ip || 'unknown');

      // Configurar cookie
      setTokenCookie(res, refreshToken);
    }

    // Devolver respuesta similar a la original
    return res.status(200).json({
      success: true,
      token, // Token compatible con sistema anterior
      accessToken, // Nuevo token de corta duración (opcional)
      user: {
        id: user._id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Error en login:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// Nuevo endpoint para refrescar el token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    // Obtener refresh token
    const token = req.cookies?.refreshToken || req.body.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token requerido'
      });
    }

    // Verificar token
    const storedToken = await verifyRefreshToken(token);
    const user = storedToken.user as any;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    // Verificar que el usuario esté activo
    if (!user.activo) {
      return res.status(401).json({
        success: false,
        message: 'Usuario desactivado'
      });
    }

    // Generar nuevos tokens
    const accessToken = jwtUtils.generateAccessToken(user._id.toString(), user.role);
    const newRefreshToken = jwtUtils.generateRefreshToken(user._id.toString(), req.ip || 'unknown');

    // Revocar token viejo y guardar nuevo
    await revokeRefreshToken(token, req.ip || 'unknown');
    await saveRefreshToken(user._id.toString(), newRefreshToken, req.ip || 'unknown');

    // Configurar cookie
    setTokenCookie(res, newRefreshToken);

    // Generar token compatible
    const tokenCompatible = generateToken(user._id.toString(), user.role);

    // Respuesta
    return res.status(200).json({
      success: true,
      token: tokenCompatible, // Compatibilidad
      accessToken,
      user: {
        id: user._id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Error en refresh token:', error);
    return res.status(401).json({
      success: false,
      message: 'Error al refrescar token'
    });
  }
};

// Nuevo endpoint para cerrar sesión
export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken || req.body.refreshToken;

    if (token) {
      // Revocar token
      await revokeRefreshToken(token, req.ip || 'unknown');

      // Limpiar cookie
      res.clearCookie('refreshToken');
    }

    return res.status(200).json({
      success: true,
      message: 'Sesión cerrada correctamente'
    });
  } catch (error) {
    logger.error('Error en logout:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al cerrar sesión'
    });
  }
};

// Registro de usuario
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, apellido, email, password, role } = req.body;

    // Validar campos requeridos con mensajes específicos
    const errores: string[] = [];
    if (!nombre) errores.push('El nombre es requerido');
    if (!apellido) errores.push('El apellido es requerido');
    if (!email) errores.push('El email es requerido');
    if (!password) errores.push('La contraseña es requerida');

    if (errores.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos',
        errors: errores
      });
      return;
    }

    // Validación específica del email
    if (email && !email.match(/^\S+@\S+\.\S+$/)) {
      res.status(400).json({
        success: false,
        message: 'Formato de email inválido',
        errors: ['Por favor ingrese un email válido']
      });
      return;
    }

    // Validación específica de la contraseña
    if (password && password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Contraseña demasiado corta',
        errors: ['La contraseña debe tener al menos 6 caracteres']
      });
      return;
    }

    // Verificar si el email ya está registrado
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'El email ya está registrado',
        errors: ['Este email ya está en uso']
      });
      return;
    }

    // Crear nuevo usuario con validación explícita del apellido (para evitar el error común)
    const user = await User.create({
      nombre: nombre.trim(),
      apellido: apellido.trim(), // Asegurarse de que apellido exista y esté limpio
      email: email.toLowerCase().trim(),
      password, // El modelo hará el hash
      role: role || UserRole.ASISTENTE,
      activo: true
    });

    // Generar token
    const token = generateToken(user._id.toString(), user.role);

    // Enviar respuesta
    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error: any) {
    logger.error('Error en registro:', error);

    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: errores
      });
      return;
    }

    // Manejar errores de duplicación (por si la validación de email único falla)
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'El email ya está registrado',
        errors: ['Este email ya está en uso']
      });
      return;
    }

    // Otros errores del servidor
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      errors: [error.message || 'Error interno']
    });
  }
};

// Obtener perfil del usuario actual
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
      return;
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// Obtener usuario autenticado actual
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
      return;
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Error al obtener usuario actual:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener información del usuario'
    });
  }
};

// Cambiar contraseña del usuario autenticado
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }

    // Verificar contraseña actual
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      res.status(400).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
      return;
    }

    // Actualizar contraseña (el modelo manejará el hash en el middleware pre-save)
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    logger.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// Solicitar recuperación de contraseña
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Por favor proporcione su dirección de correo electrónico'
      });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Por seguridad, no revelar si el correo existe o no
      res.status(200).json({
        success: true,
        message: 'Si su correo electrónico está registrado, recibirá instrucciones para restablecer su contraseña'
      });
      return;
    }

    // Generar token para restablecer contraseña
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Guardar token en la BD (válido por 1 hora)
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hora
    await user.save();

    // En un entorno real, aquí enviaríamos un correo con un enlace
    // que incluye el token, pero en desarrollo solo lo devolvemos
    // en la respuesta para pruebas

    if (process.env.NODE_ENV === 'production') {
      // En producción deberíamos enviar un correo real
      // Aquí iría el código para enviar el correo
      res.status(200).json({
        success: true,
        message: 'Se ha enviado un correo con instrucciones para restablecer su contraseña'
      });
    } else {
      // En desarrollo/pruebas, devolver el token en la respuesta
      res.status(200).json({
        success: true,
        message: 'Token generado para restablecer contraseña',
        resetToken,
        resetUrl: `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`
      });
    }
  } catch (error) {
    logger.error('Error en solicitud de recuperación de contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la solicitud de recuperación'
    });
  }
};

// Validar token de restablecimiento
export const validateResetToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Token requerido'
      });
      return;
    }

    // Hash del token proporcionado
    const resetTokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');

    // Buscar usuario con ese token y que no haya expirado
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Token inválido o ha expirado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Token válido'
    });
  } catch (error) {
    logger.error('Error al validar token de restablecimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar token'
    });
  }
};

// Restablecer contraseña
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({
        success: false,
        message: 'Token y nueva contraseña son requeridos'
      });
      return;
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
      return;
    }

    // Hash del token proporcionado
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Buscar usuario con ese token y que no haya expirado
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Token inválido o ha expirado'
      });
      return;
    }

    // Actualizar contraseña
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Respuesta exitosa
    res.status(200).json({
      success: true,
      message: 'Contraseña restablecida exitosamente'
    });
  } catch (error) {
    logger.error('Error al restablecer contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al restablecer contraseña'
    });
  }
};
