import { Request, Response, NextFunction } from 'express';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { User, UserRole, IUser } from '../models/User';
import logger from '../config/logger';
import { Types } from 'mongoose';

interface JwtPayload {
  id: string;
  role: UserRole;
}

// Extender la interfaz Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
      };
    }
  }
}

// Middleware para verificar el token JWT
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    let token;

    // Verificar si el token viene en los headers de autorización
    if (req.headers.authorization?.startsWith('Bearer')) {
      // Extraer el token después de "Bearer "
      token = req.headers.authorization.split(' ')[1];

      // Validar formato básico del token
      if (!token || token.length < 10 || !token.includes('.')) {
        logger.error('Token con formato inválido');
        return res.status(401).json({
          success: false,
          message: 'No autorizado - Token con formato inválido'
        });
      }
    } else if (req.cookies?.token) {
      // Alternativamente, buscar en cookies
      token = req.cookies.token;
    } else if (req.query?.token && typeof req.query.token === 'string') {
      // O como parámetro de consulta (solo para pruebas/desarrollo)
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado - Token no proporcionado'
      });
    }

    // Usar un bloque try-catch específico para la verificación del token
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'default_secret'
      ) as JwtPayload;

      // Verificar que el id sea un ObjectId válido
      if (!Types.ObjectId.isValid(decoded.id)) {
        logger.error('ID de usuario inválido en el token');
        return res.status(401).json({
          success: false,
          message: 'No autorizado - Token contiene información inválida'
        });
      }

      const user = await User.findById(new Types.ObjectId(decoded.id))
        .select('-password')
        .exec() as IUser | null;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'No autorizado - Usuario no encontrado'
        });
      }

      req.user = {
        id: user._id.toString(),
        role: user.role
      };

      next();
    } catch (tokenError) {
      if (tokenError instanceof TokenExpiredError) {
        logger.error('Token expirado');
        return res.status(401).json({
          success: false,
          message: 'No autorizado - Token expirado',
          expired: true
        });
      } else if (tokenError instanceof JsonWebTokenError) {
        logger.error(`JWT error: ${tokenError.message}`);
        return res.status(401).json({
          success: false,
          message: 'No autorizado - Token inválido o malformado'
        });
      } else {
        throw tokenError; // Propagar otros errores al handler principal
      }
    }
  } catch (error) {
    logger.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al procesar la autenticación'
    });
  }
};

// Middleware para verificar roles
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado - Usuario no autenticado'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado - Rol no permitido'
      });
    }

    next();
  };
};

// Middleware para verificar si el usuario es el propietario o tiene rol adecuado
export const checkOwnership = (req: Request, res: Response, next: NextFunction): void | Response => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'No autorizado'
    });
  }

  // Si es admin o abogado, puede acceder a todo
  if (['admin', 'abogado'].includes(req.user.role)) {
    return next();
  }

  // Si es asistente, solo puede acceder a sus propias tareas
  if (req.user.role === 'asistente') {
    if (req.params.id && req.params.id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tiene permisos para acceder a este recurso'
      });
    }
  }

  next();
};
