import React, { useState, useEffect } from 'react';
import {
  Movimiento,
  TipoMovimiento,
  CategoriaMovimiento,
  EstadoMovimiento,
  MetodoPago,
  Cliente
} from '../../stores/tesoreriaStore';
import moment from 'moment';

interface MovimientoFormProps {
  movimientoInicial: Movimiento | null;
  onGuardar: (datos: any) => Promise<void>;
  onCancel: () => void;
  clientes: Cliente[];
}

const MovimientoForm: React.FC<MovimientoFormProps> = ({
  movimientoInicial,
  onGuardar,
  onCancel,
  clientes
}) => {
  // Estados para cada campo del formulario
  const [fecha, setFecha] = useState(moment().format('YYYY-MM-DD'));
  const [tipo, setTipo] = useState<TipoMovimiento>('ingreso');
  const [categoria, setCategoria] = useState<CategoriaMovimiento>('honorarios');
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [expedienteId, setExpedienteId] = useState<string>('');
  const [clienteId, setClienteId] = useState<string>('');
  const [estado, setEstado] = useState<EstadoMovimiento>('completado');
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo');
  const [comprobante, setComprobante] = useState('');
  const [notas, setNotas] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Si estamos editando, cargar los datos iniciales
  useEffect(() => {
    if (movimientoInicial) {
      setFecha(moment(movimientoInicial.fecha).format('YYYY-MM-DD'));
      setTipo(movimientoInicial.tipo);
      setCategoria(movimientoInicial.categoria);
      setDescripcion(movimientoInicial.descripcion);
      setMonto(movimientoInicial.monto.toString());
      setExpedienteId(movimientoInicial.expedienteId?.toString() || '');
      setClienteId(movimientoInicial.clienteId?.toString() || '');
      setEstado(movimientoInicial.estado);
      setMetodoPago(movimientoInicial.metodoPago);
      setComprobante(movimientoInicial.comprobante || '');
      setNotas(movimientoInicial.notas || '');
    }
  }, [movimientoInicial]);

  // Categorías disponibles según el tipo de movimiento
  const getCategoriasPorTipo = (tipo: TipoMovimiento): CategoriaMovimiento[] => {
    if (tipo === 'ingreso') {
      return ['honorarios', 'consultas', 'abonos', 'juicios_ganados', 'otros_ingresos'];
    } else {
      return ['salarios', 'alquiler', 'servicios', 'impuestos', 'gastos_judiciales', 'papeleria', 'software', 'otros_gastos'];
    }
  };

  // Al cambiar el tipo, actualizar la categoría si es necesario
  useEffect(() => {
    const categoriasPorTipo = getCategoriasPorTipo(tipo);
    if (!categoriasPorTipo.includes(categoria)) {
      setCategoria(categoriasPorTipo[0]);
    }
  }, [tipo, categoria]);

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar datos antes de enviar
    if (!validarDatos()) {
      return;
    }

    try {
      setEnviando(true);

      // Preparar datos del movimiento
      const datos = {
        fecha: new Date(fecha),
        tipo,
        categoria,
        descripcion,
        monto: parseFloat(monto),
        expedienteId: expedienteId ? parseInt(expedienteId) : undefined,
        clienteId: clienteId ? parseInt(clienteId) : undefined,
        estado,
        metodoPago,
        comprobante,
        notas
      };

      // Llamar a la función onGuardar pasada como prop
      await onGuardar(datos);

      // Resetear el formulario
      resetearFormulario();
    } catch (error) {
      console.error('Error al guardar movimiento:', error);
      setError('Ocurrió un error al guardar el movimiento');
    } finally {
      setEnviando(false);
    }
  };

  // Traducir categorías a nombres más amigables
  const traducirCategoria = (categoria: CategoriaMovimiento): string => {
    const traducciones: Record<CategoriaMovimiento, string> = {
      honorarios: 'Honorarios',
      consultas: 'Consultas',
      abonos: 'Abonos mensuales',
      juicios_ganados: 'Juicios ganados',
      otros_ingresos: 'Otros ingresos',
      salarios: 'Salarios y honorarios',
      alquiler: 'Alquiler',
      servicios: 'Servicios',
      impuestos: 'Impuestos',
      gastos_judiciales: 'Gastos judiciales',
      papeleria: 'Papelería y útiles',
      software: 'Software y tecnología',
      otros_gastos: 'Otros gastos'
    };

    return traducciones[categoria];
  };

  const resetearFormulario = () => {
    setFecha(moment().format('YYYY-MM-DD'));
    setTipo('ingreso');
    setCategoria('honorarios');
    setDescripcion('');
    setMonto('');
    setExpedienteId('');
    setClienteId('');
    setEstado('completado');
    setMetodoPago('efectivo');
    setComprobante('');
    setNotas('');
  };

  const validarDatos = () => {
    // Implementa la lógica para validar los datos del formulario
    return true; // Cambia esto por la lógica de validación adecuada
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="fecha">Fecha*</label>
          <input
            id="fecha"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="tipo">Tipo*</label>
          <select
            id="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoMovimiento)}
            required
            className="form-control"
          >
            <option value="ingreso">Ingreso</option>
            <option value="egreso">Egreso</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="categoria">Categoría*</label>
          <select
            id="categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as CategoriaMovimiento)}
            required
            className="form-control"
          >
            {getCategoriasPorTipo(tipo).map((cat) => (
              <option key={cat} value={cat}>
                {traducirCategoria(cat)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="monto">Monto*</label>
          <input
            id="monto"
            type="number"
            step="0.01"
            min="0"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            required
            className="form-control"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="descripcion">Descripción*</label>
        <input
          id="descripcion"
          type="text"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
          className="form-control"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="estado">Estado*</label>
          <select
            id="estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value as EstadoMovimiento)}
            required
            className="form-control"
          >
            <option value="pendiente">Pendiente</option>
            <option value="completado">Completado</option>
            <option value="anulado">Anulado</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="metodoPago">Método de pago*</label>
          <select
            id="metodoPago"
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
            required
            className="form-control"
          >
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia bancaria</option>
            <option value="cheque">Cheque</option>
            <option value="tarjeta">Tarjeta de crédito/débito</option>
            <option value="otro">Otro</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="clienteId">Cliente</label>
          <select
            id="clienteId"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className="form-control"
          >
            <option value="">-- Seleccionar cliente --</option>
            {clientes.map(cliente => (
              <option key={cliente.id} value={cliente.id.toString()}>
                {cliente.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="expedienteId">Expediente ID</label>
          <input
            id="expedienteId"
            type="number"
            value={expedienteId}
            onChange={(e) => setExpedienteId(e.target.value)}
            className="form-control"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="comprobante">Número de comprobante</label>
        <input
          id="comprobante"
          type="text"
          value={comprobante}
          onChange={(e) => setComprobante(e.target.value)}
          className="form-control"
        />
      </div>

      <div className="form-group">
        <label htmlFor="notas">Notas</label>
        <textarea
          id="notas"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          className="form-control"
          rows={3}
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancelar" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn-guardar" disabled={enviando}>
          {movimientoInicial ? 'Actualizar' : 'Guardar'}
        </button>
      </div>
    </form>
  );
};

export default MovimientoForm;
