import React, { useState, useEffect } from 'react';
import { Cliente, TipoCliente, CategoriaContacto, Expediente, Etiqueta, Evento, ArchivoAdjunto, EstadoExpediente } from '../../types';
import { expedienteService, etiquetaService, eventoService, archivoService } from '../../services/api';
import EventosManager from './EventosManager';
import ArchivosManager from './ArchivosManager';

interface DetalleContactoProps {
  contacto: Cliente;
  onClose: () => void;
  onEdit: () => void;
}

const DetalleContacto: React.FC<DetalleContactoProps> = ({ contacto, onClose, onEdit }) => {
  const [expedientesRelacionados, setExpedientesRelacionados] = useState<Expediente[]>([]);
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [archivos, setArchivos] = useState<ArchivoAdjunto[]>([]);
  const [isLoadingExpedientes, setIsLoadingExpedientes] = useState(true);
  const [isLoadingEtiquetas, setIsLoadingEtiquetas] = useState(true);
  const [isLoadingEventos, setIsLoadingEventos] = useState(true);
  const [isLoadingArchivos, setIsLoadingArchivos] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showEventosManager, setShowEventosManager] = useState(false);
  const [showArchivosManager, setShowArchivosManager] = useState(false);

  // Cargar expedientes relacionados
  useEffect(() => {
    const fetchExpedientes = async () => {
      if (!contacto.expedientesRelacionados || contacto.expedientesRelacionados.length === 0) {
        setIsLoadingExpedientes(false);
        return;
      }

      try {
        setIsLoadingExpedientes(true);
        const expedientesPromises = contacto.expedientesRelacionados.map(id =>
          expedienteService.getExpedienteById(id)
        );

        const results = await Promise.all(expedientesPromises);
        const expedientes = results.map(result => result.expediente).filter(Boolean);

        setExpedientesRelacionados(expedientes);
        setIsLoadingExpedientes(false);
      } catch (err) {
        console.error('Error al cargar expedientes relacionados:', err);
        setError('No se pudieron cargar los expedientes relacionados');
        setIsLoadingExpedientes(false);
      }
    };

    fetchExpedientes();
  }, [contacto.expedientesRelacionados]);

  // Cargar etiquetas
  useEffect(() => {
    const fetchEtiquetas = async () => {
      if (!contacto.etiquetas || contacto.etiquetas.length === 0) {
        setIsLoadingEtiquetas(false);
        return;
      }

      try {
        setIsLoadingEtiquetas(true);
        const etiquetasPromises = contacto.etiquetas.map(id =>
          etiquetaService.getEtiquetaById(id)
        );

        const results = await Promise.all(etiquetasPromises);
        const etiquetasData = results.map(result => result.etiqueta).filter(Boolean);

        setEtiquetas(etiquetasData);
        setIsLoadingEtiquetas(false);
      } catch (err) {
        console.error('Error al cargar etiquetas:', err);
        setIsLoadingEtiquetas(false);
      }
    };

    fetchEtiquetas();
  }, [contacto.etiquetas]);

  // Cargar próximos eventos
  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setIsLoadingEventos(true);
        const response = await eventoService.getEventos({ contactoId: contacto.id });

        // Ordenar por fecha (próximos primero) y limitar a 3
        const eventosOrdenados = response.eventos
          .filter((e: Evento) => !e.completado) // Solo mostrar los pendientes
          .sort((a: Evento, b: Evento) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime())
          .slice(0, 3);

        setEventos(eventosOrdenados);
        setIsLoadingEventos(false);
      } catch (err) {
        console.error('Error al cargar eventos:', err);
        setIsLoadingEventos(false);
      }
    };

    fetchEventos();
  }, [contacto.id]);

  // Cargar archivos recientes
  useEffect(() => {
    const fetchArchivos = async () => {
      try {
        setIsLoadingArchivos(true);
        const response = await archivoService.getArchivos({ contactoId: contacto.id });

        // Ordenar por fecha (más recientes primero) y limitar a 3
        const archivosOrdenados = response.archivos
          .sort((a: ArchivoAdjunto, b: ArchivoAdjunto) => new Date(b.fechaSubida).getTime() - new Date(a.fechaSubida).getTime())
          .slice(0, 3);

        setArchivos(archivosOrdenados);
        setIsLoadingArchivos(false);
      } catch (err) {
        console.error('Error al cargar archivos:', err);
        setIsLoadingArchivos(false);
      }
    };

    fetchArchivos();
  }, [contacto.id]);

  // Obtener texto legible para el tipo de contacto
  const getTipoContactoTexto = (tipo: TipoCliente) => {
    switch (tipo) {
      case TipoCliente.PERSONA:
        return 'Persona';
      case TipoCliente.EMPRESA:
        return 'Empresa';
      case TipoCliente.PROVEEDOR:
        return 'Proveedor';
      case TipoCliente.COLABORADOR:
        return 'Colaborador';
      case TipoCliente.ABOGADO_EXTERNO:
        return 'Abogado Externo';
      case TipoCliente.JUZGADO:
        return 'Juzgado';
      case TipoCliente.ENTIDAD_GOBIERNO:
        return 'Entidad Gubernamental';
      case TipoCliente.OTRO:
        return 'Otro';
      default:
        return tipo;
    }
  };

  // Obtener color de fondo según tipo
  const getTipoContactoClases = (tipo: TipoCliente) => {
    switch (tipo) {
      case TipoCliente.PERSONA:
        return 'bg-blue-100 text-blue-800';
      case TipoCliente.EMPRESA:
        return 'bg-green-100 text-green-800';
      case TipoCliente.PROVEEDOR:
        return 'bg-purple-100 text-purple-800';
      case TipoCliente.COLABORADOR:
        return 'bg-yellow-100 text-yellow-800';
      case TipoCliente.ABOGADO_EXTERNO:
        return 'bg-indigo-100 text-indigo-800';
      case TipoCliente.JUZGADO:
        return 'bg-red-100 text-red-800';
      case TipoCliente.ENTIDAD_GOBIERNO:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="border-b px-6 py-4 flex justify-between items-center bg-gray-50 rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-800">
            {contacto.tipo === TipoCliente.PERSONA
              ? `${contacto.nombre} ${contacto.apellido || ''}`
              : contacto.razonSocial || contacto.nombre}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={onEdit}
              className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Editar
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6 flex flex-wrap gap-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTipoContactoClases(contacto.tipo)}`}>
              {getTipoContactoTexto(contacto.tipo)}
            </span>

            {contacto.categorias && contacto.categorias.length > 0 &&
              contacto.categorias.map(categoria => (
                <span key={categoria} className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                  {categoria === CategoriaContacto.CLIENTE ? 'Cliente' :
                   categoria === CategoriaContacto.OPOSITOR ? 'Opositor' :
                   categoria === CategoriaContacto.TESTIGO ? 'Testigo' :
                   categoria === CategoriaContacto.PERITO ? 'Perito' :
                   categoria === CategoriaContacto.CONTRAPARTE ? 'Contraparte' :
                   categoria === CategoriaContacto.PROVEEDOR ? 'Proveedor' : 'Otro'}
                </span>
              ))
            }

            {!isLoadingEtiquetas && etiquetas.map(etiqueta => (
              <span
                key={etiqueta.id}
                className="px-2 py-1 text-xs font-semibold rounded-full"
                style={{ backgroundColor: etiqueta.color, color: '#fff' }}
              >
                {etiqueta.nombre}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Información General</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                {contacto.tipo === TipoCliente.PERSONA || contacto.tipo === TipoCliente.COLABORADOR || contacto.tipo === TipoCliente.ABOGADO_EXTERNO ? (
                  <>
                    <div className="mb-3">
                      <p className="text-xs text-gray-500">Nombre y Apellido</p>
                      <p className="font-medium">{contacto.nombre} {contacto.apellido}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-3">
                      <p className="text-xs text-gray-500">Razón Social</p>
                      <p className="font-medium">{contacto.razonSocial}</p>
                    </div>
                    <div className="mb-3">
                      <p className="text-xs text-gray-500">Nombre de Contacto</p>
                      <p className="font-medium">{contacto.nombre}</p>
                    </div>
                  </>
                )}
                <div className="mb-3">
                  <p className="text-xs text-gray-500">{contacto.tipo === TipoCliente.PERSONA ? 'DNI' : 'CUIT/ID'}</p>
                  <p className="font-medium">{contacto.documento}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Información de Contacto</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="mb-3">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium">{contacto.email}</p>
                </div>
                <div className="mb-3">
                  <p className="text-xs text-gray-500">Teléfono</p>
                  <p className="font-medium">{contacto.telefono}</p>
                </div>
                <div className="mb-3">
                  <p className="text-xs text-gray-500">Dirección</p>
                  <p className="font-medium">{contacto.direccion}</p>
                </div>
              </div>
            </div>
          </div>

          {contacto.notas && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Notas</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="whitespace-pre-line">{contacto.notas}</p>
              </div>
            </div>
          )}

          {/* Próximos eventos */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-medium text-gray-500">Próximos eventos</h3>
              <button
                onClick={() => setShowEventosManager(true)}
                className="text-xs text-indigo-600 hover:text-indigo-800"
              >
                Ver todos
              </button>
            </div>

            {isLoadingEventos ? (
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <p className="text-gray-500">Cargando eventos...</p>
              </div>
            ) : eventos.length > 0 ? (
              <div className="bg-gray-50 p-4 rounded-md">
                <ul className="divide-y divide-gray-200">
                  {eventos.map(evento => (
                    <li key={evento.id} className="py-2">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{evento.titulo}</p>
                          <p className="text-sm text-gray-500">{formatDate(evento.fechaInicio.toString())}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${evento.tipo === 'reunion' ? 'bg-blue-100 text-blue-800' :
                            evento.tipo === 'llamada' ? 'bg-green-100 text-green-800' :
                            evento.tipo === 'audiencia' ? 'bg-purple-100 text-purple-800' :
                            evento.tipo === 'vencimiento' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'}`}
                        >
                          {evento.tipo === 'reunion' ? 'Reunión' :
                           evento.tipo === 'llamada' ? 'Llamada' :
                           evento.tipo === 'audiencia' ? 'Audiencia' :
                           evento.tipo === 'vencimiento' ? 'Vencimiento' : 'Otro'}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <p className="text-gray-500">No hay eventos programados</p>
              </div>
            )}
          </div>

          {/* Archivos recientes */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-medium text-gray-500">Archivos recientes</h3>
              <button
                onClick={() => setShowArchivosManager(true)}
                className="text-xs text-indigo-600 hover:text-indigo-800"
              >
                Ver todos
              </button>
            </div>

            {isLoadingArchivos ? (
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <p className="text-gray-500">Cargando archivos...</p>
              </div>
            ) : archivos.length > 0 ? (
              <div className="bg-gray-50 p-4 rounded-md">
                <ul className="divide-y divide-gray-200">
                  {archivos.map(archivo => (
                    <li key={archivo.id} className="py-2">
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <span className="mr-2">
                            {archivo.tipo === 'imagen' ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </span>
                          <div>
                            <p className="font-medium">{archivo.nombre}.{archivo.extension}</p>
                            <p className="text-xs text-gray-500">Subido el {formatDate(archivo.fechaSubida.toString())}</p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <p className="text-gray-500">No hay archivos adjuntos</p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Expedientes relacionados</h3>
            {isLoadingExpedientes ? (
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <p className="text-gray-500">Cargando expedientes...</p>
              </div>
            ) : error ? (
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <p className="text-red-500">{error}</p>
              </div>
            ) : expedientesRelacionados.length > 0 ? (
              <div className="bg-gray-50 p-4 rounded-md">
                <ul className="divide-y divide-gray-200">
                  {expedientesRelacionados.map(expediente => (
                    <li key={expediente.id} className="py-3">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{expediente.titulo}</p>
                          <p className="text-sm text-gray-500">Expediente Nº {expediente.numero}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${expediente.estado === EstadoExpediente.ABIERTO ? 'bg-green-100 text-green-800' :
                            expediente.estado === EstadoExpediente.EN_PROCESO ? 'bg-yellow-100 text-yellow-800' :
                            expediente.estado === EstadoExpediente.CERRADO ? 'bg-red-100 text-red-800' :
                            expediente.estado === EstadoExpediente.ARCHIVADO ? 'bg-gray-100 text-gray-800' :
                            'bg-gray-100 text-gray-800'}`}
                        >
                          {expediente.estado === EstadoExpediente.ABIERTO ? 'Abierto' :
                           expediente.estado === EstadoExpediente.EN_PROCESO ? 'En Proceso' :
                           expediente.estado === EstadoExpediente.CERRADO ? 'Cerrado' :
                           expediente.estado === EstadoExpediente.ARCHIVADO ? 'Archivado' : 'Desconocido'}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <p className="text-gray-500">No hay expedientes relacionados</p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Modal de eventos */}
      {showEventosManager && (
        <EventosManager
          contactoId={contacto.id}
          isOpen={showEventosManager}
          onClose={() => setShowEventosManager(false)}
        />
      )}

      {/* Modal de archivos */}
      {showArchivosManager && (
        <ArchivosManager
          contactoId={contacto.id}
          isOpen={showArchivosManager}
          onClose={() => setShowArchivosManager(false)}
        />
      )}
    </div>
  );
};

export default DetalleContacto;
