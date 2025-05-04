import express from 'express';
import multer from 'multer';
import { protect, authorize } from '../middleware/auth';
import {
  getDocumentos,
  getDocumentoById,
  createDocumento,
  // Añadir más funciones a medida que implementemos el controlador
} from '../controllers/documentoController';

const router = express.Router();

// Configurar multer para recibir archivos
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (_req, file, cb) => {
    // Validar tipos de archivo permitidos
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'text/plain'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      // Aceptar el archivo
      cb(null, true);
    } else {
      // Rechazar el archivo
      cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`));
    }
  }
});

// Manejador de errores para multer
const handleMulterError = (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'El archivo es demasiado grande. El tamaño máximo permitido es 10 MB.'
      });
    }
    return res.status(400).json({
      success: false,
      error: `Error al subir archivo: ${err.message}`
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }

  next();
};

// Proteger todas las rutas
router.use(protect);

// Rutas públicas para usuarios autenticados
router.route('/')
  .get(getDocumentos)
  .post(upload.single('archivo'), handleMulterError, createDocumento);

router.route('/:id')
  .get(getDocumentoById);

// Implementar las siguientes rutas a medida que implementemos el controlador:
// router.route('/:id').put(upload.single('archivo'), updateDocumento);
// router.route('/:id').delete(deleteDocumento);
// router.route('/:id/download').get(downloadDocumento);
// router.route('/:id/versions').get(getVersiones);
// router.route('/:id/permissions').get(getPermisos);
// router.route('/:id/permissions').post(addPermiso);
// router.route('/:id/permissions/:usuarioId').delete(removePermiso);
// router.route('/:id/history').get(getHistorial);
// router.route('/:id/estado').patch(cambiarEstado);
// router.route('/:id/destacar').patch(toggleDestacado);

export default router;
