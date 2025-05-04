import React, { useState, useEffect } from 'react';
import { useTesoreriaStore, Movimiento } from '../../stores/tesoreriaStore';
import { useFacturaStore } from '../../stores/facturaStore';
import moment from 'moment';

interface GenerarDesdeMovimientoModalProps {
  movimiento?: Movimiento;
  onClose: () => void;
  onSuccess?: () => void;
}

const GenerarDesdeMovimientoModal: React.FC<GenerarDesdeMovimientoModalProps> = ({
  movimiento,
  onClose,
  onSuccess
}) => {
  const [movimientosFiltrados, setMovimientosFiltrados] = useState<Movimiento[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [generandoFactura, setGenerandoFactura] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>('');

  // Obtener datos de tesorería
  const { movimientos, clientes, fetchMovimientos, fetchClientes } = useTesoreriaStore();

  // Obtener funciones de facturación
  const {
    facturas,
    generarFacturaDesdeMovimiento,
    convertirMovimientosAFactura
  } = useFacturaStore();

  // Cargar datos iniciales
  useEffect(() => {
    fetchMovimientos();
    fetchClientes();

    // Si hay un movimiento preseleccionado, seleccionarlo
    if (movimiento) {
      setSeleccionados([movimiento.id]);
      if (movimiento.clienteId) {
        setClienteSeleccionado(movimiento.clienteId.toString());
      }
    }
  }, [fetchMovimientos, fetchClientes, movimiento]);

  // Filtrar movimientos que no tienen factura y son de tipo ingreso
  useEffect(() => {
    // Obtener IDs de movimientos que ya tienen factura asociada
    const movimientosConFactura = facturas
      .filter(f => f.movimientoId !== undefined)
      .map(f => f.movimientoId as number);

    // Filtrar por tipo ingreso y que no tengan factura asociada
    const movimientosDisponibles = movimientos.filter(m =>
      m.tipo === 'ingreso' &&
      !movimientosConFactura.includes(m.id)
    );

    // Aplicar filtro de búsqueda
    const movimientosFiltrados = movimientosDisponibles.filter(m => {
      const coincideBusqueda = busqueda === '' ||
        m.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
        (m.clienteId && getNombreCliente(m.clienteId).toLowerCase().includes(busqueda.toLowerCase()));

      const coincideCliente = clienteSeleccionado === '' ||
        (m.clienteId?.toString() === clienteSeleccionado);

      return coincideBusqueda && coincideCliente;
    });

    setMovimientosFiltrados(movimientosFiltrados);
  }, [movimientos, facturas, busqueda, clienteSeleccionado]);

  // Obtener el nombre del cliente
  const getNombreCliente = (clienteId: number): string => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente ? cliente.nombre : 'Cliente no encontrado';
  };

  // Formatear cifras a formato de moneda
  const formatoCifra = (valor: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(valor);
  };

  // Manejar selección de un movimiento
  const toggleSeleccion = (id: number) => {
    if (seleccionados.includes(id)) {
      setSeleccionados(seleccionados.filter(s => s !== id));
    } else {
      // Verificar que el cliente sea el mismo para todos los seleccionados
      if (seleccionados.length > 0) {
        const primerMovimiento = movimientos.find(m => m.id === seleccionados[0]);
        const movimientoActual = movimientos.find(m => m.id === id);

        if (primerMovimiento && movimientoActual &&
            primerMovimiento.clienteId !== movimientoActual.clienteId) {
          alert('Solo puedes seleccionar movimientos del mismo cliente para generar una factura conjunta');
          return;
        }
      }

      setSeleccionados([...seleccionados, id]);
    }
  };

  // Seleccionar o deseleccionar todos los movimientos filtrados
  const toggleSeleccionarTodos = () => {
    if (seleccionados.length === movimientosFiltrados.length) {
      setSeleccionados([]);
    } else {
      // Verificar que todos sean del mismo cliente
      const clientesUnicos = new Set(movimientosFiltrados.map(m => m.clienteId));
      if (clientesUnicos.size > 1) {
        alert('No puedes seleccionar todos los movimientos porque pertenecen a distintos clientes. Filtra por cliente primero.');
        return;
      }

      setSeleccionados(movimientosFiltrados.map(m => m.id));
    }
  };

  // Generar una factura a partir de un solo movimiento
  const handleGenerarFactura = async (movimientoId: number) => {
    setError(null);
    setGenerandoFactura(true);

    try {
      const resultado = await generarFacturaDesdeMovimiento(movimientoId);
      if (resultado) {
        if (onSuccess) {
          onSuccess();
        } else {
          onClose();
        }
      }
    } catch (err) {
      setError('Error al generar la factura');
      console.error(err);
    } finally {
      setGenerandoFactura(false);
    }
  };

  // Generar una factura a partir de múltiples movimientos
  const handleGenerarFacturaMultiple = async () => {
    if (seleccionados.length === 0) {
      alert('Debes seleccionar al menos un movimiento');
      return;
    }

    setError(null);
    setGenerandoFactura(true);

    try {
      const resultado = await convertirMovimientosAFactura(seleccionados);
      if (resultado) {
        if (onSuccess) {
          onSuccess();
        } else {
          onClose();
        }
      }
    } catch (err) {
      let mensaje = 'Error al generar la factura';
      if (err instanceof Error) {
        mensaje = err.message;
      }
      setError(mensaje);
      console.error(err);
    } finally {
      setGenerandoFactura(false);
    }
  };

  // Si hay un movimiento preseleccionado y no hay otros seleccionados,
  // mostrar un mensaje y ofrecer generar directamente la factura
  const mostrarGeneracionDirecta = movimiento && seleccionados.length === 1 && seleccionados[0] === movimiento.id;

  return (
    <div className="modal-overlay">
      <div className="modal-container generar-factura-modal">
        <div className="modal-header">
          <h2 className="modal-title">Generar Factura desde Movimientos</h2>
          <button className="modal-close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          {mostrarGeneracionDirecta && (
            <div className="movimiento-preseleccionado">
              <h3>Movimiento seleccionado</h3>
              <div className="movimiento-detalle">
                <p><strong>Fecha:</strong> {moment(movimiento.fecha).format('DD/MM/YYYY')}</p>
                <p><strong>Descripción:</strong> {movimiento.descripcion}</p>
                <p><strong>Cliente:</strong> {movimiento.clienteId ? getNombreCliente(movimiento.clienteId) : '—'}</p>
                <p><strong>Monto:</strong> {formatoCifra(movimiento.monto)}</p>
              </div>
              <div className="accion-directa">
                <button
                  className="btn btn-primary"
                  onClick={() => handleGenerarFactura(movimiento.id)}
                  disabled={generandoFactura}
                >
                  {generandoFactura ? 'Generando...' : 'Generar factura para este movimiento'}
                </button>
              </div>
              <div className="separador">
                <span>o selecciona otros movimientos</span>
              </div>
            </div>
          )}

          <div className="filtros-movimientos">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="clienteFilter">Filtrar por Cliente</label>
                <select
                  id="clienteFilter"
                  value={clienteSeleccionado}
                  onChange={(e) => setClienteSeleccionado(e.target.value)}
                  className="form-control"
                >
                  <option value="">Todos los clientes</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id.toString()}>
                      {cliente.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group busqueda-grupo">
                <label htmlFor="busqueda">Búsqueda</label>
                <input
                  id="busqueda"
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar en descripción o cliente..."
                  className="form-control"
                />
              </div>
            </div>
          </div>

          <div className="movimientos-lista">
            <h3>Movimientos Disponibles</h3>

            {movimientosFiltrados.length === 0 ? (
              <div className="empty-state">
                <p>No hay movimientos disponibles para facturar.</p>
                <p>Todos los movimientos de ingreso ya tienen facturas asociadas o no existen movimientos que coincidan con el filtro.</p>
              </div>
            ) : (
              <div className="tabla-responsive">
                <table className="tabla-movimientos">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={seleccionados.length === movimientosFiltrados.length && movimientosFiltrados.length > 0}
                          onChange={toggleSeleccionarTodos}
                        />
                      </th>
                      <th>ID</th>
                      <th>Fecha</th>
                      <th>Descripción</th>
                      <th>Cliente</th>
                      <th>Monto</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientosFiltrados.map((movimiento) => (
                      <tr key={movimiento.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={seleccionados.includes(movimiento.id)}
                            onChange={() => toggleSeleccion(movimiento.id)}
                          />
                        </td>
                        <td>{movimiento.id}</td>
                        <td>{moment(movimiento.fecha).format('DD/MM/YYYY')}</td>
                        <td>{movimiento.descripcion}</td>
                        <td>{movimiento.clienteId ? getNombreCliente(movimiento.clienteId) : '—'}</td>
                        <td className="monto">{formatoCifra(movimiento.monto)}</td>
                        <td>
                          <span className={`estado-${movimiento.estado}`}>
                            {movimiento.estado === 'completado' ? 'Completado' :
                            movimiento.estado === 'pendiente' ? 'Pendiente' : 'Anulado'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-accion"
                            onClick={() => handleGenerarFactura(movimiento.id)}
                            disabled={generandoFactura}
                          >
                            Generar factura
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {seleccionados.length > 0 && (
            <div className="movimientos-seleccionados">
              <h3>Movimientos seleccionados: {seleccionados.length}</h3>
              <button
                className="btn btn-primary"
                onClick={handleGenerarFacturaMultiple}
                disabled={generandoFactura}
              >
                {generandoFactura ? 'Generando...' : 'Generar Factura para los Seleccionados'}
              </button>
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerarDesdeMovimientoModal;
