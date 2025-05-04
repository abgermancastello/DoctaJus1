import express from 'express';
import { check } from 'express-validator';
import {
  getExpedientes,
  getExpedienteById,
  createExpediente,
  updateExpediente,
  deleteExpediente,
  cambiarEstadoExpediente,
  toggleDestacadoExpediente,
  buscarExpedientesPorTermino
} from '../controllers/expedienteController';
import { protect, authorize } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { EstadoExpediente, TipoExpediente } from '../models/Expediente';
import { UserRole } from '../models/User';

const router = express.Router();

// Validaciones para expedientes
const expedienteValidation = [
  check('numero')
    .notEmpty()
    .withMessage('El número de expediente es obligatorio')
    .trim(),
  check('titulo')
    .notEmpty()
    .withMessage('El título es obligatorio')
    .trim(),
  check('descripcion')
    .notEmpty()
    .withMessage('La descripción es obligatoria'),
  check('tipo')
    .isIn(Object.values(TipoExpediente))
    .withMessage('Tipo no válido'),
  check('estado')
    .isIn(Object.values(EstadoExpediente))
    .withMessage('Estado no válido'),
  check('clienteId')
    .notEmpty()
    .withMessage('El cliente es obligatorio')
    .isMongoId()
    .withMessage('ID de cliente no válido'),
  check('abogadoId')
    .notEmpty()
    .withMessage('El abogado responsable es obligatorio')
    .isMongoId()
    .withMessage('ID de abogado no válido')
];

// Validación para cambiar estado
const estadoValidation = [
  check('estado')
    .isIn(Object.values(EstadoExpediente))
    .withMessage('Estado no válido')
];

// Validación para destacar
const destacadoValidation = [
  check('destacado')
    .isBoolean()
    .withMessage('El valor de destacado debe ser un booleano')
];

// Todas las rutas requieren autenticación
router.use(protect);

// Ruta de búsqueda
router.get('/buscar', buscarExpedientesPorTermino);

// Rutas principales
router.route('/')
  .get(getExpedientes)
  .post(validate(expedienteValidation), createExpediente);

router.route('/:id')
  .get(getExpedienteById)
  .put(validate(expedienteValidation), updateExpediente)
  .delete(authorize(UserRole.ADMIN, UserRole.ABOGADO), deleteExpediente);

// Rutas adicionales
router.route('/:id/estado')
  .patch(validate(estadoValidation), cambiarEstadoExpediente);

router.route('/:id/destacar')
  .patch(validate(destacadoValidation), toggleDestacadoExpediente);

export default router;
