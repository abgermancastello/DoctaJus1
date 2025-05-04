import { create } from 'zustand';
import moment from 'moment';
import { documentoService } from '../services/api';

// Definición de tipos
export type TipoDocumento =
  | 'contrato'
  | 'demanda'
  | 'contestacion'
  | 'apelacion'
  | 'recurso'
  | 'poder'
  | 'sentencia'
  | 'resolucion'
  | 'pericia'
  | 'factura'
  | 'otro';

export type EstadoDocumento =
  | 'borrador'
  | 'finalizado'
  | 'archivado'
  | 'pendiente_revision'
  | 'aprobado';

// Interfaces
export interface Documento {
  id: number | string;
  nombre: string;
  descripcion?: string;
  tipo: TipoDocumento;
  expedienteId?: number | string;
  expediente?: Expediente;
  clienteId?: number | string;
  cliente?: Cliente;
  fechaCreacion: Date;
  fechaModificacion: Date;
  estado: EstadoDocumento;
  archivoUrl: string;
  archivoNombre: string;
  archivoTamanio: number; // en bytes
  archivoFormato: string; // pdf, docx, etc.
  etiquetas: string[];
  creadoPor: string;
  creadoPorId: string;
  modificadoPorId?: string;
  versionActual: number;
  esPublico: boolean;
  destacado: boolean;
  permisos?: DocumentoPermiso[];
  versiones?: DocumentoVersion[];
  historial?: DocumentoHistorial[];
}

export interface DocumentoVersion {
  id: string;
  documentoId: string;
  numeroVersion: number;
  archivoUrl: string;
  archivoNombre: string;
  archivoTamanio: number;
  archivoFormato: string;
  descripcionCambios?: string;
  creadoPorId: string;
  creadoPor?: { id: string; nombre: string };
  fechaCreacion: Date;
}

export interface DocumentoPermiso {
  id: string;
  documentoId: string;
  usuarioId: string;
  usuario?: { id: string; nombre: string; email: string };
  tipoPermiso: 'lectura' | 'escritura' | 'administrador';
  otorgadoPorId: string;
  otorgadoPor?: { id: string; nombre: string };
  fechaCreacion: Date;
}

export interface DocumentoHistorial {
  id: string;
  documentoId: string;
  usuarioId: string;
  usuario?: { id: string; nombre: string };
  tipoAccion: 'creacion' | 'modificacion' | 'cambio_estado' | 'nueva_version' | 'descarga' | 'cambio_permisos' | 'eliminacion' | 'restauracion' | 'visualizacion';
  detalles: string;
  metadatos?: any;
  fechaAccion: Date;
}

export interface Cliente {
  id: number | string;
  nombre: string;
}

export interface Expediente {
  id: number | string;
  numero: string;
  titulo: string;
}

export interface FiltrosDocumento {
  busqueda?: string;
  tipo?: TipoDocumento | null;
  estado?: EstadoDocumento | null;
  expedienteId?: number | string | null;
  clienteId?: number | string | null;
  fechaDesde?: Date | null;
  fechaHasta?: Date | null;
  etiquetas?: string[];
  destacados?: boolean;
}

interface DocumentoState {
  documentos: Documento[];
  documentosFiltrados: Documento[];
  documentoSeleccionado: Documento | null;
  clientes: Cliente[];
  expedientes: Expediente[];
  filtros: FiltrosDocumento;
  versiones: DocumentoVersion[];
  permisos: DocumentoPermiso[];
  historial: DocumentoHistorial[];
  loading: boolean;
  error: string | null;

  // Acciones
  fetchDocumentos: () => Promise<void>;
  fetchClientes: () => Promise<void>;
  fetchExpedientes: () => Promise<void>;
  addDocumento: (documento: Omit<Documento, 'id' | 'fechaCreacion' | 'fechaModificacion' | 'version'>, archivo: File) => Promise<void>;
  updateDocumento: (id: number | string, datos: Partial<Documento>, archivo?: File) => Promise<void>;
  deleteDocumento: (id: number | string) => Promise<void>;
  setDocumentoSeleccionado: (documento: Documento | null) => void;
  setFiltros: (filtros: Partial<FiltrosDocumento>) => void;
  resetFiltros: () => void;
  destacarDocumento: (id: number | string, destacado: boolean) => Promise<void>;
  cambiarEstadoDocumento: (id: number | string, estado: EstadoDocumento) => Promise<void>;
  fetchVersiones: (documentoId: number | string) => Promise<void>;
  fetchPermisos: (documentoId: number | string) => Promise<void>;
  addPermiso: (documentoId: number | string, usuarioId: string, tipoPermiso: string) => Promise<void>;
  removePermiso: (documentoId: number | string, usuarioId: string) => Promise<void>;
  fetchHistorial: (documentoId: number | string) => Promise<void>;
  downloadDocumento: (id: number | string) => Promise<void>;
  downloadVersion: (documentoId: number | string, versionId: string) => Promise<void>;
}

// Datos iniciales vacíos
const documentosIniciales: Documento[] = [];
const clientesIniciales: Cliente[] = [];
const expedientesIniciales: Expediente[] = [];

// Creación del store
export const useDocumentoStore = create<DocumentoState>((set, get) => ({
  documentos: documentosIniciales,
  documentosFiltrados: documentosIniciales,
  documentoSeleccionado: null,
  clientes: clientesIniciales,
  expedientes: expedientesIniciales,
  versiones: [],
  permisos: [],
  historial: [],
  filtros: {},
  loading: false,
  error: null,

  // Cargar documentos
  fetchDocumentos: async () => {
    set({ loading: true, error: null });
    try {
      // Obtener los filtros actuales
      const filtros = get().filtros;

      // Preparar formato para API
      const apiFilters: Record<string, any> = {};
      if (filtros.busqueda) apiFilters.busqueda = filtros.busqueda;
      if (filtros.tipo) apiFilters.tipo = filtros.tipo;
      if (filtros.estado) apiFilters.estado = filtros.estado;
      if (filtros.expedienteId) apiFilters.expedienteId = filtros.expedienteId;
      if (filtros.clienteId) apiFilters.clienteId = filtros.clienteId;
      if (filtros.fechaDesde) apiFilters.fechaDesde = filtros.fechaDesde.toISOString();
      if (filtros.fechaHasta) apiFilters.fechaHasta = filtros.fechaHasta.toISOString();
      if (filtros.etiquetas?.length) apiFilters.etiquetas = filtros.etiquetas;
      if (filtros.destacados) apiFilters.destacados = filtros.destacados;

      // Obtener documentos desde la API
      const documentos = await documentoService.getDocumentos(apiFilters);

      set({
        documentos: documentos,
        documentosFiltrados: documentos,
        loading: false
      });
    } catch (error: any) {
      console.error('Error al cargar documentos:', error);
      set({
        error: error?.message || 'Error al cargar los documentos',
        loading: false,
        // En caso de error, usar datos de ejemplo para desarrollo
        documentos: documentosIniciales,
        documentosFiltrados: documentosIniciales
      });
    }
  },

  // Cargar clientes
  fetchClientes: async () => {
    set({ loading: true, error: null });
    try {
      // Obtener clientes desde el API
      const clientes = await documentoService.getClientes();
      set({ clientes, loading: false });
    } catch (error: any) {
      console.error('Error al cargar clientes:', error);
      set({
        error: error?.message || 'Error al cargar los clientes',
        loading: false,
        clientes: []
      });
    }
  },

  // Cargar expedientes
  fetchExpedientes: async () => {
    set({ loading: true, error: null });
    try {
      // Obtener expedientes desde el API
      const expedientes = await documentoService.getExpedientes();
      set({ expedientes, loading: false });
    } catch (error: any) {
      console.error('Error al cargar expedientes:', error);
      set({
        error: error?.message || 'Error al cargar los expedientes',
        loading: false,
        expedientes: []
      });
    }
  },

  // Añadir documento
  addDocumento: async (
    documentoData: Omit<Documento, 'id' | 'fechaCreacion' | 'fechaModificacion' | 'version'>,
    archivo: File
  ) => {
    set({ loading: true, error: null });
    try {
      // Crear documento a través del API
      await documentoService.createDocumento(documentoData, archivo);

      // Recargar la lista de documentos
      await get().fetchDocumentos();

      set({ loading: false });
    } catch (error: any) {
      console.error('Error al añadir documento:', error);
      set({
        error: error?.message || 'Error al crear el documento',
        loading: false
      });
    }
  },

  // Actualizar documento
  updateDocumento: async (id: number | string, datos: Partial<Documento>, archivo?: File) => {
    set({ loading: true, error: null });
    try {
      // Actualizar documento a través del API
      await documentoService.updateDocumento(id.toString(), datos, archivo);

      // Recargar la lista de documentos
      await get().fetchDocumentos();

      // Si el documento actualizado es el seleccionado, actualizarlo también
      const documentoSeleccionado = get().documentoSeleccionado;
      if (documentoSeleccionado && documentoSeleccionado.id === id) {
        const documentoActualizado = await documentoService.getDocumentoById(id.toString());
        set({ documentoSeleccionado: documentoActualizado });
      }

      set({ loading: false });
    } catch (error: any) {
      console.error(`Error al actualizar documento ${id}:`, error);
      set({
        error: error?.message || 'Error al actualizar el documento',
        loading: false
      });
    }
  },

  // Eliminar documento
  deleteDocumento: async (id: number | string) => {
    set({ loading: true, error: null });
    try {
      // Eliminar documento a través del API
      await documentoService.deleteDocumento(id.toString());

      // Actualizar el estado local
      set(state => ({
        documentos: state.documentos.filter(doc => doc.id !== id),
        documentosFiltrados: state.documentosFiltrados.filter(doc => doc.id !== id),
        // Si el documento eliminado era el seleccionado, limpiar la selección
        documentoSeleccionado: state.documentoSeleccionado?.id === id ? null : state.documentoSeleccionado,
        loading: false
      }));
    } catch (error: any) {
      console.error(`Error al eliminar documento ${id}:`, error);
      set({
        error: error?.message || 'Error al eliminar el documento',
        loading: false
      });
    }
  },

  // Seleccionar documento
  setDocumentoSeleccionado: (documento: Documento | null) => {
    set({ documentoSeleccionado: documento });
  },

  // Establecer filtros
  setFiltros: (filtros: Partial<FiltrosDocumento>) => {
    set(state => ({
      filtros: { ...state.filtros, ...filtros }
    }));
  },

  // Resetear filtros
  resetFiltros: () => {
    set({ filtros: {} });
  },

  // Destacar/no destacar documento
  destacarDocumento: async (id: number | string, destacado: boolean) => {
    set({ loading: true, error: null });
    try {
      // Actualizar documento en el API
      await documentoService.toggleDestacado(id.toString(), destacado);

      // Actualizar el estado local
      set(state => ({
        documentos: state.documentos.map(doc =>
          doc.id === id ? { ...doc, destacado } : doc
        ),
        documentosFiltrados: state.documentosFiltrados.map(doc =>
          doc.id === id ? { ...doc, destacado } : doc
        ),
        // Si el documento modificado es el seleccionado, actualizarlo también
        documentoSeleccionado: state.documentoSeleccionado?.id === id
          ? { ...state.documentoSeleccionado, destacado }
          : state.documentoSeleccionado,
        loading: false
      }));
    } catch (error: any) {
      console.error(`Error al ${destacado ? 'destacar' : 'quitar destacado de'} documento ${id}:`, error);
      set({
        error: error?.message || `Error al ${destacado ? 'destacar' : 'quitar destacado del'} documento`,
        loading: false
      });
    }
  },

  // Cambiar estado del documento
  cambiarEstadoDocumento: async (id: number | string, estado: EstadoDocumento) => {
    set({ loading: true, error: null });
    try {
      // Actualizar estado en el API
      await documentoService.cambiarEstado(id.toString(), estado);

      // Actualizar el estado local
      set(state => ({
        documentos: state.documentos.map(doc =>
          doc.id === id ? { ...doc, estado } : doc
        ),
        documentosFiltrados: state.documentosFiltrados.map(doc =>
          doc.id === id ? { ...doc, estado } : doc
        ),
        // Si el documento modificado es el seleccionado, actualizarlo también
        documentoSeleccionado: state.documentoSeleccionado?.id === id
          ? { ...state.documentoSeleccionado, estado }
          : state.documentoSeleccionado,
        loading: false
      }));
    } catch (error: any) {
      console.error(`Error al cambiar estado de documento ${id} a ${estado}:`, error);
      set({
        error: error?.message || 'Error al cambiar el estado del documento',
        loading: false
      });
    }
  },

  // Obtener versiones de un documento
  fetchVersiones: async (documentoId: number | string) => {
    set({ loading: true, error: null });
    try {
      // Obtener versiones desde el API
      const versiones = await documentoService.getVersiones(documentoId.toString());
      set({ versiones, loading: false });
    } catch (error: any) {
      console.error(`Error al cargar versiones del documento ${documentoId}:`, error);
      set({
        error: error?.message || 'Error al cargar las versiones del documento',
        loading: false,
        versiones: []
      });
    }
  },

  // Obtener permisos de un documento
  fetchPermisos: async (documentoId: number | string) => {
    set({ loading: true, error: null });
    try {
      // Obtener permisos desde el API
      const permisos = await documentoService.getPermisos(documentoId.toString());
      set({ permisos, loading: false });
    } catch (error: any) {
      console.error(`Error al cargar permisos del documento ${documentoId}:`, error);
      set({
        error: error?.message || 'Error al cargar los permisos del documento',
        loading: false,
        permisos: []
      });
    }
  },

  // Añadir permiso a un documento
  addPermiso: async (documentoId: number | string, usuarioId: string, tipoPermiso: string) => {
    set({ loading: true, error: null });
    try {
      // Añadir permiso a través del API
      await documentoService.addPermiso(documentoId.toString(), { usuarioId, tipoPermiso });

      // Recargar permisos
      await get().fetchPermisos(documentoId);

      set({ loading: false });
    } catch (error: any) {
      console.error(`Error al añadir permiso al documento ${documentoId}:`, error);
      set({
        error: error?.message || 'Error al añadir el permiso',
        loading: false
      });
    }
  },

  // Eliminar permiso de un documento
  removePermiso: async (documentoId: number | string, usuarioId: string) => {
    set({ loading: true, error: null });
    try {
      // Eliminar permiso a través del API
      await documentoService.removePermiso(documentoId.toString(), usuarioId);

      // Recargar permisos
      await get().fetchPermisos(documentoId);

      set({ loading: false });
    } catch (error: any) {
      console.error(`Error al eliminar permiso del documento ${documentoId}:`, error);
      set({
        error: error?.message || 'Error al eliminar el permiso',
        loading: false
      });
    }
  },

  // Obtener historial de un documento
  fetchHistorial: async (documentoId: number | string) => {
    set({ loading: true, error: null });
    try {
      // Obtener historial desde el API
      const historial = await documentoService.getHistorial(documentoId.toString());
      set({ historial, loading: false });
    } catch (error: any) {
      console.error(`Error al cargar historial del documento ${documentoId}:`, error);
      set({
        error: error?.message || 'Error al cargar el historial del documento',
        loading: false,
        historial: []
      });
    }
  },

  // Descargar documento
  downloadDocumento: async (id: number | string) => {
    try {
      await documentoService.downloadDocumento(id.toString());
    } catch (error: any) {
      console.error(`Error al descargar documento ${id}:`, error);
      set({ error: error?.message || 'Error al descargar el documento' });
    }
  },

  // Descargar versión de documento
  downloadVersion: async (documentoId: number | string, versionId: string) => {
    try {
      await documentoService.downloadVersion(documentoId.toString(), versionId);
    } catch (error: any) {
      console.error(`Error al descargar versión ${versionId} del documento ${documentoId}:`, error);
      set({ error: error?.message || 'Error al descargar la versión del documento' });
    }
  }
}));
