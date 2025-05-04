import React, { useEffect, useState } from 'react';
import { useExpedienteMovimientoStore, ExpedienteFinanzas } from '../../stores/expedienteMovimientoStore';
import { useExpedienteStore } from '../../stores/expedienteStore';
import { Movimiento } from '../../stores/tesoreriaStore';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import moment from 'moment';

interface RentabilidadExpedienteProps {
  expedienteId: string;
}

// Función para formatear montos a formato de moneda
const formatoCifra = (valor: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2
  }).format(valor);
};

// Colores para gráficos
const COLORS = {
  ingreso: '#4CAF50',
  egreso: '#F44336',
  balance: '#2196F3',
  rentabilidad: '#FF9800',
  tiempo: '#9C27B0',
  eficiencia: '#00BCD4'
};

const RentabilidadExpediente: React.FC<RentabilidadExpedienteProps> = ({ expedienteId }) => {
  const {
    calcularRentabilidadExpediente,
    getMovimientosPorExpediente,
    loading
  } = useExpedienteMovimientoStore();

  const { getExpediente } = useExpedienteStore();

  const [finanzas, setFinanzas] = useState<ExpedienteFinanzas | null>(null);
  const [expediente, setExpediente] = useState<any>(null);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [datosGraficoTemporal, setDatosGraficoTemporal] = useState<any[]>([]);

  useEffect(() => {
    const cargarDatos = async () => {
      // Cargar datos del expediente
      const exp = await getExpediente(expedienteId);
      setExpediente(exp);

      // Cargar finanzas del expediente
      const datosFinanzas = await calcularRentabilidadExpediente(expedienteId);
      setFinanzas(datosFinanzas);

      // Cargar movimientos del expediente
      const movs = getMovimientosPorExpediente(expedienteId);
      setMovimientos(movs);

      // Preparar datos para gráfico temporal
      if (movs.length > 0) {
        prepararDatosTemporales(movs);
      }
    };

    cargarDatos();
  }, [expedienteId, calcularRentabilidadExpediente, getExpediente, getMovimientosPorExpediente]);

  // Preparar datos para el gráfico temporal
  const prepararDatosTemporales = (movs: Movimiento[]) => {
    // Ordenar movimientos por fecha
    const movimientosOrdenados = [...movs].sort((a, b) =>
      new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );

    // Crear puntos acumulativos
    let ingresoAcumulado = 0;
    let egresoAcumulado = 0;

    const datos = movimientosOrdenados.map(mov => {
      if (mov.tipo === 'ingreso') {
        ingresoAcumulado += mov.monto;
      } else {
        egresoAcumulado += mov.monto;
      }

      return {
        fecha: moment(mov.fecha).format('DD/MM/YY'),
        description: mov.descripcion,
        ingresos: ingresoAcumulado,
        egresos: egresoAcumulado,
        balance: ingresoAcumulado - egresoAcumulado
      };
    });

    setDatosGraficoTemporal(datos);
  };

  if (loading) {
    return <div className="loading">Cargando datos financieros...</div>;
  }

  if (!finanzas || !expediente) {
    return <div className="no-data">No se encontraron datos para este expediente</div>;
  }

  // Calcular valores para mostrar
  const rentabilidadFormateada = finanzas.rentabilidad.toFixed(2) + '%';
  const tiempoFormateado = finanzas.tiempoTotal + ' días';
  const eficienciaFormateada = formatoCifra(finanzas.eficiencia) + '/día';

  // Datos para el gráfico de distribución por categoría
  const datosCategorias = movimientos.reduce((acc: Record<string, number>, mov) => {
    if (!acc[mov.categoria]) {
      acc[mov.categoria] = 0;
    }
    acc[mov.categoria] += mov.monto;
    return acc;
  }, {});

  const datosGraficoCategorias = Object.entries(datosCategorias).map(([categoria, monto]) => ({
    categoria,
    monto
  }));

  return (
    <div className="rentabilidad-expediente">
      <div className="rentabilidad-header">
        <h2>Análisis Financiero: {expediente.numero} - {expediente.titulo}</h2>
      </div>

      {/* KPIs principales */}
      <div className="kpis-container">
        <div className="kpi-card">
          <h3>Ingresos</h3>
          <div className="kpi-valor">{formatoCifra(finanzas.ingresos)}</div>
        </div>

        <div className="kpi-card">
          <h3>Egresos</h3>
          <div className="kpi-valor">{formatoCifra(finanzas.egresos)}</div>
        </div>

        <div className="kpi-card">
          <h3>Balance</h3>
          <div className={`kpi-valor ${finanzas.balance >= 0 ? 'valor-positivo' : 'valor-negativo'}`}>
            {formatoCifra(finanzas.balance)}
          </div>
        </div>

        <div className="kpi-card">
          <h3>Rentabilidad</h3>
          <div className="kpi-valor">{rentabilidadFormateada}</div>
        </div>

        <div className="kpi-card">
          <h3>Tiempo Total</h3>
          <div className="kpi-valor">{tiempoFormateado}</div>
        </div>

        <div className="kpi-card">
          <h3>Eficiencia</h3>
          <div className="kpi-valor">{eficienciaFormateada}</div>
        </div>
      </div>

      {/* Gráfico de evolución temporal */}
      {datosGraficoTemporal.length > 0 && (
        <div className="grafico-seccion">
          <h3>Evolución del Balance</h3>
          <div className="grafico-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={datosGraficoTemporal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip formatter={(value) => formatoCifra(value as number)} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="ingresos"
                  stroke={COLORS.ingreso}
                  fill={COLORS.ingreso}
                  fillOpacity={0.3}
                  name="Ingresos"
                />
                <Area
                  type="monotone"
                  dataKey="egresos"
                  stroke={COLORS.egreso}
                  fill={COLORS.egreso}
                  fillOpacity={0.3}
                  name="Egresos"
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke={COLORS.balance}
                  fill={COLORS.balance}
                  fillOpacity={0.5}
                  name="Balance"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Gráfico de distribución por categorías */}
      {datosGraficoCategorias.length > 0 && (
        <div className="grafico-seccion grafico-mitad">
          <h3>Distribución por Categorías</h3>
          <div className="grafico-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={datosGraficoCategorias}
                  dataKey="monto"
                  nameKey="categoria"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => entry.categoria}
                >
                  {datosGraficoCategorias.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`hsl(${(index * 37) % 360}, 70%, 50%)`}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatoCifra(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tabla de movimientos */}
      <div className="tabla-movimientos-seccion">
        <h3>Movimientos del Expediente</h3>
        {movimientos.length === 0 ? (
          <p className="sin-movimientos">No hay movimientos vinculados a este expediente</p>
        ) : (
          <table className="tabla-movimientos">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th>Descripción</th>
                <th>Monto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map(mov => (
                <tr key={mov.id} className={mov.tipo === 'ingreso' ? 'fila-ingreso' : 'fila-egreso'}>
                  <td>{moment(mov.fecha).format('DD/MM/YYYY')}</td>
                  <td>{mov.tipo}</td>
                  <td>{mov.categoria}</td>
                  <td>{mov.descripcion}</td>
                  <td className={mov.tipo === 'ingreso' ? 'monto-ingreso' : 'monto-egreso'}>
                    {formatoCifra(mov.monto)}
                  </td>
                  <td>{mov.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RentabilidadExpediente;
