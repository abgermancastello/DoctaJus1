import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from './config/logger';
import { corsMiddleware, corsErrorHandler } from './middleware/cors';
import {
  securityHeaders,
  rateLimiter,
  xssProtection,
  mongoSanitization,
  hppProtection,
  securityLogger
} from './middleware/security';
import authRoutes from './routes/authRoutes';
import clienteRoutes from './routes/clienteRoutes';
import userRoutes from './routes/userRoutes';
import expedienteRoutes from './routes/expedienteRoutes';
import expedienteDataRoutes from './routes/expedienteDataRoutes';
import tareaRoutes from './routes/tareaRoutes';
import etiquetaRoutes from './routes/etiquetaRoutes';
import documentoRoutes from './routes/documentoRoutes';
import documentoDataRoutes from './routes/documentoDataRoutes';
import path from 'path';

// Cargar variables de entorno
dotenv.config();

// Crear aplicación Express
const app = express();

// Middlewares de seguridad
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(rateLimiter);
app.use(xssProtection);
app.use(mongoSanitization);
app.use(hppProtection);
app.use(securityLogger);

// Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Definir rutas básicas
app.get('/', (_req: express.Request, res: express.Response) => {
  res.json({ message: 'API de DoctaJus funcionando correctamente' });
});

// Endpoint de health check
app.get('/api/health', (_req: express.Request, res: express.Response) => {
  res.status(200).json({ status: 'OK', message: 'El servidor está funcionando correctamente' });
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/users', userRoutes);
app.use('/api/expedientes', expedienteRoutes);
app.use('/api/expediente-data', expedienteDataRoutes);
app.use('/api/tareas', tareaRoutes);
app.use('/api/etiquetas', etiquetaRoutes);
app.use('/api/documentos', documentoRoutes);
app.use('/api/documento-data', documentoDataRoutes);

// Rutas estáticas para archivos subidos
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));

// Manejador de errores de CORS
app.use(corsErrorHandler);

// Manejador de errores global
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Error no manejado:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/doctajus');
    logger.info('Conectado a MongoDB');
  } catch (error) {
    logger.error('Error al conectar a MongoDB:', error);
    process.exit(1);
  }
};

// Conectar a la base de datos
connectDB();

// Iniciar servidor
// Comentamos esta parte para evitar iniciar dos servidores
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   logger.info(`Servidor corriendo en puerto ${PORT}`);
// });

export default app;
