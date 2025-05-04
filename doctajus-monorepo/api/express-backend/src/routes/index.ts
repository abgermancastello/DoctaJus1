import express from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import clienteRoutes from './clienteRoutes';
import expedienteRoutes from './expedienteRoutes';
import expedienteDataRoutes from './expedienteDataRoutes';
import tareaRoutes from './tareaRoutes';
import etiquetaRoutes from './etiquetaRoutes';
import documentoRoutes from './documentoRoutes';
import documentoDataRoutes from './documentoDataRoutes';

const router = express.Router();

// Rutas principales
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/clientes', clienteRoutes);
router.use('/expedientes', expedienteRoutes);
router.use('/expediente-data', expedienteDataRoutes);
router.use('/tareas', tareaRoutes);
router.use('/etiquetas', etiquetaRoutes);
router.use('/documentos', documentoRoutes);
router.use('/documento-data', documentoDataRoutes);

export default router;
