import express from 'express';
import { check } from 'express-validator';
import {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente
} from '../controllers/clienteController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { TipoCliente } from '../models/Cliente';

const router = express.Router();

// Validaciones base para clientes
const baseClienteValidation = [
  check('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  check('tipo')
    .isIn(Object.values(TipoCliente))
    .withMessage('Tipo de cliente no válido'),
  check('documento')
    .notEmpty()
    .withMessage('El documento/CUIT es obligatorio'),
  check('email')
    .isEmail()
    .withMessage('El email no es válido')
    .normalizeEmail(),
  check('telefono')
    .notEmpty()
    .withMessage('El teléfono es obligatorio'),
  check('direccion')
    .notEmpty()
    .withMessage('La dirección es obligatoria')
];

// Validaciones condicionales según el tipo de cliente
const clienteValidation = [
  ...baseClienteValidation,
  check('apellido')
    .if((value, { req }) => req.body.tipo === TipoCliente.PERSONA)
    .notEmpty()
    .withMessage('El apellido es obligatorio para clientes tipo persona'),
  check('razonSocial')
    .if((value, { req }) => req.body.tipo === TipoCliente.EMPRESA)
    .notEmpty()
    .withMessage('La razón social es obligatoria para clientes tipo empresa')
];

// Todas las rutas requieren autenticación
router.use(protect);

// GET /api/clientes - Obtener todos los clientes
router.get('/', getClientes);

// GET /api/clientes/:id - Obtener un cliente específico
router.get('/:id', getClienteById);

// POST /api/clientes - Crear un nuevo cliente
router.post('/', validate(clienteValidation), createCliente);

// PUT /api/clientes/:id - Actualizar un cliente
router.put('/:id', validate(clienteValidation), updateCliente);

// DELETE /api/clientes/:id - Eliminar un cliente
router.delete('/:id', deleteCliente);

export default router;
