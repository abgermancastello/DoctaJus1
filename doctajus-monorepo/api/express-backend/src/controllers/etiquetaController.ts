import { Request, Response } from 'express';
import { Etiqueta, IEtiqueta } from '../models/Etiqueta';
import logger from '../config/logger';

// Obtener todas las etiquetas
export const getEtiquetas = async (_req: Request, res: Response): Promise<void> => {
  try {
    const etiquetas = await Etiqueta.find().sort({ nombre: 1 });

    res.status(200).json({
      success: true,
      count: etiquetas.length,
      data: etiquetas
    });
  } catch (error) {
    logger.error('Error al obtener etiquetas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener etiquetas'
    });
  }
};

// Obtener una etiqueta por su ID
export const getEtiquetaById = async (req: Request, res: Response): Promise<void> => {
  try {
    const etiqueta = await Etiqueta.findById(req.params.id);

    if (!etiqueta) {
      res.status(404).json({
        success: false,
        message: 'Etiqueta no encontrada'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: etiqueta
    });
  } catch (error) {
    logger.error(`Error al obtener etiqueta ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener etiqueta'
    });
  }
};

// Crear una nueva etiqueta
export const createEtiqueta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, color, descripcion } = req.body;

    // Verificar si ya existe una etiqueta con el mismo nombre
    const existingEtiqueta = await Etiqueta.findOne({ nombre });
    if (existingEtiqueta) {
      res.status(400).json({
        success: false,
        message: 'Ya existe una etiqueta con ese nombre'
      });
      return;
    }

    // Crear la etiqueta
    const etiqueta = await Etiqueta.create({
      nombre,
      color,
      descripcion
    });

    res.status(201).json({
      success: true,
      data: etiqueta,
      message: 'Etiqueta creada exitosamente'
    });
  } catch (error) {
    logger.error('Error al crear etiqueta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear etiqueta'
    });
  }
};

// Actualizar una etiqueta
export const updateEtiqueta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, color, descripcion } = req.body;

    // Verificar si existe la etiqueta
    let etiqueta = await Etiqueta.findById(req.params.id);

    if (!etiqueta) {
      res.status(404).json({
        success: false,
        message: 'Etiqueta no encontrada'
      });
      return;
    }

    // Si se cambia el nombre, verificar que no exista otra etiqueta con ese nombre
    if (nombre && nombre !== etiqueta.nombre) {
      const existingEtiqueta = await Etiqueta.findOne({ nombre });
      if (existingEtiqueta) {
        res.status(400).json({
          success: false,
          message: 'Ya existe una etiqueta con ese nombre'
        });
        return;
      }
    }

    // Actualizar la etiqueta
    const updatedEtiqueta = await Etiqueta.findByIdAndUpdate(
      req.params.id,
      { nombre, color, descripcion },
      { new: true, runValidators: true }
    );

    if (!updatedEtiqueta) {
      res.status(404).json({
        success: false,
        message: 'Etiqueta no encontrada después de la actualización'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: updatedEtiqueta,
      message: 'Etiqueta actualizada exitosamente'
    });
  } catch (error) {
    logger.error(`Error al actualizar etiqueta ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar etiqueta'
    });
  }
};

// Eliminar una etiqueta
export const deleteEtiqueta = async (req: Request, res: Response): Promise<void> => {
  try {
    const etiqueta = await Etiqueta.findById(req.params.id);

    if (!etiqueta) {
      res.status(404).json({
        success: false,
        message: 'Etiqueta no encontrada'
      });
      return;
    }

    await etiqueta.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Etiqueta eliminada exitosamente'
    });
  } catch (error) {
    logger.error(`Error al eliminar etiqueta ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar etiqueta'
    });
  }
};
