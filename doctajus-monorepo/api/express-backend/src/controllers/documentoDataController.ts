import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { Cliente } from '../models/Cliente';
import { Expediente } from '../models/Expediente';

// @desc    Obtener clientes para el formulario de documentos
// @route   GET /api/documento-data/clientes
// @access  Private
export const getClientes = asyncHandler(async (req: Request, res: Response) => {
  try {
    const clientes = await Cliente.find({}, 'nombre apellido razonSocial tipo documento');
    console.log('DocumentoDataController.getClientes - Retornando clientes de la base de datos');

    const clientesFormateados = clientes.map(cliente => ({
      id: cliente._id,
      nombre: cliente.razonSocial || `${cliente.nombre} ${cliente.apellido || ''}`.trim(),
      documento: cliente.documento,
      tipo: cliente.tipo
    }));

    res.status(200).json(clientesFormateados);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la lista de clientes'
    });
  }
});

// @desc    Obtener expedientes para el formulario de documentos
// @route   GET /api/documento-data/expedientes
// @access  Private
export const getExpedientes = asyncHandler(async (req: Request, res: Response) => {
  try {
    const expedientes = await Expediente.find(
      { estado: { $ne: 'archivado' } },
      'numero titulo clienteId'
    ).populate('clienteId', 'nombre apellido razonSocial');

    console.log('DocumentoDataController.getExpedientes - Retornando expedientes de la base de datos');

    const expedientesFormateados = expedientes.map(expediente => {
      const cliente = expediente.clienteId as any;
      const nombreCliente = cliente ? (cliente.razonSocial || `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim()) : 'Sin cliente';

      return {
        id: expediente._id,
        numero: expediente.numero,
        titulo: expediente.titulo,
        nombreCliente: nombreCliente,
        descripcion: `${expediente.numero} - ${expediente.titulo} (${nombreCliente})`
      };
    });

    res.status(200).json(expedientesFormateados);
  } catch (error) {
    console.error('Error al obtener expedientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la lista de expedientes'
    });
  }
});
