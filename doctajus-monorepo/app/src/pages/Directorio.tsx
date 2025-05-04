import React, { useState, useEffect } from 'react';
import { clienteService, etiquetaService } from '../services/api';
import { Cliente, TipoCliente, Etiqueta } from '../types';
import DetalleContacto from '../components/directorio/DetalleContacto';
import ContactoForm from '../components/forms/ContactoForm';
import ImportExportButtons from '../components/directorio/ImportExportButtons';
import { useUIStore } from '../stores/uiStore';

const Directorio = () => {
  const [contactos, setContactos] = useState<Cliente[]>([]);
  const [filteredContactos, setFilteredContactos] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('todos');
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [filterEtiqueta, setFilterEtiqueta] = useState<string>('');

  // Estado para el contacto seleccionado (para ver detalles)
  const [selectedContacto, setSelectedContacto] = useState<Cliente | null>(null);

  // Estado para el formulario
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContacto, setEditingContacto] = useState<Cliente | undefined>(undefined);

  // Store UI para notificaciones
  const { addNotification } = useUIStore();

  // Cargar los contactos y etiquetas al montar el componente
  useEffect(() => {
    fetchContactos();
    fetchEtiquetas();
  }, []);

  const fetchContactos = async () => {
    try {
      setIsLoading(true);
      const data = await clienteService.getClientes();
      setContactos(data.clientes);
      setFilteredContactos(data.clientes);
      setIsLoading(false);
    } catch (err) {
      setError('Error al cargar los contactos');
      setIsLoading(false);
      console.error('Error fetching contactos:', err);
      addNotification({
        type: 'error',
        message: 'No se pudieron cargar los contactos. Por favor, intente de nuevo.'
      });
    }
  };

  const fetchEtiquetas = async () => {
    try {
      const data = await etiquetaService.getEtiquetas();
      setEtiquetas(data.etiquetas);
    } catch (err) {
      console.error('Error fetching etiquetas:', err);
    }
  };

  // Filtrar contactos según el término de búsqueda, el tipo y la etiqueta
  useEffect(() => {
    let result = contactos;

    // Filtrar por tipo
    if (filterType !== 'todos') {
      result = result.filter(contacto => contacto.tipo === filterType);
    }

    // Filtrar por etiqueta
    if (filterEtiqueta) {
      result = result.filter(contacto =>
        contacto.etiquetas?.includes(filterEtiqueta)
      );
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(contacto =>
        contacto.nombre.toLowerCase().includes(term) ||
        (contacto.apellido && contacto.apellido.toLowerCase().includes(term)) ||
        (contacto.razonSocial && contacto.razonSocial.toLowerCase().includes(term)) ||
        contacto.email.toLowerCase().includes(term) ||
        contacto.documento.toLowerCase().includes(term)
      );
    }

    setFilteredContactos(result);
  }, [searchTerm, filterType, filterEtiqueta, contactos]);

  // Manejar cambio en el término de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Manejar cambio en el filtro de tipo
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value);
  };

  // Manejar cambio en el filtro de etiqueta
  const handleEtiquetaFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterEtiqueta(e.target.value);
  };

  // Encontrar etiqueta por ID
  const getEtiqueta = (id: string) => {
    return etiquetas.find(etiqueta => etiqueta.id === id);
  };

  // Función para obtener el nombre completo del contacto
  const getNombreCompleto = (contacto: Cliente) => {
    if (contacto.tipo === TipoCliente.PERSONA) {
      return `${contacto.nombre} ${contacto.apellido || ''}`;
    } else {
      return contacto.razonSocial || contacto.nombre;
    }
  };

  // Abrir el formulario para crear un nuevo contacto
  const handleNewContacto = () => {
    setEditingContacto(undefined);
    setIsFormOpen(true);
  };

  // Abrir el formulario para editar un contacto existente
  const handleEditContacto = (contacto: Cliente) => {
    setEditingContacto(contacto);
    setIsFormOpen(true);
    setSelectedContacto(null); // Cerrar el detalle si está abierto
  };

  // Ver detalle de contacto
  const handleViewContacto = (contacto: Cliente) => {
    setSelectedContacto(contacto);
  };

  // Eliminar contacto
  const handleDeleteContacto = async (id: string) => {
    if (window.confirm('¿Está seguro que desea eliminar este contacto?')) {
      try {
        await clienteService.deleteCliente(id);
        setContactos(prevContactos => prevContactos.filter(c => c.id !== id));

        // Mostrar notificación de éxito
        addNotification({
          type: 'success',
          message: 'Contacto eliminado correctamente'
        });
      } catch (error) {
        console.error('Error eliminando contacto:', error);

        // Mostrar notificación de error
        addNotification({
          type: 'error',
          message: 'No se pudo eliminar el contacto. Por favor, intente de nuevo.'
        });
      }
    }
  };

  // Guardar contacto (nuevo o editado)
  const handleSaveContacto = async (formData: Omit<Cliente, 'id' | 'fechaCreacion' | 'fechaActualizacion'>) => {
    try {
      if (editingContacto) {
        // Actualizar contacto existente
        const updated = await clienteService.updateCliente(
          editingContacto.id,
          formData
        );

        setContactos(prevContactos =>
          prevContactos.map(c => c.id === editingContacto.id ? updated.cliente : c)
        );

        // Mostrar notificación de éxito
        addNotification({
          type: 'success',
          message: 'Contacto actualizado correctamente'
        });
      } else {
        // Crear nuevo contacto
        const created = await clienteService.createCliente(formData);
        setContactos(prevContactos => [...prevContactos, created.cliente]);

        // Mostrar notificación de éxito
        addNotification({
          type: 'success',
          message: 'Contacto creado correctamente'
        });
      }

      setIsFormOpen(false);
      setEditingContacto(undefined);
    } catch (error) {
      console.error('Error guardando contacto:', error);

      // Mostrar notificación de error
      addNotification({
        type: 'error',
        message: `No se pudo ${editingContacto ? 'actualizar' : 'crear'} el contacto. Por favor, intente de nuevo.`
      });
    }
  };

  // Manejar la importación de contactos
  const handleImportComplete = async (importedContactos: Cliente[]) => {
    try {
      let importedCount = 0;
      const errors = [];

      for (const contacto of importedContactos) {
        try {
          await clienteService.createCliente({
            nombre: contacto.nombre,
            apellido: contacto.apellido,
            razonSocial: contacto.razonSocial,
            tipo: contacto.tipo as TipoCliente,
            documento: contacto.documento,
            email: contacto.email,
            telefono: contacto.telefono,
            direccion: contacto.direccion,
            notas: contacto.notas,
            categorias: contacto.categorias,
            etiquetas: contacto.etiquetas
          });
          importedCount++;
        } catch (err) {
          errors.push(`Error al importar contacto ${contacto.nombre}: ${err}`);
        }
      }

      // Recargar contactos
      await fetchContactos();

      // Mostrar notificación
      if (importedCount > 0) {
        addNotification({
          type: 'success',
          message: `Se importaron ${importedCount} contactos correctamente${errors.length > 0 ? `, con ${errors.length} errores` : ''}`
        });
      } else {
        addNotification({
          type: 'error',
          message: 'No se pudo importar ningún contacto'
        });
      }

      if (errors.length > 0) {
        console.error('Errores durante la importación:', errors);
      }
    } catch (error) {
      console.error('Error en la importación de contactos:', error);
      addNotification({
        type: 'error',
        message: 'Ocurrió un error durante la importación de contactos'
      });
    }
  };

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
        return 'Desconocido';
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
      case TipoCliente.OTRO:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Renderizar el componente
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Directorio de Contactos</h1>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 w-full">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar contactos..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="w-full sm:w-48">
              <select
                value={filterType}
                onChange={handleFilterChange}
                className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="todos">Todos los tipos</option>
                <option value={TipoCliente.PERSONA}>Personas</option>
                <option value={TipoCliente.EMPRESA}>Empresas</option>
                <option value={TipoCliente.PROVEEDOR}>Proveedores</option>
                <option value={TipoCliente.COLABORADOR}>Colaboradores</option>
                <option value={TipoCliente.ABOGADO_EXTERNO}>Abogados Externos</option>
                <option value={TipoCliente.JUZGADO}>Juzgados</option>
                <option value={TipoCliente.ENTIDAD_GOBIERNO}>Entidades Gubernamentales</option>
                <option value={TipoCliente.OTRO}>Otros</option>
              </select>
            </div>

            {/* Filtro por etiqueta */}
            <div className="w-full sm:w-48">
              <select
                value={filterEtiqueta}
                onChange={handleEtiquetaFilterChange}
                className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Todas las etiquetas</option>
                {etiquetas.map(etiqueta => (
                  <option key={etiqueta.id} value={etiqueta.id}>
                    {etiqueta.nombre}
                  </option>
                ))}
              </select>
            </div>

            <ImportExportButtons
              contactos={contactos}
              onImportComplete={handleImportComplete}
            />
            <button
              onClick={handleNewContacto}
              className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Nuevo Contacto
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      ) : filteredContactos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="mt-2 text-gray-500">No se encontraron contactos con los filtros aplicados.</p>
        </div>
      ) : (
        <div className="overflow-hidden bg-white shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Nombre</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tipo</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Etiquetas</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Contacto</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredContactos.map(contacto => (
                <tr key={contacto.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {getNombreCompleto(contacto)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoContactoClases(contacto.tipo)}`}>
                      {getTipoContactoTexto(contacto.tipo)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {contacto.etiquetas && contacto.etiquetas.length > 0 ? (
                        contacto.etiquetas.map(etiquetaId => {
                          const etiqueta = getEtiqueta(etiquetaId);
                          return etiqueta ? (
                            <span
                              key={etiquetaId}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{ backgroundColor: etiqueta.color, color: '#fff' }}
                            >
                              {etiqueta.nombre}
                            </span>
                          ) : null;
                        })
                      ) : (
                        <span className="text-gray-400 text-xs">Sin etiquetas</span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div>
                      <div className="text-gray-900">{contacto.email}</div>
                      <div className="text-gray-500">{contacto.telefono}</div>
                    </div>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleViewContacto(contacto)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => handleEditContacto(contacto)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteContacto(contacto.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de detalle de contacto */}
      {selectedContacto && (
        <DetalleContacto
          contacto={selectedContacto}
          onClose={() => setSelectedContacto(null)}
          onEdit={() => {
            setEditingContacto(selectedContacto);
            setIsFormOpen(true);
            setSelectedContacto(null);
          }}
        />
      )}

      {/* Modal de formulario */}
      <ContactoForm
        contacto={editingContacto}
        onSubmit={handleSaveContacto}
        onCancel={() => setIsFormOpen(false)}
        isOpen={isFormOpen}
      />
    </div>
  );
};

export default Directorio;
