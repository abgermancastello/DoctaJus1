import React, { useState, useEffect } from 'react';
import { Movimiento } from '../../stores/tesoreriaStore';
import { useExpedienteStore } from '../../stores/expedienteStore';
import { useExpedienteMovimientoStore } from '../../stores/expedienteMovimientoStore';
import moment from 'moment';

interface VincularMovimientoModalProps {
  movimiento: Movimiento | null;
  onClose: () => void;
  onSuccess: () => void;
}

const VincularMovimientoModal: React.FC<VincularMovimientoModalProps> = ({
  movimiento,
  onClose,
  onSuccess
}) => {
  const [expedienteId, setExpedienteId] = useState<string>('');
  const [busqueda, setBusqueda] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const { expedientes, fetchExpedientes, isLoading: loadingExpedientes } = useExpedienteStore();
  const { vincularMovimientoAExpediente, loading: loadingVinculacion } = useExpedienteMovimientoStore();

  // Cargar expedientes al montar
  useEffect(() => {
    fetchExpedientes();
  }, [fetchExpedientes]);

  // Filtrar expedientes por búsqueda
  const expedientesFiltrados = busqueda
    ? expedientes.filter(exp =>
        exp.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
        exp.titulo.toLowerCase().includes(busqueda.toLowerCase())
      )
    : expedientes;

  // Manejar selección de expediente
  const handleSeleccionarExpediente = (id: string) => {
    setExpedienteId(id);
  };

  // Manejar búsqueda
  const handleBusquedaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
  };

  // Manejar vinculación
  const handleVincular = async () => {
    if (!movimiento) return;

    setLoading(true);

    try {
      await vincularMovimientoAExpediente(movimiento.id, expedienteId);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al vincular:', error);
    } finally {
      setLoading(false);
    }
  };

  // Si no hay movimiento seleccionado
  if (!movimiento) {
    return (
      <div className="vincular-movimiento-modal">
        <div className="modal-header">
          <h2>Error</h2>
          <button className="btn-cerrar" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          <p className="error-msg">No se ha seleccionado ningún movimiento para vincular.</p>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vincular-movimiento-modal">
      <div className="modal-header">
        <h2>Vincular Movimiento a Expediente</h2>
        <button className="btn-cerrar" onClick={onClose}>×</button>
      </div>

      <div className="modal-content">
        {/* Detalles del movimiento */}
        <div className="movimiento-detalles">
          <h3>Detalles del Movimiento</h3>
          <table className="tabla-detalles">
            <tbody>
              <tr>
                <td className="etiqueta">Fecha:</td>
                <td>{moment(movimiento.fecha).format('DD/MM/YYYY')}</td>
              </tr>
              <tr>
                <td className="etiqueta">Tipo:</td>
                <td>{movimiento.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}</td>
              </tr>
              <tr>
                <td className="etiqueta">Descripción:</td>
                <td>{movimiento.descripcion}</td>
              </tr>
              <tr>
                <td className="etiqueta">Monto:</td>
                <td>{new Intl.NumberFormat('es-AR', {
                  style: 'currency',
                  currency: 'ARS',
                }).format(movimiento.monto)}</td>
              </tr>
              <tr>
                <td className="etiqueta">Categoría:</td>
                <td>{movimiento.categoria}</td>
              </tr>
              <tr>
                <td className="etiqueta">Estado:</td>
                <td>{movimiento.estado}</td>
              </tr>
            </tbody>
          </table>

          {movimiento.expedienteId && (
            <div className="aviso-expediente">
              <p className="aviso">Este movimiento ya está vinculado a un expediente. Al continuar, se cambiará la vinculación.</p>
            </div>
          )}
        </div>

        {/* Selección de expediente */}
        <div className="seleccion-expediente">
          <h3>Seleccionar Expediente</h3>

          <div className="busqueda-expediente">
            <input
              type="text"
              placeholder="Buscar por número o título..."
              value={busqueda}
              onChange={handleBusquedaChange}
              className="input-busqueda"
            />
          </div>

          {loadingExpedientes ? (
            <div className="loading-expedientes">Cargando expedientes...</div>
          ) : expedientesFiltrados.length === 0 ? (
            <div className="no-expedientes">No se encontraron expedientes</div>
          ) : (
            <div className="lista-expedientes">
              {expedientesFiltrados.map(exp => (
                <div
                  key={exp.id}
                  className={`expediente-item ${expedienteId === exp.id ? 'seleccionado' : ''}`}
                  onClick={() => handleSeleccionarExpediente(exp.id)}
                >
                  <div className="expediente-numero">{exp.numero}</div>
                  <div className="expediente-titulo">{exp.titulo}</div>
                  <div className="expediente-estado">{exp.estado}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="modal-actions">
        <button
          className="btn btn-primary"
          onClick={handleVincular}
          disabled={!expedienteId || loading || loadingVinculacion}
        >
          {loading || loadingVinculacion ? 'Vinculando...' : 'Vincular a Expediente'}
        </button>
        <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
};

export default VincularMovimientoModal;
