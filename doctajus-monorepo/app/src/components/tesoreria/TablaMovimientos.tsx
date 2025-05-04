import React from 'react';
import { Movimiento, CategoriaMovimiento } from '../../stores/tesoreriaStore';
import moment from 'moment';
import { useFacturaStore } from '../../stores/facturaStore';
import { useNavigate } from 'react-router-dom';
import { useExpedienteStore } from '../../stores/expedienteStore';

interface TablaMovimientosProps {
  movimientos: Movimiento[];
  onSeleccionarMovimiento: (movimiento: Movimiento) => void;
  onEliminarMovimiento: (id: number) => void;
  onGenerarFactura: (movimiento: Movimiento) => void;
  onVincularExpediente: (movimiento: Movimiento) => void;
  onVerRentabilidad?: (expedienteId: string) => void;
}

const TablaMovimientos: React.FC<TablaMovimientosProps> = ({
  movimientos,
  onSeleccionarMovimiento,
  onEliminarMovimiento,
  onGenerarFactura,
  onVincularExpediente,
  onVerRentabilidad
}) => {
  const navigate = useNavigate();
  const { expedientes } = useExpedienteStore();

  // Función para obtener el nombre del expediente
  const obtenerNombreExpediente = (expedienteId?: number) => {
    if (!expedienteId) return '-';

    const expediente = expedientes.find(exp => parseInt(exp.id) === expedienteId);
    return expediente ? `${expediente.numero}: ${expediente.titulo}` : `Exp. #${expedienteId}`;
  };

  // Función para formatear el monto
  const formatearMonto = (monto: number, tipo: 'ingreso' | 'egreso') => {
    const formateado = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(monto);

    return (
      <span className={`monto ${tipo === 'ingreso' ? 'ingreso' : 'egreso'}`}>
        {tipo === 'ingreso' ? '+' : '-'} {formateado}
      </span>
    );
  };

  // Función para formatear la categoría
  const formatearCategoria = (categoria: CategoriaMovimiento) => {
    // Reemplazar guiones bajos por espacios y capitalizar
    return categoria
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Manejar clic en la fila
  const handleRowClick = (movimiento: Movimiento) => {
    onSeleccionarMovimiento(movimiento);
  };

  // Manejar clic en vincular a expediente
  const handleVincularClick = (e: React.MouseEvent, movimiento: Movimiento) => {
    e.stopPropagation();
    onVincularExpediente(movimiento);
  };

  // Manejar clic en generar factura
  const handleGenerarFacturaClick = (e: React.MouseEvent, movimiento: Movimiento) => {
    e.stopPropagation();
    onGenerarFactura(movimiento);
  };

  // Manejar clic en ver rentabilidad
  const handleVerRentabilidadClick = (e: React.MouseEvent, expedienteId: number) => {
    e.stopPropagation();
    if (onVerRentabilidad) {
      onVerRentabilidad(expedienteId.toString());
    }
  };

  // Manejar clic en eliminar
  const handleEliminarClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    onEliminarMovimiento(id);
  };

  return (
    <div className="tabla-movimientos-container">
      {movimientos.length === 0 ? (
        <div className="sin-datos">
          No hay movimientos que coincidan con los filtros aplicados.
        </div>
      ) : (
        <table className="tabla-movimientos">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Categoría</th>
              <th>Descripción</th>
              <th>Monto</th>
              <th>Expediente</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map(movimiento => (
              <tr
                key={movimiento.id}
                onClick={() => handleRowClick(movimiento)}
                className={`fila-movimiento fila-${movimiento.tipo} estado-${movimiento.estado}`}
              >
                <td>{moment(movimiento.fecha).format('DD/MM/YYYY')}</td>
                <td>{movimiento.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}</td>
                <td>{formatearCategoria(movimiento.categoria)}</td>
                <td>{movimiento.descripcion}</td>
                <td>{formatearMonto(movimiento.monto, movimiento.tipo)}</td>
                <td>
                  {movimiento.expedienteId ? (
                    <div className="expediente-cell">
                      <span>{obtenerNombreExpediente(movimiento.expedienteId)}</span>
                      <button
                        className="btn-link btn-ver-rentabilidad"
                        onClick={(e) => handleVerRentabilidadClick(e, movimiento.expedienteId!)}
                        title="Ver análisis de rentabilidad"
                      >
                        📊
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn-link btn-vincular"
                      onClick={(e) => handleVincularClick(e, movimiento)}
                      title="Vincular a expediente"
                    >
                      Vincular
                    </button>
                  )}
                </td>
                <td>
                  <span className={`estado estado-${movimiento.estado}`}>
                    {movimiento.estado}
                  </span>
                </td>
                <td className="acciones">
                  <button
                    className="btn-accion btn-editar"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSeleccionarMovimiento(movimiento);
                    }}
                    title="Editar movimiento"
                  >
                    ✏️
                  </button>
                  {movimiento.tipo === 'ingreso' && (
                    <button
                      className="btn-accion btn-factura"
                      onClick={(e) => handleGenerarFacturaClick(e, movimiento)}
                      title="Generar factura"
                    >
                      📄
                    </button>
                  )}
                  <button
                    className="btn-accion btn-eliminar"
                    onClick={(e) => handleEliminarClick(e, movimiento.id)}
                    title="Eliminar movimiento"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TablaMovimientos;
