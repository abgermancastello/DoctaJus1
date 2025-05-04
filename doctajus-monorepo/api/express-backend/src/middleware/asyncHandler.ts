import { Request, Response, NextFunction } from 'express';

// Middleware que envuelve funciones asíncronas para manejo de errores
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
