import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from './logger';

dotenv.config();

// Conexión a MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  logger.error('MONGODB_URI no está definida en las variables de entorno');
  process.exit(1);
}

// Opciones de conexión
const options = {
  autoIndex: process.env.NODE_ENV !== 'production', // No crear índices en producción
  maxPoolSize: 10, // Máximo número de conexiones en el pool
  serverSelectionTimeoutMS: 5000, // Tiempo de espera para seleccionar servidor
  socketTimeoutMS: 45000, // Tiempo de espera para operaciones
  family: 4 // Usar IPv4, ignorar IPv6
};

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/doctajus');
    logger.info(`MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    logger.error('Error al conectar a MongoDB:', error);
    process.exit(1);
  }
};

// Eventos de conexión MongoDB para monitoreo
mongoose.connection.on('error', (err) => {
  logger.error(`Error de conexión MongoDB: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Desconectado de MongoDB');
});

mongoose.connection.on('reconnected', () => {
  logger.info('Reconectado a MongoDB');
});

// Manejo de cierre de la aplicación
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    logger.info('Conexión a MongoDB Atlas cerrada debido a la terminación de la aplicación');
    process.exit(0);
  } catch (error) {
    logger.error('Error al cerrar la conexión de MongoDB:', error);
    process.exit(1);
  }
});
