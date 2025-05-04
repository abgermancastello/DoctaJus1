import express from 'express';
import { protect } from '../middleware/auth';
import {
  getClientes,
  getExpedientes
} from '../controllers/documentoDataController';

const router = express.Router();

// Proteger todas las rutas
router.use(protect);

// Rutas públicas para usuarios autenticados
router.route('/clientes').get(getClientes);
router.route('/expedientes').get(getExpedientes);

export default router;
