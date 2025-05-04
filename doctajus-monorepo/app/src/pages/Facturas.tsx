import React, { useEffect, useState } from 'react';
import { useFacturaStore, Factura, EstadoFactura } from '../stores/facturaStore';
import { useTesoreriaStore } from '../stores/tesoreriaStore';
import { Link } from 'react-router-dom';
import moment from 'moment';

// Componentes (se crearán después)
import FacturaForm from '../components/facturacion/FacturaForm';
import FacturaDetalleModal from '../components/facturacion/FacturaDetalleModal';
import GenerarDesdeMovimientoModal from '../components/facturacion/GenerarDesdeMovimientoModal';

// Nuevos componentes para gestión avanzada de cobros
import PlanPagoModal from '../components/facturacion/PlanPagoModal';
import RecordatoriosPagoModal from '../components/facturacion/RecordatoriosPagoModal';

// Nuevo componente para Planes de Pago (se implementará después)
// import PlanPagoModal from '../components/facturacion/PlanPagoModal';
// import RecordatoriosPagoModal from '../components/facturacion/RecordatoriosPagoModal';

const Facturas: React.FC = () => {
  const [showFacturaForm, setShowFacturaForm] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [showGenerarModal, setShowGenerarModal] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<EstadoFactura | 'todas'>('todas');
  const [busqueda, setBusqueda] = useState('');
  const [seleccionadas, setSeleccionadas] = useState<number[]>([]);

  // Nuevos estados para gestión avanzada de cobros
  const [showPlanPagoModal, setShowPlanPagoModal] = useState(false);
  const [showRecordatoriosModal, setShowRecordatoriosModal] = useState(false);

  // Estados de Factura
  const {
    facturas,
    facturaSeleccionada,
    loading,
    error,
    fetchFacturas,
    setFacturaSeleccionada,
    deleteFactura,
    cambiarEstadoFactura,
    // Nuevos métodos para gestión avanzada de cobros
    enviarRecordatorioPago,
    getFacturasVencidas,
    getFacturasProximasAVencer,
    crearPlanPago,
    actualizarDiasMora
  } = useFacturaStore();

  // Estados de Tesorería (para acceder a clientes y movimientos)
  const {
    clientes,
    fetchClientes
  } = useTesoreriaStore();

  // Cargar datos iniciales
  useEffect(() => {
    fetchFacturas();
    fetchClientes();
    actualizarDiasMora(); // Actualizar días de mora para facturas vencidas
  }, [fetchFacturas, fetchClientes, actualizarDiasMora]);

  // Verificar si hay una factura seleccionada por URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const facturaId = params.get('id');

    if (facturaId) {
      const id = parseInt(facturaId);
      if (!isNaN(id)) {
        const factura = facturas.find(f => f.id === id);
        if (factura) {
          setFacturaSeleccionada(factura);
          setShowDetalleModal(true);
        }
      }
    }
  }, [facturas, setFacturaSeleccionada]);

  // Filtrar facturas
  const facturasFiltradas = facturas.filter(factura => {
    const coincideEstado = filtroEstado === 'todas' || factura.estado === filtroEstado;
    const coincideBusqueda = busqueda === '' ||
      factura.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
      factura.observaciones?.toLowerCase().includes(busqueda.toLowerCase()) ||
      getNombreCliente(factura.clienteId).toLowerCase().includes(busqueda.toLowerCase());

    return coincideEstado && coincideBusqueda;
  });

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

  // Obtener clase CSS según el estado de la factura
  const getClaseEstado = (estado: EstadoFactura): string => {
    switch (estado) {
      case 'borrador': return 'estado-borrador';
      case 'emitida': return 'estado-emitida';
      case 'pagada': return 'estado-pagada';
      case 'vencida': return 'estado-vencida';
      case 'anulada': return 'estado-anulada';
      default: return '';
    }
  };

  // Traducir estados a nombres amigables
  const traducirEstado = (estado: EstadoFactura): string => {
    switch (estado) {
      case 'borrador': return 'Borrador';
      case 'emitida': return 'Emitida';
      case 'pagada': return 'Pagada';
      case 'vencida': return 'Vencida';
      case 'anulada': return 'Anulada';
      default: return estado;
    }
  };

  // Manejar la visualización del detalle de factura
  const handleVerDetalle = (factura: Factura) => {
    setFacturaSeleccionada(factura);
    setShowDetalleModal(true);
  };

  // Manejar la eliminación de una factura
  const handleEliminarFactura = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta factura? Esta acción no se puede deshacer.')) {
      await deleteFactura(id);
    }
  };

  // Manejar cambio de estado de factura
  const handleCambiarEstado = async (id: number, nuevoEstado: EstadoFactura) => {
    await cambiarEstadoFactura(id, nuevoEstado);
  };

  // Manejar selección de facturas
  const toggleSeleccion = (id: number) => {
    if (seleccionadas.includes(id)) {
      setSeleccionadas(seleccionadas.filter(s => s !== id));
    } else {
      setSeleccionadas([...seleccionadas, id]);
    }
  };

  // Seleccionar o deseleccionar todas
  const toggleSeleccionarTodas = () => {
    if (seleccionadas.length === facturasFiltradas.length) {
      setSeleccionadas([]);
    } else {
      setSeleccionadas(facturasFiltradas.map(f => f.id));
    }
  };

  // Manejar la creación de una nueva factura
  const handleNuevaFactura = () => {
    setFacturaSeleccionada(null);
    setShowFacturaForm(true);
  };

  // Manejar la generación de facturas desde movimientos
  const handleGenerarDesdeMovimiento = () => {
    setShowGenerarModal(true);
  };

  // Comprobar si la factura está vencida
  const estaVencida = (factura: Factura): boolean => {
    return (
      factura.estado === 'emitida' &&
      moment(factura.fechaVencimiento).isBefore(moment())
    );
  };

  // Detectar facturas vencidas
  useEffect(() => {
    const facturasParaActualizar = facturas.filter(f =>
      f.estado === 'emitida' && moment(f.fechaVencimiento).isBefore(moment())
    );

    facturasParaActualizar.forEach(factura => {
      cambiarEstadoFactura(factura.id, 'vencida');
    });
  }, [facturas, cambiarEstadoFactura]);

  // Programar verificación diaria de días de mora
  useEffect(() => {
    // Actualizar al cargar
    actualizarDiasMora();

    // Programar actualización diaria
    const interval = setInterval(() => {
      actualizarDiasMora();
    }, 86400000); // 24 horas

    return () => clearInterval(interval);
  }, [actualizarDiasMora]);

  // Mostrar indicador de carga
  if (loading && facturas.length === 0) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
        <p>Cargando facturas...</p>
      </div>
    );
  }

  return (
    <div className="facturas-page">
      <div className="page-header">
        <h1>Facturación</h1>
        <div className="page-actions">
          <button
            className="btn-secondary"
            onClick={handleGenerarDesdeMovimiento}
          >
            Generar desde Movimiento
          </button>
          <button
            className="btn-primary"
            onClick={handleNuevaFactura}
          >
            Nueva Factura
          </button>
        </div>
      </div>

      {/* Alertas de vencimiento - Nueva sección */}
      {getFacturasProximasAVencer().length > 0 && (
        <div className="alertas-container">
          <div className="alerta-vencimiento">
            <h3>⚠️ Facturas próximas a vencer</h3>
            <p>Tienes {getFacturasProximasAVencer().length} facturas que vencerán en los próximos 7 días.</p>
            <button
              className="btn-alerta"
              onClick={() => {
                setFiltroEstado('emitida');
                // Implementar una lógica para mostrar solo las próximas a vencer
              }}
            >
              Ver facturas
            </button>
            <button
              className="btn-alerta"
              onClick={() => setShowRecordatoriosModal(true)}
            >
              Enviar recordatorios
            </button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="filtros-container">
        <div className="filtros-header">
          <h3>Filtros</h3>
          <button
            className="btn-reset-filtros"
            onClick={() => {
              setFiltroEstado('todas');
              setBusqueda('');
            }}
          >
            Limpiar filtros
          </button>
        </div>

        <div className="filtros-row">
          <div className="filtro-grupo">
            <label htmlFor="filtroEstado">Estado</label>
            <select
              id="filtroEstado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as EstadoFactura | 'todas')}
              className="filtro-control"
            >
              <option value="todas">Todas</option>
              <option value="borrador">Borradores</option>
              <option value="emitida">Emitidas</option>
              <option value="pagada">Pagadas</option>
              <option value="vencida">Vencidas</option>
              <option value="anulada">Anuladas</option>
            </select>
          </div>

          <div className="filtro-grupo busqueda-grupo">
            <label htmlFor="busqueda">Búsqueda</label>
            <input
              id="busqueda"
              type="text"
              placeholder="Buscar por número, cliente o descripción..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="filtro-control"
            />
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="facturas-resumen">
        <div className="resumen-card">
          <h3>Total Facturas</h3>
          <div className="resumen-valor">{facturas.length}</div>
        </div>
        <div className="resumen-card">
          <h3>Por Cobrar</h3>
          <div className="resumen-valor">
            {formatoCifra(
              facturas
                .filter(f => f.estado === 'emitida' || f.estado === 'vencida')
                .reduce((sum, f) => sum + f.total, 0)
            )}
          </div>
        </div>
        <div className="resumen-card">
          <h3>Vencidas</h3>
          <div className="resumen-valor resumen-alerta">
            {facturas.filter(f => f.estado === 'vencida').length}
          </div>
        </div>
        <div className="resumen-card">
          <h3>Cobrado (Mes Actual)</h3>
          <div className="resumen-valor resumen-exito">
            {formatoCifra(
              facturas
                .filter(f =>
                  f.estado === 'pagada' &&
                  moment(f.actualizadoEn || f.creadoEn).isAfter(moment().startOf('month'))
                )
                .reduce((sum, f) => sum + f.total, 0)
            )}
          </div>
        </div>
      </div>

      {/* Tabla de Facturas */}
      <div className="tabla-facturas-container">
        {facturasFiltradas.length === 0 ? (
          <div className="empty-state">
            <p>No hay facturas que coincidan con los filtros aplicados.</p>
            <p>Crea una nueva factura o ajusta los filtros para ver resultados.</p>
          </div>
        ) : (
          <div className="tabla-responsive">
            <table className="tabla-facturas">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={seleccionadas.length === facturasFiltradas.length && facturasFiltradas.length > 0}
                      onChange={toggleSeleccionarTodas}
                    />
                  </th>
                  <th>Número</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Vencimiento</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {facturasFiltradas.map((factura) => (
                  <tr
                    key={factura.id}
                    className={`${getClaseEstado(factura.estado)} ${estaVencida(factura) ? 'factura-vencida' : ''}`}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={seleccionadas.includes(factura.id)}
                        onChange={() => toggleSeleccion(factura.id)}
                      />
                    </td>
                    <td>{factura.numero}</td>
                    <td>{moment(factura.fecha).format('DD/MM/YYYY')}</td>
                    <td>{getNombreCliente(factura.clienteId)}</td>
                    <td className="monto">{formatoCifra(factura.total)}</td>
                    <td>
                      <span className={`estado ${getClaseEstado(factura.estado)}`}>
                        {traducirEstado(factura.estado)}
                      </span>
                      {factura.planPagoId && (
                        <span className="badge-plan-pago" title="Tiene plan de pago">
                          📝
                        </span>
                      )}
                    </td>
                    <td>
                      {moment(factura.fechaVencimiento).format('DD/MM/YYYY')}
                      {factura.estado === 'vencida' && factura.diasMora && (
                        <span className="dias-mora" title="Días de mora">
                          {factura.diasMora} días
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="acciones-container">
                        <button
                          className="btn-accion btn-ver"
                          onClick={() => handleVerDetalle(factura)}
                        >
                          Ver
                        </button>

                        {factura.estado === 'borrador' && (
                          <button
                            className="btn-accion btn-emitir"
                            onClick={() => handleCambiarEstado(factura.id, 'emitida')}
                          >
                            Emitir
                          </button>
                        )}

                        {(factura.estado === 'emitida' || factura.estado === 'vencida') && (
                          <>
                            <button
                              className="btn-accion btn-pagar"
                              onClick={() => handleCambiarEstado(factura.id, 'pagada')}
                            >
                              Pagar
                            </button>

                            {!factura.planPagoId && (
                              <button
                                className="btn-accion btn-plan"
                                onClick={() => {
                                  setFacturaSeleccionada(factura);
                                  setShowPlanPagoModal(true);
                                }}
                              >
                                Plan de Pago
                              </button>
                            )}

                            <button
                              className="btn-accion btn-recordatorio"
                              onClick={() => {
                                setFacturaSeleccionada(factura);
                                setSeleccionadas([factura.id]);
                                setShowRecordatoriosModal(true);
                              }}
                            >
                              Recordar
                            </button>
                          </>
                        )}

                        {factura.estado !== 'anulada' && (
                          <button
                            className="btn-accion btn-anular"
                            onClick={() => handleCambiarEstado(factura.id, 'anulada')}
                          >
                            Anular
                          </button>
                        )}

                        <button
                          className="btn-accion btn-eliminar"
                          onClick={() => handleEliminarFactura(factura.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Acciones para facturas seleccionadas - Nuevo */}
      {seleccionadas.length > 0 && (
        <div className="acciones-lote">
          <h3>Acciones para {seleccionadas.length} facturas seleccionadas:</h3>
          <div className="acciones-botones">
            <button
              className="btn-accion-lote"
              onClick={() => setShowRecordatoriosModal(true)}
            >
              Enviar recordatorios
            </button>
            {seleccionadas.length === 1 && (
              <button
                className="btn-accion-lote"
                onClick={() => {
                  const facturaId = seleccionadas[0];
                  const factura = facturas.find(f => f.id === facturaId);
                  if (factura && (factura.estado === 'vencida' || factura.estado === 'emitida')) {
                    setFacturaSeleccionada(factura);
                    setShowPlanPagoModal(true);
                  } else {
                    alert('Solo se pueden crear planes de pago para facturas emitidas o vencidas');
                  }
                }}
              >
                Crear plan de pago
              </button>
            )}
          </div>
        </div>
      )}

      {/* Formulario Modal */}
      {showFacturaForm && (
        <FacturaForm
          facturaInicial={facturaSeleccionada}
          onClose={() => setShowFacturaForm(false)}
          clientes={clientes}
        />
      )}

      {/* Modal de Detalle */}
      {showDetalleModal && facturaSeleccionada && (
        <FacturaDetalleModal
          factura={facturaSeleccionada}
          onClose={() => setShowDetalleModal(false)}
          cliente={clientes.find(c => c.id === facturaSeleccionada.clienteId)}
        />
      )}

      {/* Modal para Generar desde Movimiento */}
      {showGenerarModal && (
        <GenerarDesdeMovimientoModal
          onClose={() => setShowGenerarModal(false)}
        />
      )}

      {/* Nuevos modales para gestión avanzada de cobros */}
      {showPlanPagoModal && facturaSeleccionada && (
        <PlanPagoModal
          factura={facturaSeleccionada}
          onClose={() => setShowPlanPagoModal(false)}
          onCrearPlan={crearPlanPago}
        />
      )}

      {showRecordatoriosModal && (
        <RecordatoriosPagoModal
          facturas={seleccionadas.length > 0
            ? facturas.filter(f => seleccionadas.includes(f.id))
            : getFacturasProximasAVencer()}
          onClose={() => setShowRecordatoriosModal(false)}
          onEnviarRecordatorio={enviarRecordatorioPago}
        />
      )}
    </div>
  );
};

export default Facturas;

