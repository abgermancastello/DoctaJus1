import app from './app';
import logger from './config/logger';

const PORT = process.env.PORT || 4002;

// Manejar promesas rechazadas no capturadas
process.on('unhandledRejection', (reason) => {
  logger.error('Promesa rechazada no manejada:', reason);
});

// Manejar excepciones no capturadas
process.on('uncaughtException', (error) => {
  logger.error('Excepción no capturada:', error);
});

// Función para iniciar el servidor
const startServer = async () => {
  try {
    const server = app.listen(PORT, () => {
      logger.info(`Servidor corriendo en puerto ${PORT}`);
    });

    // Manejar errores del servidor
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`El puerto ${PORT} está en uso. Por favor, libere el puerto o use otro puerto.`);
        process.exit(1);
      } else {
        logger.error('Error en el servidor:', error);
      }
    });

    // Manejar señales de terminación
    process.on('SIGTERM', () => {
      logger.info('Señal SIGTERM recibida. Cerrando servidor...');
      server.close(() => {
        logger.info('Servidor cerrado');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('Señal SIGINT recibida. Cerrando servidor...');
      server.close(() => {
        logger.info('Servidor cerrado');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar el servidor
startServer();
