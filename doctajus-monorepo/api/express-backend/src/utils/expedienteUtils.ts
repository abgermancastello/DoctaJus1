import { Expediente } from '../models/Expediente';
import { Documento } from '../models/Documento';
import { Tarea } from '../models/Tarea';
import mongoose from 'mongoose';

/**
 * Buscar expedientes que coincidan con un término de búsqueda
 * @param searchTerm Término de búsqueda
 * @param limit Límite de resultados
 * @returns Array de expedientes coincidentes
 */
export const buscarExpedientes = async (searchTerm: string, limit = 10) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return [];
  }

  // Buscar por texto
  const expedientes = await Expediente.find(
    { $text: { $search: searchTerm } },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .populate('clienteId', 'nombre apellido razonSocial')
    .populate('abogadoId', 'nombre apellido');

  // Si hay menos resultados que el límite, buscar también por número de expediente
  if (expedientes.length < limit) {
    const expedientesPorNumero = await Expediente.find({
      numero: { $regex: searchTerm, $options: 'i' }
    })
      .limit(limit - expedientes.length)
      .populate('clienteId', 'nombre apellido razonSocial')
      .populate('abogadoId', 'nombre apellido');

    // Añadir a los resultados evitando duplicados
    const idsEncontrados = new Set(expedientes.map(exp => (exp._id as unknown as mongoose.Types.ObjectId).toString()));

    for (const exp of expedientesPorNumero) {
      const id = (exp._id as unknown as mongoose.Types.ObjectId).toString();
      if (!idsEncontrados.has(id)) {
        expedientes.push(exp);
        idsEncontrados.add(id);
      }
    }
  }

  return expedientes;
};

/**
 * Obtener resumen de un expediente incluyendo contadores de tareas y documentos
 * @param expedienteId ID del expediente
 * @returns Expediente con contadores
 */
export const obtenerResumenExpediente = async (expedienteId: string) => {
  try {
    const expedienteObjectId = new mongoose.Types.ObjectId(expedienteId);

    // Obtener el expediente
    const expediente = await Expediente.findById(expedienteObjectId)
      .populate('clienteId', 'nombre apellido razonSocial tipo documento email telefono')
      .populate('abogadoId', 'nombre apellido email');

    if (!expediente) {
      return null;
    }

    // Contar tareas y documentos asociados
    const tareasPendientesCount = await Tarea.countDocuments({
      expedienteId: expedienteObjectId,
      estado: 'pendiente'
    });

    const tareasCompletadasCount = await Tarea.countDocuments({
      expedienteId: expedienteObjectId,
      estado: 'completada'
    });

    const documentosCount = await Documento.countDocuments({
      expedienteId: expedienteObjectId
    });

    // Obtener documentos más recientes
    const documentosRecientes = await Documento.find({
      expedienteId: expedienteObjectId
    })
      .sort({ fechaCreacion: -1 })
      .limit(5)
      .select('nombre tipo estado fechaCreacion creadoPorId')
      .populate('creadoPorId', 'nombre apellido');

    // Obtener tareas pendientes más importantes
    const tareasPendientes = await Tarea.find({
      expedienteId: expedienteObjectId,
      estado: 'pendiente'
    })
      .sort({ prioridad: -1, fechaVencimiento: 1 })
      .limit(5)
      .select('titulo descripcion prioridad fechaVencimiento responsableId')
      .populate('responsableId', 'nombre apellido');

    // Preparar el resultado
    const expedienteData = expediente.toObject();

    // Añadir datos adicionales que no están en el modelo
    const expedienteResultado = {
      ...expedienteData,
      contadores: {
        tareasPendientes: tareasPendientesCount,
        tareasCompletadas: tareasCompletadasCount,
        tareasTotales: tareasPendientesCount + tareasCompletadasCount,
        documentos: documentosCount
      },
      documentosRecientes,
      tareasPendientes
    };

    return expedienteResultado;
  } catch (error) {
    console.error('Error al obtener resumen de expediente:', error);
    return null;
  }
};

/**
 * Validar si un expediente puede ser eliminado
 * @param expedienteId ID del expediente
 * @returns Objeto con información sobre si se puede eliminar y elementos relacionados
 */
export const validarEliminacionExpediente = async (expedienteId: string) => {
  try {
    const expedienteObjectId = new mongoose.Types.ObjectId(expedienteId);

    // Contar elementos relacionados
    const tareasCount = await Tarea.countDocuments({ expedienteId: expedienteObjectId });
    const documentosCount = await Documento.countDocuments({ expedienteId: expedienteObjectId });

    const puedeEliminar = tareasCount === 0 && documentosCount === 0;

    return {
      puedeEliminar,
      elementosRelacionados: {
        tareas: tareasCount,
        documentos: documentosCount
      }
    };
  } catch (error) {
    console.error('Error al validar eliminación de expediente:', error);
    return {
      puedeEliminar: false,
      error: 'Error al validar la eliminación'
    };
  }
};
