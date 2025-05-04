import React, { useState, useEffect, useRef } from 'react';
import { ArchivoAdjunto, TipoArchivo } from '../../types';
import { archivoService } from '../../services/api';
import { useUIStore } from '../../stores/uiStore';

interface ArchivosManagerProps {
  contactoId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ArchivosManager: React.FC<ArchivosManagerProps> = ({
  contactoId,
  isOpen,
  onClose
}) => {
  const [archivos, setArchivos] = useState<ArchivoAdjunto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Campos para el formulario
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<TipoArchivo>(TipoArchivo.DOCUMENTO);
  const [archivo, setArchivo] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addNotification } = useUIStore();

  // Cargar archivos del contacto
  useEffect(() => {
    if (isOpen && contactoId) {
      fetchArchivos();
    }
  }, [isOpen, contactoId]);

  const fetchArchivos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await archivoService.getArchivos({ contactoId });
      setArchivos(data.archivos);
      setIsLoading(false);
    } catch (err) {
      console.error('Error cargando archivos:', err);
      setError('No se pudieron cargar los archivos');
      setIsLoading(false);
    }
  };

  // Formatear tamaño del archivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Obtener texto para el tipo de archivo
  const getTipoArchivoTexto = (tipo: TipoArchivo) => {
    switch (tipo) {
      case TipoArchivo.DOCUMENTO:
        return 'Documento';
      case TipoArchivo.IMAGEN:
        return 'Imagen';
      case TipoArchivo.CONTRATO:
        return 'Contrato';
      case TipoArchivo.IDENTIFICACION:
        return 'Identificación';
      case TipoArchivo.OTRO:
        return 'Otro';
      default:
        return tipo;
    }
  };

  // Obtener icono según tipo y extensión
  const getFileIcon = (tipo: TipoArchivo, extension: string) => {
    if (tipo === TipoArchivo.IMAGEN || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension.toLowerCase())) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      );
    } else if (['pdf'].includes(extension.toLowerCase())) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          <path fillRule="evenodd" d="M8 11a1 1 0 112 0v3a1 1 0 11-2 0v-3zm4-3a1 1 0 00-1 1v5a1 1 0 102 0V9a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    } else if (['doc', 'docx', 'txt', 'rtf'].includes(extension.toLowerCase())) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    }
  };

  // Abrir formulario para nuevo archivo
  const handleNewArchivo = () => {
    setNombre('');
    setTipo(TipoArchivo.DOCUMENTO);
    setArchivo(null);
    setShowForm(true);
    setUploadProgress(0);
  };

  // Manejar selección de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      setArchivo(selectedFile);

      // Si no se ha ingresado un nombre, usar el nombre del archivo
      if (!nombre) {
        // Quitar la extensión para el nombre
        setNombre(selectedFile.name.split('.')[0]);
      }

      // Detectar tipo de archivo por extensión
      const extension = selectedFile.name.split('.').pop()?.toLowerCase() || '';
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
        setTipo(TipoArchivo.IMAGEN);
      } else if (['pdf'].includes(extension) && (nombre.toLowerCase().includes('dni') || nombre.toLowerCase().includes('identificacion'))) {
        setTipo(TipoArchivo.IDENTIFICACION);
      } else if (['pdf', 'doc', 'docx'].includes(extension) && (nombre.toLowerCase().includes('contrato'))) {
        setTipo(TipoArchivo.CONTRATO);
      } else {
        setTipo(TipoArchivo.DOCUMENTO);
      }
    }
  };

  // Validar formulario
  const validateForm = () => {
    if (!nombre.trim()) {
      addNotification({
        type: 'error',
        message: 'El nombre del archivo es obligatorio'
      });
      return false;
    }

    if (!archivo) {
      addNotification({
        type: 'error',
        message: 'Debe seleccionar un archivo'
      });
      return false;
    }

    return true;
  };

  // Simular carga de archivo (con mock)
  const simulateUploadProgress = () => {
    setUploadProgress(0);
    setIsUploading(true);

    const interval = setInterval(() => {
      setUploadProgress(prevProgress => {
        const newProgress = prevProgress + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return newProgress;
      });
    }, 300);

    return () => clearInterval(interval);
  };

  // Guardar archivo
  const handleSaveArchivo = async () => {
    if (!validateForm() || !archivo) return;

    try {
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('archivo', archivo);
      formData.append('nombre', nombre);
      formData.append('tipo', tipo);
      formData.append('contactoId', contactoId);
      formData.append('extension', archivo.name.split('.').pop() || '');

      // Simular progreso de carga
      const clearSimulation = simulateUploadProgress();

      // Enviar al servidor (o mock)
      const result = await archivoService.createArchivo(formData);

      // Limpiar simulación
      clearSimulation();
      setUploadProgress(100);

      // Añadir a la lista local
      setArchivos(prevArchivos => [...prevArchivos, result.archivo]);

      addNotification({
        type: 'success',
        message: 'Archivo subido correctamente'
      });

      // Limpiar formulario y cerrar
      setTimeout(() => {
        setShowForm(false);
        setUploadProgress(0);
        setIsUploading(false);
      }, 500);
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      setIsUploading(false);
      addNotification({
        type: 'error',
        message: 'No se pudo subir el archivo'
      });
    }
  };

  // Eliminar archivo
  const handleDeleteArchivo = async (id: string) => {
    if (window.confirm('¿Está seguro que desea eliminar este archivo?')) {
      try {
        await archivoService.deleteArchivo(id);

        // Actualizar la lista local
        setArchivos(prevArchivos => prevArchivos.filter(a => a.id !== id));

        addNotification({
          type: 'success',
          message: 'Archivo eliminado correctamente'
        });
      } catch (error) {
        console.error('Error eliminando archivo:', error);
        addNotification({
          type: 'error',
          message: 'No se pudo eliminar el archivo'
        });
      }
    }
  };

  // Descargar archivo (simulado en mock)
  const handleDownloadArchivo = (archivo: ArchivoAdjunto) => {
    // En ambiente de mock, mostrar mensaje informativo
    if (archivo.url.includes('/uploads/mock/')) {
      addNotification({
        type: 'info',
        message: 'Esta es una simulación. En un entorno real, el archivo se descargaría.'
      });
      return;
    }

    // En producción, descargar el archivo
    const link = document.createElement('a');
    link.href = archivo.url;
    link.download = archivo.nombre + '.' + archivo.extension;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="border-b px-6 py-4 flex justify-between items-center bg-gray-50 rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-800">Archivos del Contacto</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">{error}</div>
          ) : (
            <>
              {showForm ? (
                <div className="mb-6 bg-gray-50 p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-3">
                    Subir Nuevo Archivo
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Archivo <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Ej: Contrato de servicios"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Archivo
                      </label>
                      <select
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value as TipoArchivo)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value={TipoArchivo.DOCUMENTO}>Documento</option>
                        <option value={TipoArchivo.IMAGEN}>Imagen</option>
                        <option value={TipoArchivo.CONTRATO}>Contrato</option>
                        <option value={TipoArchivo.IDENTIFICACION}>Identificación</option>
                        <option value={TipoArchivo.OTRO}>Otro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Archivo <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6 cursor-pointer hover:bg-gray-50"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <div className="space-y-1 text-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                              <span>Seleccionar archivo</span>
                            </label>
                            <p className="pl-1">o arrastrar y soltar</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            {archivo ? archivo.name : 'PDF, Word, Imágenes hasta 10MB'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {isUploading && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                        <p className="text-right text-xs text-gray-500 mt-1">{uploadProgress}% completado</p>
                      </div>
                    )}

                    <div className="flex space-x-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        disabled={isUploading}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveArchivo}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                        disabled={isUploading}
                      >
                        {isUploading ? 'Subiendo...' : 'Subir Archivo'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleNewArchivo}
                  className="mb-4 flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Subir Archivo
                </button>
              )}

              <div className="space-y-3">
                {archivos.length === 0 ? (
                  <p className="text-gray-500 text-center p-4">No hay archivos adjuntos para este contacto.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {archivos.map(archivo => (
                      <div key={archivo.id} className="border rounded-md overflow-hidden">
                        <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b">
                          <span className="text-xs font-medium text-gray-500">
                            {getTipoArchivoTexto(archivo.tipo)}
                          </span>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleDownloadArchivo(archivo)}
                              className="p-1 text-gray-500 hover:text-indigo-600"
                              title="Descargar archivo"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteArchivo(archivo.id)}
                              className="p-1 text-gray-500 hover:text-red-600"
                              title="Eliminar archivo"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="p-4 flex">
                          <div className="flex-shrink-0 mr-3">
                            {getFileIcon(archivo.tipo, archivo.extension)}
                          </div>
                          <div>
                            <h3 className="font-medium">{archivo.nombre}</h3>
                            <p className="text-gray-500 text-sm">{formatFileSize(archivo.tamanio)}</p>
                            <p className="text-gray-500 text-xs">Subido el {formatDate(archivo.fechaSubida.toString())}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
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
    </div>
  );
};

export default ArchivosManager;
