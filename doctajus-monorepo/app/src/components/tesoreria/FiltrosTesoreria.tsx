import React, { useState, useEffect } from 'react';
import { FiltrosTesoreria as FiltrosTesoreriaType, TipoMovimiento, CategoriaMovimiento, EstadoMovimiento } from '../../stores/tesoreriaStore';
import { useExpedienteStore } from '../../stores/expedienteStore';
import moment from 'moment';

interface FiltrosTesoreriaProps {
  filtros: FiltrosTesoreriaType;
  setFiltros: (filtros: Partial<FiltrosTesoreriaType>) => void;
  resetFiltros: () => void;
}

const FiltrosTesoreria: React.FC<FiltrosTesoreriaProps> = ({
  filtros,
  setFiltros,
  resetFiltros
}) => {
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');
  const [tipoMovimiento, setTipoMovimiento] = useState<TipoMovimiento | ''>('');
  const [categoria, setCategoria] = useState<CategoriaMovimiento | ''>('');
  const [estado, setEstado] = useState<EstadoMovimiento | ''>('');
  const [expedienteId, setExpedienteId] = useState<string>('');
  const [busqueda, setBusqueda] = useState<string>('');
  const [filtrosAplicados, setFiltrosAplicados] = useState<boolean>(false);

  const { expedientes, fetchExpedientes } = useExpedienteStore();

  // Cargar expedientes
  useEffect(() => {
    fetchExpedientes();
  }, [fetchExpedientes]);

  // Inicializar valores desde los filtros actuales
  useEffect(() => {
    setFechaDesde(filtros.fechaDesde ? moment(filtros.fechaDesde).format('YYYY-MM-DD') : '');
    setFechaHasta(filtros.fechaHasta ? moment(filtros.fechaHasta).format('YYYY-MM-DD') : '');
    setTipoMovimiento(filtros.tipoMovimiento || '');
    setCategoria(filtros.categoria || '');
    setEstado(filtros.estado || '');
    setExpedienteId(filtros.expedienteId ? filtros.expedienteId.toString() : '');
    setBusqueda(filtros.busqueda || '');

    // Verificar si hay filtros aplicados
    setFiltrosAplicados(
      !!filtros.fechaDesde ||
      !!filtros.fechaHasta ||
      !!filtros.tipoMovimiento ||
      !!filtros.categoria ||
      !!filtros.estado ||
      !!filtros.expedienteId ||
      !!filtros.busqueda
    );
  }, [filtros]);

  // Aplicar filtros
  const aplicarFiltros = () => {
    const nuevosFiltros: Partial<FiltrosTesoreriaType> = {};

    if (fechaDesde) nuevosFiltros.fechaDesde = new Date(fechaDesde);
    if (fechaHasta) nuevosFiltros.fechaHasta = new Date(fechaHasta);
    if (tipoMovimiento) nuevosFiltros.tipoMovimiento = tipoMovimiento;
    if (categoria) nuevosFiltros.categoria = categoria;
    if (estado) nuevosFiltros.estado = estado;
    if (expedienteId) nuevosFiltros.expedienteId = parseInt(expedienteId);
    if (busqueda) nuevosFiltros.busqueda = busqueda;

    setFiltros(nuevosFiltros);
    setFiltrosAplicados(true);
  };

  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    setFechaDesde('');
    setFechaHasta('');
    setTipoMovimiento('');
    setCategoria('');
    setEstado('');
    setExpedienteId('');
    setBusqueda('');
    resetFiltros();
    setFiltrosAplicados(false);
  };

  return (
    <div className="filtros-tesoreria">
      <div className="filtros-header">
        <h3>Filtros</h3>
        {filtrosAplicados && (
          <button
            className="btn-limpiar"
            onClick={limpiarFiltros}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="filtros-grid">
        {/* Filtro por fechas */}
        <div className="filtro-campo">
          <label htmlFor="fechaDesde">Desde:</label>
          <input
            type="date"
            id="fechaDesde"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
          />
        </div>

        <div className="filtro-campo">
          <label htmlFor="fechaHasta">Hasta:</label>
          <input
            type="date"
            id="fechaHasta"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
          />
        </div>

        {/* Filtro por tipo de movimiento */}
        <div className="filtro-campo">
          <label htmlFor="tipoMovimiento">Tipo:</label>
          <select
            id="tipoMovimiento"
            value={tipoMovimiento}
            onChange={(e) => setTipoMovimiento(e.target.value as TipoMovimiento | '')}
          >
            <option value="">Todos</option>
            <option value="ingreso">Ingresos</option>
            <option value="egreso">Egresos</option>
          </select>
        </div>

        {/* Filtro por categoría */}
        <div className="filtro-campo">
          <label htmlFor="categoria">Categoría:</label>
          <select
            id="categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as CategoriaMovimiento | '')}
          >
            <option value="">Todas</option>
            <optgroup label="Ingresos">
              <option value="honorarios">Honorarios</option>
              <option value="consultas">Consultas</option>
              <option value="abonos">Abonos mensuales</option>
              <option value="juicios_ganados">Juicios ganados</option>
              <option value="otros_ingresos">Otros ingresos</option>
            </optgroup>
            <optgroup label="Egresos">
              <option value="salarios">Salarios y honorarios</option>
              <option value="alquiler">Alquiler</option>
              <option value="servicios">Servicios</option>
              <option value="impuestos">Impuestos</option>
              <option value="gastos_judiciales">Gastos judiciales</option>
              <option value="papeleria">Papelería y útiles</option>
              <option value="software">Software y tecnología</option>
              <option value="otros_gastos">Otros gastos</option>
            </optgroup>
          </select>
        </div>

        {/* Filtro por estado */}
        <div className="filtro-campo">
          <label htmlFor="estado">Estado:</label>
          <select
            id="estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value as EstadoMovimiento | '')}
          >
            <option value="">Todos</option>
            <option value="pendiente">Pendientes</option>
            <option value="completado">Completados</option>
            <option value="anulado">Anulados</option>
          </select>
        </div>

        {/* Filtro por expediente */}
        <div className="filtro-campo">
          <label htmlFor="expediente">Expediente:</label>
          <select
            id="expediente"
            value={expedienteId}
            onChange={(e) => setExpedienteId(e.target.value)}
          >
            <option value="">Todos</option>
            {expedientes.map(exp => (
              <option key={exp.id} value={exp.id}>
                {exp.numero}: {exp.titulo}
              </option>
            ))}
          </select>
        </div>

        {/* Búsqueda general */}
        <div className="filtro-campo busqueda">
          <label htmlFor="busqueda">Búsqueda:</label>
          <input
            type="text"
            id="busqueda"
            placeholder="Buscar en descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Botones de acción */}
        <div className="filtro-acciones">
          <button
            className="btn-aplicar"
            onClick={aplicarFiltros}
          >
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>
  );
};

export default FiltrosTesoreria;
