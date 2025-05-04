import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Movimiento, useTesoreriaStore } from '../../stores/tesoreriaStore';
import moment from 'moment';

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
  saldo: '#2196F3',
  pendiente: '#FF9800',
  completado: '#8BC34A',
  anulado: '#9E9E9E'
};

const DashboardFinanciero: React.FC = () => {
  const { movimientos } = useTesoreriaStore();
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<'mes' | 'trimestre' | 'año'>('mes');
  const [datosGraficoTendencia, setDatosGraficoTendencia] = useState<any[]>([]);
  const [datosGraficoCategorias, setDatosGraficoCategorias] = useState<any[]>([]);
  const [datosComparativoPeriodos, setDatosComparativoPeriodos] = useState<any[]>([]);
  const [kpis, setKpis] = useState({
    totalIngresos: 0,
    totalEgresos: 0,
    saldoActual: 0,
    pendientesCobro: 0,
    pendientesPago: 0,
    crecimientoIngresos: 0,
    crecimientoEgresos: 0
  });

  // Procesar datos para gráficos al cambiar los movimientos o el periodo
  useEffect(() => {
    if (!movimientos.length) return;

    procesarDatosTendencia();
    procesarDatosCategorias();
    procesarDatosComparativos();
    calcularKPIs();
  }, [movimientos, periodoSeleccionado]);

  // Procesa los datos para el gráfico de tendencia de ingresos/egresos
  const procesarDatosTendencia = () => {
    // Definir el formato de fecha según el periodo
    let formatoFecha = 'DD/MM';
    let agrupacionFecha = 'day';

    if (periodoSeleccionado === 'trimestre') {
      formatoFecha = 'DD/MM';
      agrupacionFecha = 'week';
    } else if (periodoSeleccionado === 'año') {
      formatoFecha = 'MMM';
      agrupacionFecha = 'month';
    }

    // Filtrar movimientos por periodo seleccionado
    const fechaInicio = moment().subtract(
      periodoSeleccionado === 'mes' ? 1 : periodoSeleccionado === 'trimestre' ? 3 : 12,
      periodoSeleccionado === 'mes' ? 'months' : periodoSeleccionado === 'trimestre' ? 'months' : 'months'
    );

    const movimientosFiltrados = movimientos.filter(m =>
      moment(m.fecha).isAfter(fechaInicio)
    );

    // Agrupar por fecha (día, semana o mes)
    const datosPorFecha: Record<string, { fecha: string, ingresos: number, egresos: number, saldo: number }> = {};

    movimientosFiltrados.forEach(movimiento => {
      const fechaFormateada = moment(movimiento.fecha).format(formatoFecha);

      if (!datosPorFecha[fechaFormateada]) {
        datosPorFecha[fechaFormateada] = {
          fecha: fechaFormateada,
          ingresos: 0,
          egresos: 0,
          saldo: 0
        };
      }

      if (movimiento.tipo === 'ingreso' && movimiento.estado !== 'anulado') {
        datosPorFecha[fechaFormateada].ingresos += movimiento.monto;
      } else if (movimiento.tipo === 'egreso' && movimiento.estado !== 'anulado') {
        datosPorFecha[fechaFormateada].egresos += movimiento.monto;
      }

      datosPorFecha[fechaFormateada].saldo =
        datosPorFecha[fechaFormateada].ingresos - datosPorFecha[fechaFormateada].egresos;
    });

    // Convertir a array y ordenar por fecha
    const datosOrdenados = Object.values(datosPorFecha).sort((a, b) =>
      moment(a.fecha, formatoFecha).diff(moment(b.fecha, formatoFecha))
    );

    setDatosGraficoTendencia(datosOrdenados);
  };

  // Procesa los datos para el gráfico de categorías
  const procesarDatosCategorias = () => {
    // Filtrar movimientos por periodo seleccionado
    const fechaInicio = moment().subtract(
      periodoSeleccionado === 'mes' ? 1 : periodoSeleccionado === 'trimestre' ? 3 : 12,
      periodoSeleccionado === 'mes' ? 'months' : periodoSeleccionado === 'trimestre' ? 'months' : 'months'
    );

    const movimientosFiltrados = movimientos.filter(m =>
      moment(m.fecha).isAfter(fechaInicio) && m.estado !== 'anulado'
    );

    // Agrupar por categoría
    const datosPorCategoria: Record<string, { categoria: string, monto: number, tipo: string }> = {};

    movimientosFiltrados.forEach(movimiento => {
      if (!datosPorCategoria[movimiento.categoria]) {
        datosPorCategoria[movimiento.categoria] = {
          categoria: obtenerNombreCategoria(movimiento.categoria),
          monto: 0,
          tipo: movimiento.tipo
        };
      }

      datosPorCategoria[movimiento.categoria].monto += movimiento.monto;
    });

    // Convertir a array y ordenar por monto
    const datosOrdenados = Object.values(datosPorCategoria).sort((a, b) => b.monto - a.monto);

    setDatosGraficoCategorias(datosOrdenados);
  };

  // Procesa los datos para la comparación entre periodos
  const procesarDatosComparativos = () => {
    // Definir periodos a comparar (actual vs anterior)
    const periodoActualInicio = moment().startOf('month');
    const periodoAnteriorInicio = moment().subtract(1, 'month').startOf('month');
    const periodoAnteriorFin = moment().subtract(1, 'month').endOf('month');

    // Filtrar movimientos por cada periodo
    const movimientosPeriodoActual = movimientos.filter(m =>
      moment(m.fecha).isAfter(periodoActualInicio) && m.estado !== 'anulado'
    );

    const movimientosPeriodoAnterior = movimientos.filter(m =>
      moment(m.fecha).isBetween(periodoAnteriorInicio, periodoAnteriorFin, null, '[]') &&
      m.estado !== 'anulado'
    );

    // Calcular totales por tipo para cada periodo
    const calcularTotales = (movs: Movimiento[]) => {
      return {
        ingresos: movs.filter(m => m.tipo === 'ingreso').reduce((sum, m) => sum + m.monto, 0),
        egresos: movs.filter(m => m.tipo === 'egreso').reduce((sum, m) => sum + m.monto, 0)
      };
    };

    const totalesActual = calcularTotales(movimientosPeriodoActual);
    const totalesAnterior = calcularTotales(movimientosPeriodoAnterior);

    // Preparar datos para gráfico comparativo
    const datosComparativos = [
      {
        nombre: 'Ingresos',
        actual: totalesActual.ingresos,
        anterior: totalesAnterior.ingresos,
        diferencia: totalesActual.ingresos - totalesAnterior.ingresos
      },
      {
        nombre: 'Egresos',
        actual: totalesActual.egresos,
        anterior: totalesAnterior.egresos,
        diferencia: totalesActual.egresos - totalesAnterior.egresos
      },
      {
        nombre: 'Saldo',
        actual: totalesActual.ingresos - totalesActual.egresos,
        anterior: totalesAnterior.ingresos - totalesAnterior.egresos,
        diferencia: (totalesActual.ingresos - totalesActual.egresos) -
                    (totalesAnterior.ingresos - totalesAnterior.egresos)
      }
    ];

    setDatosComparativoPeriodos(datosComparativos);
  };

  // Calcula los KPIs financieros
  const calcularKPIs = () => {
    // Periodos para cálculos
    const hoy = moment();
    const inicioMesActual = moment().startOf('month');
    const inicioMesAnterior = moment().subtract(1, 'month').startOf('month');
    const finMesAnterior = moment().subtract(1, 'month').endOf('month');

    // Movimientos filtrados por periodo
    const movimientosMesActual = movimientos.filter(m =>
      moment(m.fecha).isBetween(inicioMesActual, hoy, null, '[]') &&
      m.estado !== 'anulado'
    );

    const movimientosMesAnterior = movimientos.filter(m =>
      moment(m.fecha).isBetween(inicioMesAnterior, finMesAnterior, null, '[]') &&
      m.estado !== 'anulado'
    );

    // Cálculo de totales actuales
    const ingresosMesActual = movimientosMesActual
      .filter(m => m.tipo === 'ingreso')
      .reduce((sum, m) => sum + m.monto, 0);

    const egresosMesActual = movimientosMesActual
      .filter(m => m.tipo === 'egreso')
      .reduce((sum, m) => sum + m.monto, 0);

    // Cálculo de totales mes anterior
    const ingresosMesAnterior = movimientosMesAnterior
      .filter(m => m.tipo === 'ingreso')
      .reduce((sum, m) => sum + m.monto, 0);

    const egresosMesAnterior = movimientosMesAnterior
      .filter(m => m.tipo === 'egreso')
      .reduce((sum, m) => sum + m.monto, 0);

    // Pendientes
    const pendientesCobro = movimientos
      .filter(m => m.tipo === 'ingreso' && m.estado === 'pendiente')
      .reduce((sum, m) => sum + m.monto, 0);

    const pendientesPago = movimientos
      .filter(m => m.tipo === 'egreso' && m.estado === 'pendiente')
      .reduce((sum, m) => sum + m.monto, 0);

    // Cálculo de crecimiento (%)
    const calcularCrecimiento = (actual: number, anterior: number) => {
      if (anterior === 0) return actual > 0 ? 100 : 0;
      return ((actual - anterior) / anterior) * 100;
    };

    // Actualizar KPIs
    setKpis({
      totalIngresos: ingresosMesActual,
      totalEgresos: egresosMesActual,
      saldoActual: ingresosMesActual - egresosMesActual,
      pendientesCobro,
      pendientesPago,
      crecimientoIngresos: calcularCrecimiento(ingresosMesActual, ingresosMesAnterior),
      crecimientoEgresos: calcularCrecimiento(egresosMesActual, egresosMesAnterior)
    });
  };

  // Función para obtener el nombre amigable de la categoría
  const obtenerNombreCategoria = (categoria: string): string => {
    const traducciones: Record<string, string> = {
      honorarios: 'Honorarios',
      consultas: 'Consultas',
      abonos: 'Abonos mensuales',
      juicios_ganados: 'Juicios ganados',
      otros_ingresos: 'Otros ingresos',
      salarios: 'Salarios',
      alquiler: 'Alquiler',
      servicios: 'Servicios',
      impuestos: 'Impuestos',
      gastos_judiciales: 'Gastos judiciales',
      papeleria: 'Papelería',
      software: 'Software',
      otros_gastos: 'Otros gastos'
    };

    return traducciones[categoria] || categoria;
  };

  // Obtener clase para indicadores de crecimiento
  const getClaseCrecimiento = (valor: number) => {
    if (valor > 0) return 'indicador-positivo';
    if (valor < 0) return 'indicador-negativo';
    return '';
  };

  return (
    <div className="dashboard-financiero">
      <div className="dashboard-header">
        <h2>Panel de Análisis Financiero</h2>
        <div className="periodo-selector">
          <select
            value={periodoSeleccionado}
            onChange={(e) => setPeriodoSeleccionado(e.target.value as any)}
            className="selector-periodo"
          >
            <option value="mes">Último mes</option>
            <option value="trimestre">Último trimestre</option>
            <option value="año">Último año</option>
          </select>
        </div>
      </div>

      {/* KPIs principales */}
      <div className="kpis-container">
        <div className="kpi-card">
          <h3>Ingresos</h3>
          <div className="kpi-valor">{formatoCifra(kpis.totalIngresos)}</div>
          <div className={`kpi-tendencia ${getClaseCrecimiento(kpis.crecimientoIngresos)}`}>
            {kpis.crecimientoIngresos > 0 ? '↑' : kpis.crecimientoIngresos < 0 ? '↓' : '–'}
            {Math.abs(kpis.crecimientoIngresos).toFixed(1)}% vs mes anterior
          </div>
        </div>

        <div className="kpi-card">
          <h3>Egresos</h3>
          <div className="kpi-valor">{formatoCifra(kpis.totalEgresos)}</div>
          <div className={`kpi-tendencia ${getClaseCrecimiento(-kpis.crecimientoEgresos)}`}>
            {kpis.crecimientoEgresos > 0 ? '↑' : kpis.crecimientoEgresos < 0 ? '↓' : '–'}
            {Math.abs(kpis.crecimientoEgresos).toFixed(1)}% vs mes anterior
          </div>
        </div>

        <div className="kpi-card">
          <h3>Saldo Neto</h3>
          <div className={`kpi-valor ${kpis.saldoActual >= 0 ? 'valor-positivo' : 'valor-negativo'}`}>
            {formatoCifra(kpis.saldoActual)}
          </div>
        </div>

        <div className="kpi-card">
          <h3>Por Cobrar</h3>
          <div className="kpi-valor">{formatoCifra(kpis.pendientesCobro)}</div>
        </div>
      </div>

      {/* Gráfico de tendencia */}
      <div className="grafico-seccion">
        <h3>Tendencia de Ingresos y Egresos</h3>
        <div className="grafico-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={datosGraficoTendencia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip formatter={(value) => formatoCifra(value as number)} />
              <Legend />
              <Line type="monotone" dataKey="ingresos" stroke={COLORS.ingreso} name="Ingresos" />
              <Line type="monotone" dataKey="egresos" stroke={COLORS.egreso} name="Egresos" />
              <Line type="monotone" dataKey="saldo" stroke={COLORS.saldo} name="Saldo" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparativa mes actual vs mes anterior */}
      <div className="grafico-seccion">
        <h3>Comparativa: Mes Actual vs Mes Anterior</h3>
        <div className="grafico-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datosComparativoPeriodos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" />
              <YAxis />
              <Tooltip formatter={(value) => formatoCifra(value as number)} />
              <Legend />
              <Bar dataKey="actual" fill="#8884d8" name="Mes Actual" />
              <Bar dataKey="anterior" fill="#82ca9d" name="Mes Anterior" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribución por categorías */}
      <div className="graficos-flex">
        <div className="grafico-seccion grafico-mitad">
          <h3>Distribución por Categorías</h3>
          <div className="grafico-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={datosGraficoCategorias.slice(0, 5)} // Mostrar solo las 5 principales
                  dataKey="monto"
                  nameKey="categoria"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => entry.categoria}
                >
                  {datosGraficoCategorias.slice(0, 5).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.tipo === 'ingreso' ? COLORS.ingreso : COLORS.egreso}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatoCifra(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grafico-seccion grafico-mitad">
          <h3>Estado de Movimientos</h3>
          <div className="grafico-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { nombre: 'Completados', valor: movimientos.filter(m => m.estado === 'completado').length },
                    { nombre: 'Pendientes', valor: movimientos.filter(m => m.estado === 'pendiente').length },
                    { nombre: 'Anulados', valor: movimientos.filter(m => m.estado === 'anulado').length }
                  ]}
                  dataKey="valor"
                  nameKey="nombre"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  <Cell fill={COLORS.completado} />
                  <Cell fill={COLORS.pendiente} />
                  <Cell fill={COLORS.anulado} />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardFinanciero;
