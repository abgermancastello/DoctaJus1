import React, { useState } from 'react';
import { Factura, RecordatorioPago } from '../../stores/facturaStore';
import { useTesoreriaStore } from '../../stores/tesoreriaStore';
import { useUIStore } from '../../stores/uiStore';
import moment from 'moment';

interface RecordatoriosPagoModalProps {
  facturas: Factura[];
  onClose: () => void;
  onEnviarRecordatorio: (facturaId: number, tipo: 'email' | 'sms' | 'llamada', mensaje: string) => Promise<void>;
}

const RecordatoriosPagoModal: React.FC<RecordatoriosPagoModalProps> = ({
  facturas,
  onClose,
  onEnviarRecordatorio
}) => {
  const [tipoRecordatorio, setTipoRecordatorio] = useState<'email' | 'sms' | 'llamada'>('email');
  const [mensaje, setMensaje] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [recordatoriosEnviados, setRecordatoriosEnviados] = useState<number[]>([]);

  // Obtener tienda UI para mostrar notificaciones
  const { addNotification } = useUIStore();

  // Obtener clientes
  const { clientes } = useTesoreriaStore();

  // Generar mensaje predeterminado
  const generarMensajePredeterminado = (tipo: 'email' | 'sms' | 'llamada') => {
    let mensajePlantilla = '';

    switch (tipo) {
      case 'email':
        mensajePlantilla = `Estimado cliente,\n\nLe recordamos que tiene facturas pendientes de pago con DOCTAJUS.\n\nPor favor, realice el pago a la brevedad para evitar recargos por mora.\n\nSi ya ha realizado el pago, por favor ignore este mensaje.\n\nAtentamente,\nDepartamento de Administración\nDOCTAJUS`;
        break;
      case 'sms':
        mensajePlantilla = `DOCTAJUS informa: Tiene facturas pendientes de pago. Por favor, regularice su situación. Ante cualquier duda, contáctenos.`;
        break;
      case 'llamada':
        mensajePlantilla = `Informar sobre facturas pendientes de pago. Consultar fecha estimada de pago. Ofrecer plan de pagos si el monto es elevado.`;
        break;
    }

    return mensajePlantilla;
  };

  // Actualizar mensaje al cambiar tipo de recordatorio
  React.useEffect(() => {
    setMensaje(generarMensajePredeterminado(tipoRecordatorio));
  }, [tipoRecordatorio]);

  // Obtener el nombre del cliente
  const getNombreCliente = (clienteId: number): string => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente ? cliente.nombre : 'Cliente no encontrado';
  };

  // Formatear cifras a formato de moneda
  const formatoCifra = (valor: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(valor);
  };

  // Manejar el envío de recordatorios
  const handleEnviarRecordatorios = async () => {
    if (!mensaje.trim()) {
      setError('Debe ingresar un mensaje para el recordatorio');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Enviar recordatorios para cada factura seleccionada
      for (const factura of facturas) {
        await onEnviarRecordatorio(factura.id, tipoRecordatorio, mensaje);
        setRecordatoriosEnviados(prev => [...prev, factura.id]);

        // Mostrar notificación de éxito
        addNotification({
          type: 'success',
          message: `Recordatorio enviado para factura ${factura.numero}`
        });
      }
    } catch (error) {
      let mensaje = 'Error al enviar los recordatorios';
      if (error instanceof Error) {
        mensaje = error.message;
      }
      setError(mensaje);

      // Mostrar notificación de error
      addNotification({
        type: 'error',
        message: mensaje
      });
    } finally {
      setLoading(false);
    }
  };

  // Comprobar si una factura ya tiene recordatorio enviado
  const recordatorioEnviado = (facturaId: number): boolean => {
    return recordatoriosEnviados.includes(facturaId);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container recordatorios-modal">
        <div className="modal-header">
          <h2 className="modal-title">
            Enviar Recordatorios de Pago
          </h2>
          <button className="modal-close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          <div className="facturas-seleccionadas">
            <h3>Facturas Seleccionadas ({facturas.length})</h3>
            <div className="facturas-lista">
              {facturas.map(factura => (
                <div
                  key={factura.id}
                  className={`factura-item ${recordatorioEnviado(factura.id) ? 'recordatorio-enviado' : ''}`}
                >
                  <div className="factura-info">
                    <div className="factura-numero">{factura.numero}</div>
                    <div className="factura-cliente">{getNombreCliente(factura.clienteId)}</div>
                    <div className="factura-monto">{formatoCifra(factura.total)}</div>
                    <div className="factura-fecha">
                      {moment(factura.fechaVencimiento).format('DD/MM/YYYY')}
                      {factura.estado === 'vencida' && (
                        <span className="dias-mora">
                          {moment().diff(moment(factura.fechaVencimiento), 'days')} días
                        </span>
                      )}
                    </div>
                  </div>
                  {recordatorioEnviado(factura.id) && (
                    <div className="recordatorio-status">
                      ✓ Enviado
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tipoRecordatorio">Tipo de Recordatorio</label>
            <select
              id="tipoRecordatorio"
              value={tipoRecordatorio}
              onChange={(e) => setTipoRecordatorio(e.target.value as 'email' | 'sms' | 'llamada')}
              className="form-control"
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="llamada">Llamada telefónica (guión)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="mensaje">Mensaje</label>
            <textarea
              id="mensaje"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              className="form-control"
              rows={6}
              placeholder="Texto del recordatorio que se enviará al cliente"
            ></textarea>
            <p className="input-help">
              {tipoRecordatorio === 'email' ? 'El email incluirá automáticamente los detalles de las facturas pendientes.' :
              tipoRecordatorio === 'sms' ? 'Mantener el mensaje breve, máximo 160 caracteres.' :
              'Guión para la llamada telefónica. No se enviará al cliente.'}
            </p>
          </div>

          {error && (
            <div className="error-container">
              <p>{error}</p>
            </div>
          )}

          {recordatoriosEnviados.length > 0 && (
            <div className="success-container">
              <p>Se han enviado {recordatoriosEnviados.length} recordatorios exitosamente.</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="modal-cancel-button"
            onClick={onClose}
          >
            Cerrar
          </button>
          <button
            type="button"
            className="modal-confirm-button"
            onClick={handleEnviarRecordatorios}
            disabled={loading || facturas.length === recordatoriosEnviados.length}
          >
            {loading ? 'Enviando...' : 'Enviar Recordatorios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordatoriosPagoModal;
