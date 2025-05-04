import express from 'express';
import { protect } from '../middleware/auth';
import {
  getClientes,
  getAbogados,
  getEstadisticasExpedientes
} from '../controllers/expedienteDataController';

const router = express.Router();

// Proteger todas las rutas
router.use(protect);

// Rutas públicas para usuarios autenticados
router.route('/clientes').get(getClientes);
router.route('/abogados').get(getAbogados);
router.route('/estadisticas').get(getEstadisticasExpedientes);

export default router;
