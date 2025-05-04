import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

// Lista de orígenes permitidos
const allowedOrigins = [
  'http://localhost:3000',     // Frontend en desarrollo
  'http://localhost:5173',     // Vite dev server
  'http://localhost:4002',     // API en desarrollo
  'https://doctajus.com',      // Producción
  'https://app.doctajus.com'   // Subdominio de producción
];

// Opciones de CORS
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // 24 horas
};

// Middleware de CORS
export const corsMiddleware = cors(corsOptions);

// Middleware para manejar errores de CORS
export const corsErrorHandler = (err: Error, _req: Request, res: Response, next: NextFunction): void | Response => {
  if (err.message === 'No permitido por CORS') {
    logger.warn('Intento de acceso CORS no permitido');
    return res.status(403).json({
      success: false,
      message: 'Acceso no permitido'
    });
  }
  return next(err);
};
