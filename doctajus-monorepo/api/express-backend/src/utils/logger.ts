import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

// Asegurar que el directorio de logs exista
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Formatos
const { combine, timestamp, printf, colorize, json } = winston.format;

// Formato para consola
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  printf(({ level, message, timestamp, ...meta }) => {
    return `${timestamp} ${level}: ${message}${
      Object.keys(meta).length ? ' ' + JSON.stringify(meta) : ''
    }`;
  })
);

// Formato para archivos
const fileFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  json()
);

// Determinar el entorno
const nodeEnv = process.env.NODE_ENV || 'development';

// Configurar transportes
const transports: winston.transport[] = [
  // Siempre enviar a consola en desarrollo
  new winston.transports.Console({
    format: consoleFormat,
    level: nodeEnv === 'production' ? 'info' : 'debug'
  })
];

// Archivo de logs diario (solo si no estamos en pruebas)
if (nodeEnv !== 'test') {
  transports.push(
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: fileFormat,
      level: 'info'
    })
  );

  // Archivo específico para errores
  transports.push(
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'errors-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: fileFormat,
      level: 'error'
    })
  );
}

// Crear logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (nodeEnv === 'production' ? 'info' : 'debug'),
  transports,
  exitOnError: false
});

// Middleware para Express
export const httpLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
    
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    };
    
    // Añadir ID de usuario si está autenticado
    if (req.user?._id) {
      logData.userId = req.user._id;
    }
    
    // Decidir nivel de log por código de estado
    if (res.statusCode < 400) {
      logger.info(message, logData);
    } else if (res.statusCode < 500) {
      logger.warn(message, logData);
    } else {
      logger.error(message, logData);
    }
  });
  
  next();
};

// Configurar manejo de excepciones no capturadas
process.on('uncaughtException', (error) => {
  logger.error('Excepción no capturada', { error: error.stack });
  console.error('EXCEPCIÓN NO CAPTURADA:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Promesa rechazada no manejada', { reason });
  console.error('PROMESA RECHAZADA NO MANEJADA:', reason);
}); 