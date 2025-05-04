import mongoose from 'mongoose';
import { connectDB } from '../config/database';
import logger from '../config/logger';

const checkConnection = async () => {
  try {
    await connectDB();

    // Verificar el estado de la conexión
    const state = mongoose.connection.readyState;
    const states: { [key: number]: string } = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    logger.info(`Estado de la conexión: ${states[state]}`);

    // Verificar que la conexión esté establecida
    if (!mongoose.connection.db) {
      throw new Error('No hay conexión a la base de datos');
    }

    // Verificar la versión de MongoDB
    const admin = mongoose.connection.db.admin();
    const buildInfo = await admin.buildInfo();
    logger.info(`Versión de MongoDB: ${buildInfo.version}`);

    // Verificar las colecciones existentes
    const collections = await mongoose.connection.db.listCollections().toArray();
    logger.info('Colecciones existentes:', collections.map((c: { name: string }) => c.name));

    // Cerrar la conexión
    await mongoose.connection.close();
    logger.info('Conexión cerrada exitosamente');

    process.exit(0);
  } catch (error) {
    logger.error('Error al verificar la conexión:', error);
    process.exit(1);
  }
};

// Ejecutar la verificación
checkConnection();
