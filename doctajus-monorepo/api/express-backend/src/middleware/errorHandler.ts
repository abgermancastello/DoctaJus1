import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

// Interfaz para errores personalizados
export interface AppError extends Error {
  statusCode?: number;
  code?: number;
  errors?: any;
  keyValue?: any;
  value?: any;
}

// Middleware para manejar errores conocidos de MongoDB
export const handleMongoErrors = (err: any): AppError => {
  // Error de duplicado (código 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const error: AppError = new Error(`El valor ${value} para el campo ${field} ya está en uso`);
    error.statusCode = 400;
    return error;
  }

  // Error de validación de Mongoose
  if (err instanceof mongoose.Error.ValidationError) {
    const errors: { [key: string]: string[] } = {};
    
    Object.keys(err.errors).forEach((key) => {
      if (!errors[key]) {
        errors[key] = [];
      }
      errors[key].push(err.errors[key].message);
    });
    
    const error: AppError = new Error('Error de validación');
    error.statusCode = 400;
    error.errors = errors;
    return error;
  }

  // Error de casting (ID inválido)
  if (err instanceof mongoose.Error.CastError) {
    const error: AppError = new Error(`Valor inválido para ${err.path}: ${err.value}`);
    error.statusCode = 400;
    return error;
  }

  return err;
};

// Middleware de manejo global de errores
export const errorHandler = (
  err: AppError, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  console.error('Error:', err);
  
  // Procesar error para obtener detalles específicos
  const processedError = handleMongoErrors(err);
  
  // Código de estado del error
  const statusCode = processedError.statusCode || 500;
  
  // Respuesta para el cliente
  return res.status(statusCode).json({
    success: false,
    message: processedError.message || 'Error del servidor',
    errors: processedError.errors || undefined,
    // Solo incluir stack en desarrollo
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// Middleware para manejar rutas no encontradas
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error: AppError = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}; 