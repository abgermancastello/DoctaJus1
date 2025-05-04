import React, { useState, useEffect } from 'react';
import { Etiqueta } from '../../types';
import { etiquetaService } from '../../services/api';
import { useUIStore } from '../../stores/uiStore';

interface EtiquetasManagerProps {
  selectedEtiquetas: string[];
  onChange: (etiquetaIds: string[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

const EtiquetasManager: React.FC<EtiquetasManagerProps> = ({
  selectedEtiquetas,
  onChange,
  isOpen,
  onClose
}) => {
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEtiqueta, setEditingEtiqueta] = useState<Etiqueta | null>(null);

  // Para la nueva etiqueta
  const [nombreEtiqueta, setNombreEtiqueta] = useState('');
  const [colorEtiqueta, setColorEtiqueta] = useState('#4CAF50');
  const [descripcionEtiqueta, setDescripcionEtiqueta] = useState('');

  const { addNotification } = useUIStore();

  // Cargar etiquetas existentes
  useEffect(() => {
    if (isOpen) {
      fetchEtiquetas();
    }
  }, [isOpen]);

  const fetchEtiquetas = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await etiquetaService.getEtiquetas();
      setEtiquetas(data.etiquetas);
      setIsLoading(false);
    } catch (err) {
      console.error('Error cargando etiquetas:', err);
      setError('No se pudieron cargar las etiquetas');
      setIsLoading(false);
    }
  };

  // Manejo de selección de etiqueta
  const handleEtiquetaToggle = (etiquetaId: string) => {
    let updatedIds = [...selectedEtiquetas];

    if (updatedIds.includes(etiquetaId)) {
      updatedIds = updatedIds.filter(id => id !== etiquetaId);
    } else {
      updatedIds.push(etiquetaId);
    }

    onChange(updatedIds);
  };

  // Abrir formulario para nueva etiqueta
  const handleNewEtiqueta = () => {
    setNombreEtiqueta('');
    setColorEtiqueta('#4CAF50');
    setDescripcionEtiqueta('');
    setEditingEtiqueta(null);
    setShowForm(true);
  };

  // Abrir formulario para editar etiqueta
  const handleEditEtiqueta = (etiqueta: Etiqueta) => {
    setNombreEtiqueta(etiqueta.nombre);
    setColorEtiqueta(etiqueta.color);
    setDescripcionEtiqueta(etiqueta.descripcion || '');
    setEditingEtiqueta(etiqueta);
    setShowForm(true);
  };

  // Eliminar etiqueta
  const handleDeleteEtiqueta = async (id: string) => {
    if (window.confirm('¿Está seguro que desea eliminar esta etiqueta?')) {
      try {
        await etiquetaService.deleteEtiqueta(id);

        // Actualizar la lista local
        setEtiquetas(prevEtiquetas => prevEtiquetas.filter(e => e.id !== id));

        // Si estaba seleccionada, quitarla de la selección
        if (selectedEtiquetas.includes(id)) {
          onChange(selectedEtiquetas.filter(etiquetaId => etiquetaId !== id));
        }

        addNotification({
          type: 'success',
          message: 'Etiqueta eliminada correctamente'
        });
      } catch (error) {
        console.error('Error eliminando etiqueta:', error);
        addNotification({
          type: 'error',
          message: 'No se pudo eliminar la etiqueta'
        });
      }
    }
  };

  // Guardar nueva etiqueta o actualizar existente
  const handleSaveEtiqueta = async () => {
    if (!nombreEtiqueta.trim()) {
      addNotification({
        type: 'error',
        message: 'El nombre de la etiqueta es obligatorio'
      });
      return;
    }

    try {
      const etiquetaData = {
        nombre: nombreEtiqueta,
        color: colorEtiqueta,
        descripcion: descripcionEtiqueta
      };

      let result: { etiqueta: Etiqueta };

      if (editingEtiqueta) {
        // Actualizar etiqueta existente
        result = await etiquetaService.updateEtiqueta(editingEtiqueta.id, etiquetaData);

        // Actualizar la lista local
        setEtiquetas(prevEtiquetas =>
          prevEtiquetas.map(e => e.id === editingEtiqueta.id ? result.etiqueta : e)
        );

        addNotification({
          type: 'success',
          message: 'Etiqueta actualizada correctamente'
        });
      } else {
        // Crear nueva etiqueta
        result = await etiquetaService.createEtiqueta(etiquetaData);

        // Añadir a la lista local
        setEtiquetas(prevEtiquetas => [...prevEtiquetas, result.etiqueta]);

        addNotification({
          type: 'success',
          message: 'Etiqueta creada correctamente'
        });
      }

      // Limpiar formulario y cerrar
      setShowForm(false);
      setEditingEtiqueta(null);
      setNombreEtiqueta('');
      setColorEtiqueta('#4CAF50');
      setDescripcionEtiqueta('');
    } catch (error) {
      console.error('Error guardando etiqueta:', error);
      addNotification({
        type: 'error',
        message: 'No se pudo guardar la etiqueta'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="border-b px-6 py-4 flex justify-between items-center bg-gray-50 rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-800">Administrar Etiquetas</h2>
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
                    {editingEtiqueta ? 'Editar Etiqueta' : 'Nueva Etiqueta'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={nombreEtiqueta}
                        onChange={(e) => setNombreEtiqueta(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={colorEtiqueta}
                          onChange={(e) => setColorEtiqueta(e.target.value)}
                          className="p-1 border border-gray-300 rounded"
                        />
                        <span>{colorEtiqueta}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                      </label>
                      <textarea
                        value={descripcionEtiqueta}
                        onChange={(e) => setDescripcionEtiqueta(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        rows={3}
                      />
                    </div>
                    <div className="flex space-x-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveEtiqueta}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleNewEtiqueta}
                  className="mb-4 flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Nueva Etiqueta
                </button>
              )}

              <div className="space-y-2">
                {etiquetas.length === 0 ? (
                  <p className="text-gray-500 text-center p-4">No hay etiquetas disponibles. Cree una nueva.</p>
                ) : (
                  etiquetas.map(etiqueta => (
                    <div key={etiqueta.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedEtiquetas.includes(etiqueta.id)}
                          onChange={() => handleEtiquetaToggle(etiqueta.id)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: etiqueta.color }}
                        ></span>
                        <div>
                          <p className="font-medium">{etiqueta.nombre}</p>
                          {etiqueta.descripcion && (
                            <p className="text-sm text-gray-500">{etiqueta.descripcion}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEditEtiqueta(etiqueta)}
                          className="p-1 text-gray-500 hover:text-indigo-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteEtiqueta(etiqueta.id)}
                          className="p-1 text-gray-500 hover:text-red-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
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

export default EtiquetasManager;
