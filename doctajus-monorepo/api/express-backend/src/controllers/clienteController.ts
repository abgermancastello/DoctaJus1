import { Request, Response } from 'express';
import { Cliente, TipoCliente } from '../models/Cliente';

// Obtener todos los clientes
export const getClientes = async (req: Request, res: Response) => {
  try {
    const { search, tipo } = req.query;
    let query: any = {};
    
    // Filtrar por tipo si se proporciona
    if (tipo && Object.values(TipoCliente).includes(tipo as TipoCliente)) {
      query.tipo = tipo;
    }
    
    // Buscar por texto si se proporciona
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query = {
        ...query,
        $or: [
          { nombre: searchRegex },
          { apellido: searchRegex },
          { razonSocial: searchRegex },
          { documento: searchRegex },
          { email: searchRegex }
        ]
      };
    }
    
    const clientes = await Cliente.find(query);
    
    res.status(200).json({
      success: true,
      count: clientes.length,
      data: clientes
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener clientes'
    });
  }
};

// Obtener un cliente por ID
export const getClienteById = async (req: Request, res: Response) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: cliente
    });
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cliente'
    });
  }
};

// Crear un nuevo cliente
export const createCliente = async (req: Request, res: Response) => {
  try {
    // Verificar si el documento ya existe
    const documentoExists = await Cliente.findOne({ documento: req.body.documento });
    if (documentoExists) {
      return res.status(400).json({
        success: false,
        message: 'El documento/CUIT ya está registrado'
      });
    }
    
    // Crear el nuevo cliente
    const cliente = await Cliente.create(req.body);
    
    res.status(201).json({
      success: true,
      data: cliente
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear cliente'
    });
  }
};

// Actualizar un cliente
export const updateCliente = async (req: Request, res: Response) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: cliente
    });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar cliente'
    });
  }
};

// Eliminar un cliente
export const deleteCliente = async (req: Request, res: Response) => {
  try {
    // Verificamos si hay expedientes asociados antes de eliminar
    /*
    const expedientesRelacionados = await Expediente.countDocuments({ clienteId: req.params.id });
    if (expedientesRelacionados > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar el cliente porque tiene ${expedientesRelacionados} expedientes asociados`
      });
    }
    */
    
    const cliente = await Cliente.findByIdAndDelete(req.params.id);
    
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Cliente eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar cliente'
    });
  }
}; 