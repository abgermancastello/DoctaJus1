import React, { useState, useEffect } from 'react';
import { Cliente, TipoCliente, CategoriaContacto } from '../../types';
import EtiquetasManager from '../directorio/EtiquetasManager';
import EventosManager from '../directorio/EventosManager';
import ArchivosManager from '../directorio/ArchivosManager';

interface ContactoFormProps {
  contacto?: Cliente;
  onSubmit: (contacto: Omit<Cliente, 'id' | 'fechaCreacion' | 'fechaActualizacion'>) => void;
  onCancel: () => void;
  isOpen: boolean;
}

const initialState: Omit<Cliente, 'id' | 'fechaCreacion' | 'fechaActualizacion'> = {
  nombre: '',
  apellido: '',
  razonSocial: '',
  tipo: TipoCliente.PERSONA,
  documento: '',
  email: '',
  telefono: '',
  direccion: '',
  notas: '',
  categorias: [],
  expedientesRelacionados: [],
  etiquetas: [],
  eventos: [],
  archivos: []
};

const ContactoForm: React.FC<ContactoFormProps> = ({ contacto, onSubmit, onCancel, isOpen }) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Estados para los nuevos modales
  const [showEtiquetasManager, setShowEtiquetasManager] = useState(false);
  const [showEventosManager, setShowEventosManager] = useState(false);
  const [showArchivosManager, setShowArchivosManager] = useState(false);

  // Establecer datos iniciales cuando se edita un contacto existente
  useEffect(() => {
    if (contacto) {
      setFormData({
        nombre: contacto.nombre,
        apellido: contacto.apellido || '',
        razonSocial: contacto.razonSocial || '',
        tipo: contacto.tipo,
        documento: contacto.documento,
        email: contacto.email,
        telefono: contacto.telefono,
        direccion: contacto.direccion,
        notas: contacto.notas || '',
        categorias: contacto.categorias || [],
        expedientesRelacionados: contacto.expedientesRelacionados || [],
        etiquetas: contacto.etiquetas || [],
        eventos: contacto.eventos || [],
        archivos: contacto.archivos || []
      });
    } else {
      setFormData(initialState);
    }
    setErrors({});
  }, [contacto, isOpen]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Limpiar el error cuando el usuario comienza a editar el campo
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Manejar cambios en las categorías (selección múltiple)
  const handleCategoriaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    const categoria = value as CategoriaContacto;

    setFormData(prev => {
      const categorias = [...(prev.categorias || [])];

      if (checked) {
        // Añadir categoría si no existe
        if (!categorias.includes(categoria)) {
          categorias.push(categoria);
        }
      } else {
        // Eliminar categoría
        const index = categorias.indexOf(categoria);
        if (index !== -1) {
          categorias.splice(index, 1);
        }
      }

      return { ...prev, categorias };
    });
  };

  // Manejar cambios en las etiquetas
  const handleEtiquetasChange = (etiquetaIds: string[]) => {
    setFormData(prev => ({ ...prev, etiquetas: etiquetaIds }));
  };

  // Validar el formulario antes de enviar
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (formData.tipo === TipoCliente.PERSONA) {
      if (!formData.apellido?.trim()) {
        newErrors.apellido = 'El apellido es obligatorio para personas';
      }
    } else if ([TipoCliente.EMPRESA, TipoCliente.PROVEEDOR, TipoCliente.JUZGADO, TipoCliente.ENTIDAD_GOBIERNO].includes(formData.tipo)) {
      if (!formData.razonSocial?.trim()) {
        newErrors.razonSocial = 'La razón social es obligatoria para este tipo de contacto';
      }
    }

    if (!formData.documento.trim()) {
      newErrors.documento = 'El documento/CUIT es obligatorio';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Manejar cambio de tipo de contacto
  const handleTipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tipo = e.target.value as TipoCliente;
    setFormData(prev => ({ ...prev, tipo }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="border-b px-6 py-4 flex justify-between items-center bg-gray-50 rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-800">
            {contacto ? 'Editar Contacto' : 'Nuevo Contacto'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Contacto
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleTipoChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value={TipoCliente.PERSONA}>Persona</option>
              <option value={TipoCliente.EMPRESA}>Empresa</option>
              <option value={TipoCliente.PROVEEDOR}>Proveedor</option>
              <option value={TipoCliente.COLABORADOR}>Colaborador</option>
              <option value={TipoCliente.ABOGADO_EXTERNO}>Abogado Externo</option>
              <option value={TipoCliente.JUZGADO}>Juzgado</option>
              <option value={TipoCliente.ENTIDAD_GOBIERNO}>Entidad Gubernamental</option>
              <option value={TipoCliente.OTRO}>Otro</option>
            </select>
          </div>

          {formData.tipo === TipoCliente.PERSONA || formData.tipo === TipoCliente.COLABORADOR || formData.tipo === TipoCliente.ABOGADO_EXTERNO ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${errors.apellido ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.apellido && <p className="text-red-500 text-xs mt-1">{errors.apellido}</p>}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Razón Social <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="razonSocial"
                  value={formData.razonSocial}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${errors.razonSocial ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.razonSocial && <p className="text-red-500 text-xs mt-1">{errors.razonSocial}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de Contacto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.tipo === TipoCliente.PERSONA ? 'DNI' : 'CUIT/ID'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="documento"
              value={formData.documento}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.documento ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.documento && <p className="text-red-500 text-xs mt-1">{errors.documento}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.telefono ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.direccion ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.direccion && <p className="text-red-500 text-xs mt-1">{errors.direccion}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categorías (opcional)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.values(CategoriaContacto).map((categoria) => (
                <div key={categoria} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`categoria-${categoria}`}
                    value={categoria}
                    checked={formData.categorias?.includes(categoria) || false}
                    onChange={handleCategoriaChange}
                    className="mr-2"
                  />
                  <label htmlFor={`categoria-${categoria}`} className="text-sm text-gray-700">
                    {categoria === CategoriaContacto.CLIENTE ? 'Cliente' :
                     categoria === CategoriaContacto.OPOSITOR ? 'Opositor' :
                     categoria === CategoriaContacto.TESTIGO ? 'Testigo' :
                     categoria === CategoriaContacto.PERITO ? 'Perito' :
                     categoria === CategoriaContacto.CONTRAPARTE ? 'Contraparte' :
                     categoria === CategoriaContacto.PROVEEDOR ? 'Proveedor' : 'Otro'}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md min-h-[100px]"
            />
          </div>

          {/* Sección de etiquetas, eventos y archivos */}
          {contacto && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Funciones adicionales</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowEtiquetasManager(true)}
                  className="flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  Etiquetas ({formData.etiquetas?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setShowEventosManager(true)}
                  className="flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-md hover:bg-green-100"
                  disabled={!contacto} // Solo disponible al editar contactos existentes
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Agenda
                </button>
                <button
                  type="button"
                  onClick={() => setShowArchivosManager(true)}
                  className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                  disabled={!contacto} // Solo disponible al editar contactos existentes
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  Archivos
                </button>
              </div>
            </div>
          )}

          <div className="border-t pt-4 mt-6 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition"
            >
              {contacto ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de etiquetas */}
      {showEtiquetasManager && (
        <EtiquetasManager
          selectedEtiquetas={formData.etiquetas || []}
          onChange={handleEtiquetasChange}
          isOpen={showEtiquetasManager}
          onClose={() => setShowEtiquetasManager(false)}
        />
      )}

      {/* Modal de eventos (solo disponible cuando se edita un contacto existente) */}
      {contacto && showEventosManager && (
        <EventosManager
          contactoId={contacto.id}
          isOpen={showEventosManager}
          onClose={() => setShowEventosManager(false)}
        />
      )}

      {/* Modal de archivos (solo disponible cuando se edita un contacto existente) */}
      {contacto && showArchivosManager && (
        <ArchivosManager
          contactoId={contacto.id}
          isOpen={showArchivosManager}
          onClose={() => setShowArchivosManager(false)}
        />
      )}
    </div>
  );
};

export default ContactoForm;
