import React, { useState, useEffect } from 'react';
import { useFacturaStore } from '../../stores/facturaStore';
import { useTesoreriaStore } from '../../stores/tesoreriaStore';
import moment from 'moment';

interface DashboardCobrosProps {
  onCrearPlanPago?: (facturaId: number) => void;
  onEnviarRecordatorio?: (facturaId: number) => void;
}

const DashboardCobros: React.FC<DashboardCobrosProps> = ({
  onCrearPlanPago,
  onEnviarRecordatorio
}) => {
  const [rangoFechas, setRangoFechas] = useState<'semana' | 'mes' | 'trimestre'>('mes');

  // Estados del store de facturas
  const {
    facturas,
    getFacturasVencidas,
    getFacturasProximasAVencer,
    getEstadisticasMorosidad,
    actualizarDiasMora
  } = useFacturaStore();

  // Datos de Tesorería para clientes
  const { clientes } = useTesoreriaStore();

  // Actualizar días de mora al cargar el componente
  useEffect(() => {
    actualizarDiasMora();
  }, [actualizarDiasMora]);

  // Formatear cantidades monetarias
  const formatoCifra = (valor: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(valor);
  };

  // Obtener el nombre del cliente
  const getNombreCliente = (clienteId: number): string => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente ? cliente.nombre : 'Cliente no encontrado';
  };

  // Obtener estadísticas de morosidad
  const estadisticasMorosidad = getEstadisticasMorosidad();

  // Filtrar facturas por rango de fechas
  const obtenerFacturasPorRango = () => {
    let fechaInicio: moment.Moment;

    switch (rangoFechas) {
      case 'semana':
        fechaInicio = moment().subtract(7, 'days').startOf('day');
        break;
      case 'trimestre':
        fechaInicio = moment().subtract(3, 'months').startOf('day');
        break;
      case 'mes':
      default:
        fechaInicio = moment().subtract(1, 'month').startOf('day');
        break;
    }

    return facturas.filter(f =>
      (f.estado === 'emitida' || f.estado === 'vencida') &&
      moment(f.fechaVencimiento).isAfter(fechaInicio)
    );
  };

  // Calcular facturas por estado (versión sin gráficos)
  const calcularFacturasPorEstado = () => {
    return {
      emitidas: facturas.filter(f => f.estado === 'emitida').length,
      vencidas: facturas.filter(f => f.estado === 'vencida').length,
      pagadas: facturas.filter(f => f.estado === 'pagada').length,
      anuladas: facturas.filter(f => f.estado === 'anulada').length
    };
  };

  // Calcular días de mora por rango (versión sin gráficos)
  const calcularDiasMoraPorRango = () => {
    const facturasVencidas = getFacturasVencidas();
    const rangos = {
      '1-15': 0,
      '16-30': 0,
      '31-60': 0,
      '61-90': 0,
      '90+': 0
    };

    facturasVencidas.forEach(factura => {
      const diasMora = factura.diasMora || 0;

      if (diasMora <= 15) {
        rangos['1-15']++;
      } else if (diasMora <= 30) {
        rangos['16-30']++;
      } else if (diasMora <= 60) {
        rangos['31-60']++;
      } else if (diasMora <= 90) {
        rangos['61-90']++;
      } else {
        rangos['90+']++;
      }
    });

    return rangos;
  };

  // Facturas filtradas por rango
  const facturasFiltradas = obtenerFacturasPorRango();
  const facturasVencidas = getFacturasVencidas();
  const facturasProximasAVencer = getFacturasProximasAVencer();

  // Estadísticas para mostrar
  const estadoPorFacturas = calcularFacturasPorEstado();
  const moraPorRango = calcularDiasMoraPorRango();

  return (
    <div className="dashboard-cobros">
      <div className="dashboard-header">
        <h2>Dashboard de Cobros</h2>
        <div className="filtros-periodo">
          <button
            className={`btn-periodo ${rangoFechas === 'semana' ? 'activo' : ''}`}
            onClick={() => setRangoFechas('semana')}
          >
            Última Semana
          </button>
          <button
            className={`btn-periodo ${rangoFechas === 'mes' ? 'activo' : ''}`}
            onClick={() => setRangoFechas('mes')}
          >
            Último Mes
          </button>
          <button
            className={`btn-periodo ${rangoFechas === 'trimestre' ? 'activo' : ''}`}
            onClick={() => setRangoFechas('trimestre')}
          >
            Último Trimestre
          </button>
        </div>
      </div>

      <div className="kpi-container">
        <div className="kpi-card">
          <h3>Total por Cobrar</h3>
          <div className="kpi-valor">
            {formatoCifra(
              facturas
                .filter(f => f.estado === 'emitida' || f.estado === 'vencida')
                .reduce((sum, f) => sum + f.total, 0)
            )}
          </div>
          <div className="kpi-detalle">
            {facturas.filter(f => f.estado === 'emitida' || f.estado === 'vencida').length} facturas
          </div>
        </div>

        <div className="kpi-card alerta">
          <h3>Vencidas</h3>
          <div className="kpi-valor">
            {formatoCifra(
              facturas
                .filter(f => f.estado === 'vencida')
                .reduce((sum, f) => sum + f.total, 0)
            )}
          </div>
          <div className="kpi-detalle">
            {facturasVencidas.length} facturas
          </div>
        </div>

        <div className="kpi-card warning">
          <h3>Próximas a Vencer</h3>
          <div className="kpi-valor">
            {formatoCifra(
              facturasProximasAVencer
                .reduce((sum, f) => sum + f.total, 0)
            )}
          </div>
          <div className="kpi-detalle">
            {facturasProximasAVencer.length} facturas
          </div>
        </div>

        <div className="kpi-card info">
          <h3>Promedio Mora</h3>
          <div className="kpi-valor">
            {estadisticasMorosidad.promedioMora} días
          </div>
          <div className="kpi-detalle">
            {estadisticasMorosidad.totalVencidas} facturas vencidas
          </div>
        </div>
      </div>

      <div className="graficos-container">
        <div className="estadisticas-card">
          <h3>Facturas por Estado</h3>
          <div className="estadisticas-list">
            <div className="estadistica-item">
              <span className="estadistica-label">Emitidas:</span>
              <span className="estadistica-valor">{estadoPorFacturas.emitidas}</span>
            </div>
            <div className="estadistica-item">
              <span className="estadistica-label">Vencidas:</span>
              <span className="estadistica-valor">{estadoPorFacturas.vencidas}</span>
            </div>
            <div className="estadistica-item">
              <span className="estadistica-label">Pagadas:</span>
              <span className="estadistica-valor">{estadoPorFacturas.pagadas}</span>
            </div>
            <div className="estadistica-item">
              <span className="estadistica-label">Anuladas:</span>
              <span className="estadistica-valor">{estadoPorFacturas.anuladas}</span>
            </div>
          </div>
        </div>

        <div className="estadisticas-card">
          <h3>Días de Mora</h3>
          <div className="estadisticas-list">
            {Object.entries(moraPorRango).map(([rango, cantidad]) => (
              <div className="estadistica-item" key={rango}>
                <span className="estadistica-label">{rango} días:</span>
                <span className="estadistica-valor">{cantidad}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tablas-container">
        <div className="tabla-card">
          <h3>Facturas Vencidas ({facturasVencidas.length})</h3>
          <div className="tabla-scroll">
            <table className="tabla-dashboard">
              <thead>
                <tr>
                  <th>Factura</th>
                  <th>Cliente</th>
                  <th>Vencimiento</th>
                  <th>Mora</th>
                  <th>Monto</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {facturasVencidas
                  .sort((a, b) => (b.diasMora || 0) - (a.diasMora || 0))
                  .slice(0, 5)
                  .map(factura => (
                    <tr key={factura.id}>
                      <td>{factura.numero}</td>
                      <td>{getNombreCliente(factura.clienteId)}</td>
                      <td>{moment(factura.fechaVencimiento).format('DD/MM/YYYY')}</td>
                      <td>
                        <span className="dias-mora">
                          {factura.diasMora} días
                        </span>
                      </td>
                      <td className="monto">{formatoCifra(factura.total)}</td>
                      <td>
                        <div className="acciones-container">
                          {onCrearPlanPago && !factura.planPagoId && (
                            <button
                              className="btn-accion btn-plan"
                              onClick={() => onCrearPlanPago(factura.id)}
                            >
                              Plan
                            </button>
                          )}
                          {onEnviarRecordatorio && (
                            <button
                              className="btn-accion btn-recordatorio"
                              onClick={() => onEnviarRecordatorio(factura.id)}
                            >
                              Recordar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                {facturasVencidas.length === 0 && (
                  <tr>
                    <td colSpan={6} className="empty-table">No hay facturas vencidas</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="tabla-card">
          <h3>Próximas a Vencer ({facturasProximasAVencer.length})</h3>
          <div className="tabla-scroll">
            <table className="tabla-dashboard">
              <thead>
                <tr>
                  <th>Factura</th>
                  <th>Cliente</th>
                  <th>Vencimiento</th>
                  <th>Días</th>
                  <th>Monto</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {facturasProximasAVencer
                  .sort((a, b) => moment(a.fechaVencimiento).diff(moment(b.fechaVencimiento)))
                  .slice(0, 5)
                  .map(factura => (
                    <tr key={factura.id}>
                      <td>{factura.numero}</td>
                      <td>{getNombreCliente(factura.clienteId)}</td>
                      <td>{moment(factura.fechaVencimiento).format('DD/MM/YYYY')}</td>
                      <td>
                        <span className="dias-restantes">
                          {moment(factura.fechaVencimiento).diff(moment(), 'days')} días
                        </span>
                      </td>
                      <td className="monto">{formatoCifra(factura.total)}</td>
                      <td>
                        <div className="acciones-container">
                          {onEnviarRecordatorio && (
                            <button
                              className="btn-accion btn-recordatorio"
                              onClick={() => onEnviarRecordatorio(factura.id)}
                            >
                              Recordar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                {facturasProximasAVencer.length === 0 && (
                  <tr>
                    <td colSpan={6} className="empty-table">No hay facturas próximas a vencer</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCobros;
