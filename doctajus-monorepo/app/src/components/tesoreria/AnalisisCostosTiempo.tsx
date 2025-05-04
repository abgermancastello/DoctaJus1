import React, { useEffect, useState } from 'react';
import { useExpedienteMovimientoStore, CostoPromedio } from '../../stores/expedienteMovimientoStore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis
} from 'recharts';

// Función para formatear montos a formato de moneda
const formatoCifra = (valor: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2
  }).format(valor);
};

// Interfaz para los datos de gráfico
interface DatoComparativo {
  tipo: string;
  costo: number;
  tiempo: number;
  eficiencia: number;
  cantidad: number;
}

const AnalisisCostosTiempo: React.FC = () => {
  const { calcularCostosPromedioTipo, loading } = useExpedienteMovimientoStore();
  const [costosPorTipo, setCostosPorTipo] = useState<CostoPromedio[]>([]);
  const [datosComparativos, setDatosComparativos] = useState<DatoComparativo[]>([]);

  useEffect(() => {
    const cargarDatos = async () => {
      const datos = await calcularCostosPromedioTipo();
      setCostosPorTipo(datos);

      // Preparar datos para gráfico comparativo
      const datosGrafico = datos.map(item => ({
        tipo: item.tipo,
        costo: item.costoPromedio,
        tiempo: item.tiempoPromedio,
        eficiencia: item.eficienciaPromedio,
        cantidad: item.cantidad
      }));

      setDatosComparativos(datosGrafico);
    };

    cargarDatos();
  }, [calcularCostosPromedioTipo]);

  if (loading) {
    return <div className="loading">Cargando datos de análisis...</div>;
  }

  if (costosPorTipo.length === 0) {
    return <div className="no-data">No hay suficientes datos para realizar el análisis</div>;
  }

  // Ordenar por costo para la tabla
  const costosPorTipoOrdenados = [...costosPorTipo].sort((a, b) => b.costoPromedio - a.costoPromedio);

  // Función para determinar el color según la eficiencia
  const getBarColor = (entry: DatoComparativo): string => {
    return entry.eficiencia >= 0 ? '#4CAF50' : '#F44336';
  };

  return (
    <div className="analisis-costos-tiempo">
      <div className="analisis-header">
        <h2>Análisis de Costos y Tiempos por Tipo de Caso</h2>
      </div>

      {/* Gráficos comparativos */}
      <div className="graficos-comparativos">
        {/* Gráfico de costos promedio */}
        <div className="grafico-seccion">
          <h3>Costo Promedio por Tipo de Caso</h3>
          <div className="grafico-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosComparativos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tipo" />
                <YAxis />
                <Tooltip formatter={(value) => formatoCifra(value as number)} />
                <Legend />
                <Bar dataKey="costo" fill="#8884d8" name="Costo Promedio" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de tiempo promedio */}
        <div className="grafico-seccion">
          <h3>Tiempo Promedio por Tipo de Caso (días)</h3>
          <div className="grafico-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosComparativos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tipo" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="tiempo" fill="#82ca9d" name="Tiempo Promedio (días)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de correlación costo-tiempo */}
        <div className="grafico-seccion">
          <h3>Correlación entre Costo y Tiempo</h3>
          <div className="grafico-container">
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid />
                <XAxis
                  type="number"
                  dataKey="tiempo"
                  name="Tiempo (días)"
                  label={{ value: 'Tiempo (días)', position: 'insideBottomRight', offset: -10 }}
                />
                <YAxis
                  type="number"
                  dataKey="costo"
                  name="Costo"
                  label={{ value: 'Costo Promedio', angle: -90, position: 'insideLeft' }}
                  tickFormatter={(value) => formatoCifra(value)}
                />
                <ZAxis dataKey="cantidad" range={[50, 200]} name="Cantidad" />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "Costo") return formatoCifra(value as number);
                    return value;
                  }}
                  cursor={{ strokeDasharray: '3 3' }}
                />
                <Legend />
                <Scatter name="Casos" data={datosComparativos} fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de eficiencia */}
        <div className="grafico-seccion">
          <h3>Eficiencia Financiera por Tipo de Caso</h3>
          <div className="grafico-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosComparativos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tipo" />
                <YAxis tickFormatter={(value) => formatoCifra(value)} />
                <Tooltip formatter={(value) => formatoCifra(value as number)} />
                <Legend />
                {/* Crear dos series de datos filtradas para evitar usar hide */}
                <Bar
                  dataKey={(entry: DatoComparativo) => entry.eficiencia >= 0 ? entry.eficiencia : 0}
                  name="Eficiencia positiva (Ganancia/día)"
                  fill="#4CAF50"
                />
                <Bar
                  dataKey={(entry: DatoComparativo) => entry.eficiencia < 0 ? entry.eficiencia : 0}
                  name="Eficiencia negativa (Pérdida/día)"
                  fill="#F44336"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabla de datos */}
      <div className="tabla-costos-seccion">
        <h3>Resumen de Costos y Tiempos por Tipo de Caso</h3>
        <table className="tabla-costos">
          <thead>
            <tr>
              <th>Tipo de Caso</th>
              <th>Casos Analizados</th>
              <th>Costo Promedio</th>
              <th>Tiempo Promedio (días)</th>
              <th>Eficiencia (Ganancia/día)</th>
            </tr>
          </thead>
          <tbody>
            {costosPorTipoOrdenados.map((item, index) => (
              <tr key={index}>
                <td>{item.tipo}</td>
                <td>{item.cantidad}</td>
                <td>{formatoCifra(item.costoPromedio)}</td>
                <td>{item.tiempoPromedio.toFixed(1)}</td>
                <td className={item.eficienciaPromedio >= 0 ? 'valor-positivo' : 'valor-negativo'}>
                  {formatoCifra(item.eficienciaPromedio)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recomendaciones basadas en datos */}
      <div className="recomendaciones-seccion">
        <h3>Recomendaciones Operativas</h3>

        {(() => {
          // Encontrar el tipo más rentable
          const tipoMasRentable = [...costosPorTipo].sort((a, b) => b.eficienciaPromedio - a.eficienciaPromedio)[0];

          // Encontrar el tipo menos rentable
          const tipoMenosRentable = [...costosPorTipo].sort((a, b) => a.eficienciaPromedio - b.eficienciaPromedio)[0];

          // Encontrar el tipo más rápido
          const tipoMasRapido = [...costosPorTipo].sort((a, b) => a.tiempoPromedio - b.tiempoPromedio)[0];

          return (
            <ul className="recomendaciones-lista">
              {tipoMasRentable && tipoMasRentable.eficienciaPromedio > 0 && (
                <li>
                  <strong>Priorizar casos de tipo "{tipoMasRentable.tipo}"</strong> - Son los más rentables con {' '}
                  {formatoCifra(tipoMasRentable.eficienciaPromedio)} de ganancia diaria.
                </li>
              )}

              {tipoMenosRentable && tipoMenosRentable.eficienciaPromedio < 0 && (
                <li>
                  <strong>Revisar estrategia para casos "{tipoMenosRentable.tipo}"</strong> - Actualmente generan pérdidas de {' '}
                  {formatoCifra(Math.abs(tipoMenosRentable.eficienciaPromedio))} por día.
                </li>
              )}

              {tipoMasRapido && (
                <li>
                  <strong>Optimizar procesos basados en casos "{tipoMasRapido.tipo}"</strong> - Son los más rápidos
                  con un promedio de {tipoMasRapido.tiempoPromedio.toFixed(1)} días de resolución.
                </li>
              )}

              <li>
                <strong>Monitoreo de costos</strong> - Implementar un sistema de alertas para expedientes que superen
                el costo promedio de su categoría.
              </li>
            </ul>
          );
        })()}
      </div>
    </div>
  );
};

export default AnalisisCostosTiempo;
