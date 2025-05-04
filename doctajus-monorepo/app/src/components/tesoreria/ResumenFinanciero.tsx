import React from 'react';
import { Saldo } from '../../stores/tesoreriaStore';

interface ResumenFinancieroProps {
  saldo: Saldo;
}

const ResumenFinanciero: React.FC<ResumenFinancieroProps> = ({ saldo }) => {
  // Formatear cifras a formato de moneda
  const formatoCifra = (valor: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(valor);
  };

  // Determinar el color del saldo total basado en su valor
  const colorSaldo = (): string => {
    if (saldo.total > 0) return 'dashboard-section-success';
    if (saldo.total < 0) return 'dashboard-section-alert';
    return '';
  };

  return (
    <div className="dashboard-section resumen-financiero">
      <h2>Resumen Financiero</h2>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Ingresos</h3>
          <div className="stat-number stat-ingresos">{formatoCifra(saldo.ingresos)}</div>
        </div>

        <div className="stat-card">
          <h3>Egresos</h3>
          <div className="stat-number stat-egresos">{formatoCifra(saldo.egresos)}</div>
        </div>

        <div className={`stat-card ${colorSaldo()}`}>
          <h3>Saldo Actual</h3>
          <div className="stat-number">{formatoCifra(saldo.total)}</div>
        </div>

        <div className="stat-card">
          <h3>Pendientes</h3>
          <div className="stat-number stat-pendientes">{formatoCifra(saldo.pendientes)}</div>
          <div className="stat-description">Balance proyectado incluyendo pendientes</div>
        </div>
      </div>
    </div>
  );
};

export default ResumenFinanciero;
