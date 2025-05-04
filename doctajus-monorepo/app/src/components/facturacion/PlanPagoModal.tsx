import React, { useState } from 'react';
import { Factura, PlanPago } from '../../stores/facturaStore';
import { useTesoreriaStore } from '../../stores/tesoreriaStore';
import moment from 'moment';

interface PlanPagoModalProps {
  factura: Factura;
  onClose: () => void;
  onCrearPlan: (facturaId: number, cantidadCuotas: number, observaciones?: string) => Promise<PlanPago | null>;
}

const PlanPagoModal: React.FC<PlanPagoModalProps> = ({
  factura,
  onClose,
  onCrearPlan
}) => {
  const [cantidadCuotas, setCantidadCuotas] = useState<string>('3');
  const [observaciones, setObservaciones] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [planCreado, setPlanCreado] = useState<PlanPago | null>(null);

  // Obtener datos del cliente
  const { clientes } = useTesoreriaStore();
  const cliente = clientes.find(c => c.id === factura.clienteId);

  // Formatear cantidades monetarias
  const formatoCifra = (valor: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(valor);
  };

  // Calcular monto por cuota
  const calcularMontoPorCuota = (): number => {
    const cuotas = parseInt(cantidadCuotas);
    if (isNaN(cuotas) || cuotas <= 0) {
      return 0;
    }
    return Math.round((factura.total / cuotas) * 100) / 100;
  };

  // Crear plan de pago
  const handleCrearPlan = async () => {
    const cuotas = parseInt(cantidadCuotas);

    if (isNaN(cuotas) || cuotas <= 0) {
      setError('Ingrese un número válido de cuotas');
      return;
    }

    if (cuotas > 12) {
      setError('El máximo de cuotas permitido es 12');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const plan = await onCrearPlan(factura.id, cuotas, observaciones || undefined);

      if (plan) {
        setPlanCreado(plan);
      } else {
        setError('No se pudo crear el plan de pago');
      }
    } catch (error) {
      let mensaje = 'Error al crear el plan de pago';
      if (error instanceof Error) {
        mensaje = error.message;
      }
      setError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container plan-pago-modal">
        <div className="modal-header">
          <h2 className="modal-title">
            {planCreado ? 'Plan de Pago Creado' : 'Crear Plan de Pago'}
          </h2>
          <button className="modal-close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          {!planCreado ? (
            <>
              <div className="factura-info-container">
                <h3>Factura: {factura.numero}</h3>
                <p><strong>Cliente:</strong> {cliente?.nombre || 'Cliente no encontrado'}</p>
                <p><strong>Fecha de Emisión:</strong> {moment(factura.fecha).format('DD/MM/YYYY')}</p>
                <p><strong>Monto total:</strong> {formatoCifra(factura.total)}</p>
                <p><strong>Estado:</strong> {factura.estado}</p>
              </div>

              <div className="form-group">
                <label htmlFor="cantidadCuotas">Cantidad de Cuotas</label>
                <input
                  id="cantidadCuotas"
                  type="number"
                  min="1"
                  max="12"
                  value={cantidadCuotas}
                  onChange={(e) => setCantidadCuotas(e.target.value)}
                  className="form-control"
                />
                <p className="input-help">Máximo 12 cuotas</p>
              </div>

              <div className="plan-preview">
                <p><strong>Valor por cuota:</strong> {formatoCifra(calcularMontoPorCuota())}</p>
              </div>

              <div className="form-group">
                <label htmlFor="observaciones">Observaciones</label>
                <textarea
                  id="observaciones"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="form-control"
                  rows={3}
                  placeholder="Observaciones o notas adicionales sobre el plan de pago"
                ></textarea>
              </div>

              {error && (
                <div className="error-container">
                  <p>{error}</p>
                </div>
              )}
            </>
          ) : (
            <div className="plan-pago-container">
              <div className="plan-pago-header">
                <h3>Plan de Pago #{planCreado.id}</h3>
                <span>{moment(planCreado.fechaCreacion).format('DD/MM/YYYY')}</span>
              </div>

              <div className="plan-pago-info">
                <p><strong>Factura:</strong> {factura.numero}</p>
                <p><strong>Cliente:</strong> {cliente?.nombre || 'Cliente no encontrado'}</p>
                <p><strong>Total a pagar:</strong> {formatoCifra(factura.total)}</p>
                <p><strong>Cantidad de cuotas:</strong> {planCreado.cantidadCuotas}</p>
                {planCreado.observaciones && (
                  <p><strong>Observaciones:</strong> {planCreado.observaciones}</p>
                )}
              </div>

              <h4>Detalle de Cuotas</h4>
              <div className="plan-pago-cuotas">
                {planCreado.cuotas.map((cuota) => (
                  <div key={cuota.id} className={`cuota-row ${cuota.estado}`}>
                    <div className="cuota-numero">Cuota {cuota.numero}</div>
                    <div className="cuota-fecha">
                      {moment(cuota.fechaVencimiento).format('DD/MM/YYYY')}
                    </div>
                    <div className="cuota-monto">{formatoCifra(cuota.monto)}</div>
                    <div className="cuota-estado">
                      <span className={`badge-${cuota.estado}`}>
                        {cuota.estado === 'pendiente' ? 'Pendiente' :
                         cuota.estado === 'pagada' ? 'Pagada' : 'Vencida'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="plan-info-message">
                El plan de pago ha sido creado exitosamente. Puede gestionar los pagos de las cuotas desde la sección de Facturas.
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {!planCreado ? (
            <>
              <button
                type="button"
                className="modal-cancel-button"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="modal-confirm-button"
                onClick={handleCrearPlan}
                disabled={loading}
              >
                {loading ? 'Creando...' : 'Crear Plan de Pago'}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="modal-confirm-button"
              onClick={onClose}
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanPagoModal;
