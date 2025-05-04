import express from 'express';
import { check } from 'express-validator';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController';
import { protect, authorize } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { UserRole } from '../models/User';

const router = express.Router();

// Validaciones para crear/actualizar usuario
const userValidation = [
  check('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  check('apellido').notEmpty().withMessage('El apellido es obligatorio'),
  check('email')
    .isEmail()
    .withMessage('El email no es válido')
    .normalizeEmail(),
  check('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .optional({ nullable: true, checkFalsy: true }),
  check('role')
    .isIn(Object.values(UserRole))
    .withMessage('Rol no válido')
];

// Todas las rutas requieren autenticación
router.use(protect);

// GET /api/users - Obtener todos los usuarios
router.get('/', authorize(UserRole.ADMIN), getUsers);

// GET /api/users/:id - Obtener un usuario específico
router.get('/:id', getUserById);

// POST /api/users - Crear un nuevo usuario (solo admin)
router.post('/', [authorize(UserRole.ADMIN), validate(userValidation)], createUser);

// PUT /api/users/:id - Actualizar un usuario (admin puede actualizar a cualquiera, usuarios solo a sí mismos)
router.put('/:id', validate(userValidation), updateUser);

// DELETE /api/users/:id - Eliminar un usuario (solo admin)
router.delete('/:id', authorize(UserRole.ADMIN), deleteUser);

export default router;
