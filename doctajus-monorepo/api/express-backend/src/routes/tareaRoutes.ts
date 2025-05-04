import express from 'express';
import { check } from 'express-validator';
import {
  getTareas,
  getTareaById,
  createTarea,
  updateTarea,
  deleteTarea
} from '../controllers/tareaController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { EstadoTarea, PrioridadTarea } from '../models/Tarea';

const router = express.Router();

// Validaciones para tareas
const tareaValidation = [
  check('titulo')
    .notEmpty()
    .withMessage('El título es obligatorio')
    .trim(),
  check('descripcion')
    .notEmpty()
    .withMessage('La descripción es obligatoria'),
  check('fechaVencimiento')
    .notEmpty()
    .withMessage('La fecha de vencimiento es obligatoria')
    .isISO8601()
    .withMessage('Formato de fecha inválido'),
  check('prioridad')
    .isIn(Object.values(PrioridadTarea))
    .withMessage('Prioridad no válida'),
  check('estado')
    .isIn(Object.values(EstadoTarea))
    .withMessage('Estado no válido'),
  check('responsableId')
    .notEmpty()
    .withMessage('El responsable es obligatorio')
    .isMongoId()
    .withMessage('ID de responsable no válido'),
  check('expedienteId')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('ID de expediente no válido')
];

// Todas las rutas requieren autenticación
router.use(protect);

// GET /api/tareas - Obtener todas las tareas
router.get('/', getTareas);

// GET /api/tareas/:id - Obtener una tarea específica
router.get('/:id', getTareaById);

// POST /api/tareas - Crear una nueva tarea
router.post('/', validate(tareaValidation), createTarea);

// PUT /api/tareas/:id - Actualizar una tarea
router.put('/:id', validate(tareaValidation), updateTarea);

// DELETE /api/tareas/:id - Eliminar una tarea
router.delete('/:id', deleteTarea);

export default router;
