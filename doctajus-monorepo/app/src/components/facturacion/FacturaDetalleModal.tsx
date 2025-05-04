import React from 'react';
import { Factura, EstadoFactura } from '../../stores/facturaStore';
import { Cliente } from '../../stores/tesoreriaStore';
import moment from 'moment';

interface FacturaDetalleModalProps {
  factura: Factura;
  onClose: () => void;
  cliente?: Cliente;
}

const FacturaDetalleModal: React.FC<FacturaDetalleModalProps> = ({
  factura,
  onClose,
  cliente
}) => {
  // Formatear cantidades monetarias
  const formatoCifra = (valor: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(valor);
  };

  // Obtener clase CSS para el estado
  const getClaseEstado = (estado: EstadoFactura): string => {
    switch (estado) {
      case 'borrador': return 'estado-borrador';
      case 'emitida': return 'estado-emitida';
      case 'pagada': return 'estado-pagada';
      case 'vencida': return 'estado-vencida';
      case 'anulada': return 'estado-anulada';
      default: return '';
    }
  };

  // Traducir estados a nombres amigables
  const traducirEstado = (estado: EstadoFactura): string => {
    switch (estado) {
      case 'borrador': return 'Borrador';
      case 'emitida': return 'Emitida';
      case 'pagada': return 'Pagada';
      case 'vencida': return 'Vencida';
      case 'anulada': return 'Anulada';
      default: return estado;
    }
  };

  // Preparar la factura para imprimir o exportar
  const prepararParaImprimir = () => {
    // Clonar el contenido para impresión
    const contenido = document.getElementById('factura-para-imprimir')?.cloneNode(true) as HTMLElement;

    if (!contenido) return;

    // Crear ventana de impresión
    const ventanaImpresion = window.open('', '_blank');
    if (!ventanaImpresion) {
      alert('Por favor, permite ventanas emergentes para esta acción');
      return;
    }

    // Estilos para la impresión
    const estilos = `
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
      .factura-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
      .factura-titulo { font-size: 24px; font-weight: bold; color: #2a3f54; }
      .datos-cliente { margin-bottom: 20px; }
      h3 { margin: 10px 0; color: #2a3f54; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th { background-color: #f5f5f5; text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
      td { padding: 8px; border-bottom: 1px solid #ddd; }
      .totales { text-align: right; margin-top: 20px; }
      .total-final { font-weight: bold; font-size: 18px; margin-top: 10px; }
      .observaciones { margin-top: 20px; padding: 10px; background-color: #f9f9f9; border-radius: 4px; }
      .estado { display: inline-block; padding: 5px 10px; border-radius: 4px; font-weight: bold; }
      .estado-borrador { background-color: #e9ecef; color: #495057; }
      .estado-emitida { background-color: #e3f2fd; color: #0d47a1; }
      .estado-pagada { background-color: #e8f5e9; color: #1b5e20; }
      .estado-vencida { background-color: #fff3e0; color: #e65100; }
      .estado-anulada { background-color: #f5f5f5; color: #757575; text-decoration: line-through; }
    `;

    // Configurar contenido de la ventana
    ventanaImpresion.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Factura ${factura.numero}</title>
          <style>${estilos}</style>
        </head>
        <body>
          ${contenido.outerHTML}
        </body>
      </html>
    `);

    ventanaImpresion.document.close();

    // Imprimir después de cargar
    ventanaImpresion.onload = () => {
      ventanaImpresion.print();
      // No cerrar la ventana para permitir otras acciones como guardar como PDF
    };
  };

  // Exportar como PDF (simulado - en un entorno real se usaría una biblioteca específica)
  const exportarPDF = () => {
    alert('En una implementación real, aquí se generaría un PDF utilizando una biblioteca específica.');
    // En una implementación real, aquí se usaría algo como jsPDF, pdfmake, o una API del backend
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container factura-detalle-modal">
        <div className="modal-header">
          <h2 className="modal-title">
            Factura {factura.numero}
          </h2>
          <div className="modal-actions">
            <button
              className="btn-imprimir"
              onClick={prepararParaImprimir}
              title="Imprimir factura"
            >
              Imprimir
            </button>
            <button
              className="btn-exportar"
              onClick={exportarPDF}
              title="Exportar como PDF"
            >
              Exportar PDF
            </button>
            <button
              className="modal-close-button"
              onClick={onClose}
              title="Cerrar"
            >×</button>
          </div>
        </div>

        <div className="modal-content">
          {/* Contenido visible y para impresión */}
          <div id="factura-para-imprimir" className="factura-contenido">
            <div className="factura-header">
              <div className="factura-info">
                <div className="factura-titulo">Factura {factura.numero}</div>
                <div>Fecha de emisión: {moment(factura.fecha).format('DD/MM/YYYY')}</div>
                <div>Fecha de vencimiento: {moment(factura.fechaVencimiento).format('DD/MM/YYYY')}</div>
                <div className="factura-estado">
                  Estado: <span className={`estado ${getClaseEstado(factura.estado)}`}>
                    {traducirEstado(factura.estado)}
                  </span>
                </div>
              </div>

              <div className="empresa-info">
                <h3>DOCTAJUS</h3>
                <div>Servicios Legales</div>
                <div>CUIT: XX-XXXXXXXX-X</div>
                <div>Dirección: Av. Ejemplo 123</div>
                <div>Tel: (XXX) XXX-XXXX</div>
              </div>
            </div>

            <div className="datos-cliente">
              <h3>Cliente</h3>
              <div>
                <strong>Nombre:</strong> {cliente?.nombre || 'Cliente no encontrado'}
              </div>
              {/* En un caso real, aquí se mostrarían más datos del cliente como CUIT, dirección, etc. */}
            </div>

            <h3>Detalles</h3>
            <div className="tabla-detalles">
              <table>
                <thead>
                  <tr>
                    <th>Descripción</th>
                    <th>Cantidad</th>
                    <th>Precio Unitario</th>
                    <th>Impuesto (%)</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {factura.detalles.map((detalle, index) => (
                    <tr key={index}>
                      <td>{detalle.descripcion}</td>
                      <td>{detalle.cantidad}</td>
                      <td>{formatoCifra(detalle.precioUnitario)}</td>
                      <td>{detalle.impuesto}%</td>
                      <td>{formatoCifra(detalle.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="totales">
              <div>Subtotal: {formatoCifra(factura.subtotal)}</div>
              <div>Impuestos: {formatoCifra(factura.impuestos)}</div>
              <div className="total-final">Total: {formatoCifra(factura.total)}</div>
            </div>

            {factura.observaciones && (
              <div className="observaciones">
                <h3>Observaciones</h3>
                <p>{factura.observaciones}</p>
              </div>
            )}

            {factura.expedienteId && (
              <div className="datos-expediente">
                <h3>Expediente relacionado</h3>
                <p>ID de Expediente: {factura.expedienteId}</p>
              </div>
            )}

            <div className="factura-footer">
              <p>Factura generada por: {factura.creadoPor}</p>
              <p>Fecha de generación: {moment(factura.creadoEn).format('DD/MM/YYYY HH:mm')}</p>
              {factura.actualizadoEn && (
                <p>Última actualización: {moment(factura.actualizadoEn).format('DD/MM/YYYY HH:mm')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacturaDetalleModal;
