import React, { useState, useEffect } from 'react';
import { useFacturaStore, Factura, DetalleFactura, EstadoFactura } from '../../stores/facturaStore';
import { Cliente } from '../../stores/tesoreriaStore';
import moment from 'moment';

interface FacturaFormProps {
  facturaInicial: Factura | null;
  onClose: () => void;
  clientes: Cliente[];
}

const FacturaForm: React.FC<FacturaFormProps> = ({
  facturaInicial,
  onClose,
  clientes
}) => {
  // Estados para los campos del formulario
  const [numero, setNumero] = useState<string>('');
  const [fecha, setFecha] = useState<string>(moment().format('YYYY-MM-DD'));
  const [fechaVencimiento, setFechaVencimiento] = useState<string>(moment().add(30, 'days').format('YYYY-MM-DD'));
  const [clienteId, setClienteId] = useState<string>('');
  const [detalles, setDetalles] = useState<(DetalleFactura | Omit<DetalleFactura, 'id'>)[]>([]);
  const [observaciones, setObservaciones] = useState<string>('');
  const [estado, setEstado] = useState<EstadoFactura>('borrador');
  const [expedienteId, setExpedienteId] = useState<string>('');

  // Acciones del store
  const { addFactura, updateFactura, loading, error } = useFacturaStore();

  // Inicializar formulario con datos existentes si estamos editando
  useEffect(() => {
    if (facturaInicial) {
      setNumero(facturaInicial.numero);
      setFecha(moment(facturaInicial.fecha).format('YYYY-MM-DD'));
      setFechaVencimiento(moment(facturaInicial.fechaVencimiento).format('YYYY-MM-DD'));
      setClienteId(facturaInicial.clienteId.toString());
      setDetalles([...facturaInicial.detalles]);
      setObservaciones(facturaInicial.observaciones || '');
      setEstado(facturaInicial.estado);
      setExpedienteId(facturaInicial.expedienteId?.toString() || '');
    } else {
      // Inicializar con un detalle vacío para nueva factura
      setDetalles([{
        descripcion: '',
        cantidad: 1,
        precioUnitario: 0,
        impuesto: 21,
        subtotal: 0
      }]);
    }
  }, [facturaInicial]);

  // Calcular subtotal de un detalle
  const calcularSubtotal = (detalle: DetalleFactura | Omit<DetalleFactura, 'id'>): number => {
    return detalle.cantidad * detalle.precioUnitario;
  };

  // Calcular totales de la factura
  const calcularTotales = (): { subtotal: number, impuestos: number, total: number } => {
    const subtotal = detalles.reduce((sum, d) => sum + calcularSubtotal(d), 0);
    const impuestos = detalles.reduce((sum, d) => {
      const subtotalDetalle = calcularSubtotal(d);
      return sum + (subtotalDetalle * d.impuesto / 100);
    }, 0);

    return {
      subtotal,
      impuestos,
      total: subtotal + impuestos
    };
  };

  // Actualizar un detalle
  const handleDetalleChange = (index: number, field: keyof Omit<DetalleFactura, 'id' | 'subtotal'>, value: any) => {
    const nuevosDetalles = [...detalles];
    // @ts-ignore
    nuevosDetalles[index][field] = field === 'cantidad' || field === 'precioUnitario' || field === 'impuesto'
      ? parseFloat(value) || 0
      : value;

    // Recalcular subtotal
    nuevosDetalles[index].subtotal = calcularSubtotal(nuevosDetalles[index]);

    setDetalles(nuevosDetalles);
  };

  // Añadir un nuevo detalle
  const handleAgregarDetalle = () => {
    setDetalles([
      ...detalles,
      {
        descripcion: '',
        cantidad: 1,
        precioUnitario: 0,
        impuesto: 21,
        subtotal: 0
      }
    ]);
  };

  // Eliminar un detalle
  const handleEliminarDetalle = (index: number) => {
    if (detalles.length === 1) {
      // Siempre debe haber al menos un detalle
      return;
    }

    const nuevosDetalles = [...detalles];
    nuevosDetalles.splice(index, 1);
    setDetalles(nuevosDetalles);
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!clienteId) {
      alert('Debe seleccionar un cliente');
      return;
    }

    if (detalles.some(d => !d.descripcion || d.cantidad <= 0 || d.precioUnitario <= 0)) {
      alert('Todos los detalles deben tener descripción y valores válidos');
      return;
    }

    const { subtotal, impuestos, total } = calcularTotales();

    try {
      if (facturaInicial) {
        // Actualizar factura existente
        await updateFactura(facturaInicial.id, {
          numero,
          fecha: moment(fecha).toDate(),
          fechaVencimiento: moment(fechaVencimiento).toDate(),
          clienteId: parseInt(clienteId),
          detalles: detalles.map((d, index) => ({
            ...d,
            id: 'id' in d ? d.id : index + 1
          })) as DetalleFactura[],
          observaciones: observaciones || undefined,
          subtotal,
          impuestos,
          total,
          estado,
          expedienteId: expedienteId ? parseInt(expedienteId) : undefined
        });
      } else {
        // Crear nueva factura
        await addFactura({
          numero,
          fecha: moment(fecha).toDate(),
          fechaVencimiento: moment(fechaVencimiento).toDate(),
          clienteId: parseInt(clienteId),
          detalles: detalles.map((d, index) => ({
            ...d,
            id: index + 1
          })) as DetalleFactura[],
          observaciones: observaciones || undefined,
          subtotal,
          impuestos,
          total,
          estado,
          expedienteId: expedienteId ? parseInt(expedienteId) : undefined,
          creadoPor: 'Usuario Actual' // En producción, obtendríamos del contexto de autenticación
        });
      }

      onClose();
    } catch (error) {
      console.error('Error al guardar la factura', error);
    }
  };

  // Formatear cantidades monetarias
  const formatoCifra = (valor: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(valor);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container factura-form-modal">
        <div className="modal-header">
          <h2 className="modal-title">
            {facturaInicial ? 'Editar Factura' : 'Nueva Factura'}
          </h2>
          <button className="modal-close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="numero">Número de Factura*</label>
                <input
                  id="numero"
                  type="text"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  required
                  className="form-control"
                  placeholder="Ej: F-2023-001"
                />
              </div>

              <div className="form-group">
                <label htmlFor="clienteId">Cliente*</label>
                <select
                  id="clienteId"
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  required
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
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fecha">Fecha de Emisión*</label>
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
                <label htmlFor="fechaVencimiento">Fecha de Vencimiento*</label>
                <input
                  id="fechaVencimiento"
                  type="date"
                  value={fechaVencimiento}
                  onChange={(e) => setFechaVencimiento(e.target.value)}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="estado">Estado*</label>
                <select
                  id="estado"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as EstadoFactura)}
                  required
                  className="form-control"
                >
                  <option value="borrador">Borrador</option>
                  <option value="emitida">Emitida</option>
                  <option value="pagada">Pagada</option>
                  <option value="vencida">Vencida</option>
                  <option value="anulada">Anulada</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="expedienteId">ID de Expediente (opcional)</label>
              <input
                id="expedienteId"
                type="number"
                value={expedienteId}
                onChange={(e) => setExpedienteId(e.target.value)}
                className="form-control"
                placeholder="Si está relacionada con un expediente"
              />
            </div>

            <div className="detalles-factura">
              <h3>Detalles de la Factura</h3>

              <div className="tabla-detalles">
                <table>
                  <thead>
                    <tr>
                      <th>Descripción</th>
                      <th>Cantidad</th>
                      <th>Precio Unitario</th>
                      <th>Impuesto (%)</th>
                      <th>Subtotal</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalles.map((detalle, index) => (
                      <tr key={index}>
                        <td>
                          <input
                            type="text"
                            value={detalle.descripcion}
                            onChange={(e) => handleDetalleChange(index, 'descripcion', e.target.value)}
                            required
                            className="form-control"
                            placeholder="Descripción del servicio/producto"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={detalle.cantidad}
                            onChange={(e) => handleDetalleChange(index, 'cantidad', e.target.value)}
                            required
                            className="form-control"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={detalle.precioUnitario}
                            onChange={(e) => handleDetalleChange(index, 'precioUnitario', e.target.value)}
                            required
                            className="form-control"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={detalle.impuesto}
                            onChange={(e) => handleDetalleChange(index, 'impuesto', e.target.value)}
                            required
                            className="form-control"
                          />
                        </td>
                        <td className="subtotal-cell">
                          {formatoCifra(detalle.subtotal)}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-eliminar-detalle"
                            onClick={() => handleEliminarDetalle(index)}
                            disabled={detalles.length === 1}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                className="btn-agregar-detalle"
                onClick={handleAgregarDetalle}
              >
                + Agregar Ítem
              </button>
            </div>

            <div className="form-group">
              <label htmlFor="observaciones">Observaciones</label>
              <textarea
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="form-control"
                rows={3}
                placeholder="Observaciones o notas adicionales"
              ></textarea>
            </div>

            <div className="totales-factura">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>{formatoCifra(calcularTotales().subtotal)}</span>
              </div>
              <div className="total-row">
                <span>Impuestos:</span>
                <span>{formatoCifra(calcularTotales().impuestos)}</span>
              </div>
              <div className="total-row total-final">
                <span>Total:</span>
                <span>{formatoCifra(calcularTotales().total)}</span>
              </div>
            </div>

            {error && (
              <div className="error-container">
                <p>{error}</p>
              </div>
            )}

            <div className="modal-footer">
              <button
                type="button"
                className="modal-cancel-button"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="modal-confirm-button"
                disabled={loading}
              >
                {loading ? 'Guardando...' : facturaInicial ? 'Actualizar Factura' : 'Crear Factura'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FacturaForm;
