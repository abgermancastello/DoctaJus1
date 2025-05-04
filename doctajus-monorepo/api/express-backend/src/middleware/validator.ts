import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

// Middleware para validar la entrada utilizando express-validator
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Ejecutar todas las validaciones
    await Promise.all(validations.map(validation => validation.run(req)));
    
    // Recolectar errores de validación
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }
    
    // Formato personalizado para errores de validación
    const formattedErrors = errors.array().reduce((acc: any, error: any) => {
      const field = error.path;
      if (!acc[field]) {
        acc[field] = [];
      }
      acc[field].push(error.msg);
      return acc;
    }, {});
    
    // Responder con errores de validación
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: formattedErrors
    });
  };
}; 