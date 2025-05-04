import React, { useEffect, useState } from 'react';
import { useTesoreriaStore, Movimiento } from '../stores/tesoreriaStore';
import { useNavigate, Link } from 'react-router-dom';
import { useExpedienteMovimientoStore } from '../stores/expedienteMovimientoStore';

// Componentes
import ResumenFinanciero from '../components/tesoreria/ResumenFinanciero';
import FiltrosTesoreria from '../components/tesoreria/FiltrosTesoreria';
import TablaMovimientos from '../components/tesoreria/TablaMovimientos';
import MovimientoForm from '../components/tesoreria/MovimientoForm';
import DashboardFinanciero from '../components/tesoreria/DashboardFinanciero';
import GenerarDesdeMovimientoModal from '../components/facturacion/GenerarDesdeMovimientoModal';
import VincularMovimientoModal from '../components/tesoreria/VincularMovimientoModal';
import RentabilidadExpediente from '../components/tesoreria/RentabilidadExpediente';
import AnalisisCostosTiempo from '../components/tesoreria/AnalisisCostosTiempo';

const Tesoreria: React.FC = () => {
  // Estado para controlar el modal de creación/edición de movimientos
  const [showModal, setShowModal] = useState(false);
  // Estado para controlar la visualización del dashboard avanzado
  const [showDashboard, setShowDashboard] = useState(true);
  // Estado para el movimiento a editar
  const [movimientoEditar, setMovimientoEditar] = useState<Movimiento | null>(null);
  // Estado para el modal de generación de facturas
  const [showGenerarFacturaModal, setShowGenerarFacturaModal] = useState(false);
  // Nuevo estado para el modal de vinculación con expedientes
  const [showVincularExpedienteModal, setShowVincularExpedienteModal] = useState(false);
  // Nuevo estado para mostrar análisis de rentabilidad
  const [showRentabilidadExpediente, setShowRentabilidadExpediente] = useState(false);
  // Nuevo estado para mostrar análisis de costos
  const [showAnalisisCostos, setShowAnalisisCostos] = useState(false);
  // Nuevo estado para el expediente seleccionado para el análisis
  const [expedienteSeleccionadoId, setExpedienteSeleccionadoId] = useState<string | null>(null);

  const navigate = useNavigate();

  // Obtener store de tesorería
  const {
    movimientos,
    movimientosFiltrados,
    saldo,
    filtros,
    clientes,
    loading,
    error,
    fetchMovimientos,
    fetchClientes,
    addMovimiento,
    updateMovimiento,
    deleteMovimiento,
    setFiltros,
    resetFiltros,
    calcularSaldo,
    seleccionarMovimiento,
    movimientoSeleccionado,
    setMovimientoSeleccionado
  } = useTesoreriaStore();

  // Obtener store de expedienteMovimiento
  const {
    fetchExpedienteFinanzas,
    expedienteFinanzas,
    setExpedienteSeleccionado,
    calcularCostosPromedioTipo
  } = useExpedienteMovimientoStore();

  // Cargar datos necesarios
  useEffect(() => {
    fetchMovimientos();
    fetchClientes();
    calcularSaldo();
    fetchExpedienteFinanzas();
  }, [fetchMovimientos, fetchClientes, calcularSaldo, fetchExpedienteFinanzas]);

  // Manejar la creación de un nuevo movimiento
  const handleNuevoMovimiento = () => {
    setMovimientoSeleccionado(null);
    setShowModal(true);
  };

  // Manejar la edición de un movimiento existente
  const handleEditarMovimiento = (movimiento: Movimiento) => {
    setMovimientoEditar(movimiento);
    setMovimientoSeleccionado(movimiento);
    setShowModal(true);
  };

  // Manejar el guardado de un movimiento (nuevo o editado)
  const handleGuardarMovimiento = async (datos: any) => {
    if (movimientoSeleccionado) {
      await updateMovimiento(movimientoSeleccionado.id, datos);
    } else {
      await addMovimiento(datos);
    }

    setShowModal(false);
    setMovimientoEditar(null);
    setMovimientoSeleccionado(null);
  };

  // Manejar la eliminación de un movimiento
  const handleEliminarMovimiento = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este movimiento?')) {
      await deleteMovimiento(id);
    }
  };

  // Manejar la generación de una factura desde un movimiento
  const handleGenerarFactura = (movimiento: Movimiento) => {
    setMovimientoSeleccionado(movimiento);
    setShowGenerarFacturaModal(true);
  };

  // Nuevo: Manejar la vinculación con expediente
  const handleVincularExpediente = (movimiento: Movimiento) => {
    setMovimientoSeleccionado(movimiento);
    setShowVincularExpedienteModal(true);
  };

  // Nuevo: Manejar la visualización del análisis de rentabilidad
  const handleVerRentabilidad = (expedienteId: string) => {
    setExpedienteSeleccionadoId(expedienteId);
    setExpedienteSeleccionado(expedienteId);
    setShowRentabilidadExpediente(true);
    setShowAnalisisCostos(false);
    setShowDashboard(false);
  };

  // Nuevo: Manejar la visualización del análisis de costos
  const handleVerAnalisisCostos = () => {
    setShowAnalisisCostos(true);
    setShowRentabilidadExpediente(false);
    setShowDashboard(false);
  };

  // Nuevo: Volver al dashboard principal
  const handleVolverDashboard = () => {
    setShowDashboard(true);
    setShowRentabilidadExpediente(false);
    setShowAnalisisCostos(false);
    setExpedienteSeleccionadoId(null);
    setExpedienteSeleccionado(null);
  };

  return (
    <div className="page">
      <h1>Tesorería</h1>

      {/* Botones de acción */}
      <div className="actions-container">
        <button
          className="btn btn-primary"
          onClick={handleNuevoMovimiento}
        >
          Nuevo Movimiento
        </button>

        <div className="btn-group">
          <button
            className={`btn ${showDashboard ? 'btn-primary' : 'btn-secondary'}`}
            onClick={handleVolverDashboard}
          >
            Dashboard General
          </button>
          <button
            className={`btn ${showAnalisisCostos ? 'btn-primary' : 'btn-secondary'}`}
            onClick={handleVerAnalisisCostos}
          >
            Análisis por Tipo de Caso
          </button>
        </div>
      </div>

      {/* Resumen financiero */}
      <ResumenFinanciero saldo={saldo} />

      {/* Contenido principal */}
      <div className="main-content">
        {/* Dashboard financiero */}
        {showDashboard && (
          <DashboardFinanciero />
        )}

        {/* Análisis de rentabilidad de expediente */}
        {showRentabilidadExpediente && expedienteSeleccionadoId && (
          <RentabilidadExpediente expedienteId={expedienteSeleccionadoId} />
        )}

        {/* Análisis de costos por tipo de caso */}
        {showAnalisisCostos && (
          <AnalisisCostosTiempo />
        )}

        {/* Sección de movimientos */}
        <div className="movimientos-section">
          <div className="section-header">
            <h2>Movimientos</h2>
          </div>

          {/* Filtros */}
          <FiltrosTesoreria
            filtros={filtros}
            setFiltros={setFiltros}
            resetFiltros={resetFiltros}
          />

          {/* Tabla de movimientos */}
          <TablaMovimientos
            movimientos={movimientosFiltrados}
            onSeleccionarMovimiento={handleEditarMovimiento}
            onEliminarMovimiento={handleEliminarMovimiento}
            onGenerarFactura={handleGenerarFactura}
            onVincularExpediente={handleVincularExpediente}
            onVerRentabilidad={handleVerRentabilidad}
          />

          {/* Paginación (placeholder) */}
          <div className="pagination">
            {/* Aquí iría la paginación si se implementa */}
          </div>
        </div>
      </div>

      {/* Modal de creación/edición de movimientos */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <MovimientoForm
              movimientoInicial={movimientoEditar}
              onGuardar={handleGuardarMovimiento}
              onCancel={() => setShowModal(false)}
              clientes={clientes}
            />
          </div>
        </div>
      )}

      {/* Modal de generación de facturas */}
      {showGenerarFacturaModal && movimientoSeleccionado && (
        <div className="modal-backdrop">
          <div className="modal">
            <GenerarDesdeMovimientoModal
              movimiento={movimientoSeleccionado}
              onClose={() => setShowGenerarFacturaModal(false)}
              onSuccess={() => {
                setShowGenerarFacturaModal(false);
                fetchMovimientos(); // Actualizar los movimientos
              }}
            />
          </div>
        </div>
      )}

      {/* Modal de vinculación con expedientes */}
      {showVincularExpedienteModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <VincularMovimientoModal
              movimiento={movimientoSeleccionado}
              onClose={() => setShowVincularExpedienteModal(false)}
              onSuccess={() => {
                setShowVincularExpedienteModal(false);
                fetchMovimientos(); // Actualizar los movimientos
                fetchExpedienteFinanzas(); // Actualizar los datos de expedientes
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Tesoreria;
