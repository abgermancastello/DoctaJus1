import express from 'express';
import { check } from 'express-validator';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validator';
import {
  getEtiquetas,
  getEtiquetaById,
  createEtiqueta,
  updateEtiqueta,
  deleteEtiqueta
} from '../controllers/etiquetaController';

const router = express.Router();

// Validaciones para etiquetas
const etiquetaValidation = [
  check('nombre')
    .notEmpty()
    .withMessage('El nombre de la etiqueta es obligatorio'),
  check('color')
    .notEmpty()
    .withMessage('El color de la etiqueta es obligatorio')
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('El color debe ser un código hexadecimal válido')
];

// Todas las rutas requieren autenticación
router.use(protect);

// GET /etiquetas - Obtener todas las etiquetas
router.get('/', getEtiquetas);

// GET /etiquetas/:id - Obtener una etiqueta específica
router.get('/:id', getEtiquetaById);

// POST /etiquetas - Crear una nueva etiqueta
router.post('/', validate(etiquetaValidation), createEtiqueta);

// PUT /etiquetas/:id - Actualizar una etiqueta
router.put('/:id', validate(etiquetaValidation), updateEtiqueta);

// DELETE /etiquetas/:id - Eliminar una etiqueta
router.delete('/:id', deleteEtiqueta);

export default router;
