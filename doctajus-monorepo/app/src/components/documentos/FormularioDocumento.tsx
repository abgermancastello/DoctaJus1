import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
  Chip,
  Paper,
  Autocomplete,
  SelectChangeEvent,
  Grid,
  Switch,
  FormControlLabel,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
// Importar íconos individualmente
import CloudUpload from '@mui/icons-material/CloudUpload';
import Save from '@mui/icons-material/Save';
import Cancel from '@mui/icons-material/Cancel';
import { TipoDocumento, EstadoDocumento, Documento, Cliente, Expediente, useDocumentoStore } from '../../stores/documentoStore';
import moment from 'moment';

interface FormularioDocumentoProps {
  documento?: Documento;
  onCancel: () => void;
  onSubmit: () => void;
}

const tiposDocumento: { valor: TipoDocumento; etiqueta: string }[] = [
  { valor: 'contrato', etiqueta: 'Contrato' },
  { valor: 'demanda', etiqueta: 'Demanda' },
  { valor: 'contestacion', etiqueta: 'Contestación' },
  { valor: 'apelacion', etiqueta: 'Apelación' },
  { valor: 'recurso', etiqueta: 'Recurso' },
  { valor: 'poder', etiqueta: 'Poder' },
  { valor: 'sentencia', etiqueta: 'Sentencia' },
  { valor: 'resolucion', etiqueta: 'Resolución' },
  { valor: 'pericia', etiqueta: 'Pericia' },
  { valor: 'factura', etiqueta: 'Factura' },
  { valor: 'otro', etiqueta: 'Otro' }
];

const estadosDocumento: { valor: EstadoDocumento; etiqueta: string }[] = [
  { valor: 'borrador', etiqueta: 'Borrador' },
  { valor: 'pendiente_revision', etiqueta: 'Pendiente de revisión' },
  { valor: 'finalizado', etiqueta: 'Finalizado' },
  { valor: 'aprobado', etiqueta: 'Aprobado' },
  { valor: 'archivado', etiqueta: 'Archivado' }
];

// Función auxiliar para formatear bytes
const formatoBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FormularioDocumento: React.FC<FormularioDocumentoProps> = ({
  documento,
  onCancel,
  onSubmit
}) => {
  const { clientes, expedientes, addDocumento, updateDocumento } = useDocumentoStore();
  const modoEdicion = !!documento;

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'otro' as TipoDocumento,
    expedienteId: null as string | number | null,
    clienteId: null as string | number | null,
    estado: 'borrador' as EstadoDocumento,
    archivoUrl: '',
    archivoTamanio: 0,
    archivoFormato: '',
    etiquetas: [] as string[],
    esPublico: false,
    destacado: false,
  });

  // Estado del archivo
  const [archivo, setArchivo] = useState<File | null>(null);
  const [archivoPreview, setArchivoPreview] = useState<string | null>(null);

  // Estado para nuevas etiquetas
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState('');

  // Errores de validación
  const [errores, setErrores] = useState({
    nombre: '',
    archivo: '',
  });

  // Cargar datos del documento si estamos en modo edición
  useEffect(() => {
    if (documento) {
      setFormData({
        nombre: documento.nombre,
        descripcion: documento.descripcion || '',
        tipo: documento.tipo,
        expedienteId: documento.expedienteId || null,
        clienteId: documento.clienteId || null,
        estado: documento.estado,
        archivoUrl: documento.archivoUrl,
        archivoTamanio: documento.archivoTamanio,
        archivoFormato: documento.archivoFormato,
        etiquetas: [...documento.etiquetas],
        esPublico: documento.esPublico,
        destacado: documento.destacado,
      });
    }
  }, [documento]);

  // Manejar cambios en los campos
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Limpiar error si el campo tiene valor
    if (errores[name as keyof typeof errores] && value) {
      setErrores(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Manejar cambios en los selects
  const handleSelectChange = (e: SelectChangeEvent<unknown>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejar cambios en el checkbox
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Manejar selección de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setArchivo(selectedFile);

      // Crear una URL para vista previa del archivo (si es imagen)
      if (selectedFile.type.startsWith('image/')) {
        const objectUrl = URL.createObjectURL(selectedFile);
        setArchivoPreview(objectUrl);
      } else {
        setArchivoPreview(null);
      }

      // Actualizar información del archivo en el formulario
      setFormData(prev => ({
        ...prev,
        archivoTamanio: selectedFile.size,
        archivoFormato: selectedFile.name.split('.').pop() || '',
        archivoNombre: selectedFile.name
      }));

      // Limpiar error de archivo
      setErrores(prev => ({ ...prev, archivo: '' }));
    }
  };

  // Añadir etiquetas
  const handleAddEtiqueta = () => {
    if (nuevaEtiqueta && !formData.etiquetas.includes(nuevaEtiqueta)) {
      setFormData(prev => ({
        ...prev,
        etiquetas: [...prev.etiquetas, nuevaEtiqueta]
      }));
      setNuevaEtiqueta('');
    }
  };

  // Eliminar etiquetas
  const handleDeleteEtiqueta = (etiquetaAEliminar: string) => {
    setFormData(prev => ({
      ...prev,
      etiquetas: prev.etiquetas.filter(etiqueta => etiqueta !== etiquetaAEliminar)
    }));
  };

  // Validar formulario
  const validarFormulario = (): boolean => {
    const nuevosErrores = {
      nombre: '',
      archivo: ''
    };
    let esValido = true;

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre del documento es obligatorio';
      esValido = false;
    }

    if (!modoEdicion && !archivo) {
      nuevosErrores.archivo = 'Debes seleccionar un archivo';
      esValido = false;
    }

    setErrores(nuevosErrores);
    return esValido;
  };

  // Enviar formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    if (modoEdicion && documento) {
      // Preparar datos para actualización (convirtiendo null a undefined)
      const datosActualizacion = {
        ...formData,
        expedienteId: formData.expedienteId || undefined,
        clienteId: formData.clienteId || undefined
      };

      // Actualizar documento existente
      updateDocumento(documento.id, datosActualizacion, archivo || undefined);
    } else {
      // Crear nuevo documento
      if (archivo) {
        // Preparar datos para creación (convirtiendo null a undefined)
        const datosCreacion = {
          ...formData,
          expedienteId: formData.expedienteId || undefined,
          clienteId: formData.clienteId || undefined,
          // Añadir campos requeridos para un nuevo documento
          archivoNombre: archivo.name,
          creadoPor: '', // Se establecerá en el backend
          creadoPorId: '', // Se establecerá en el backend
          versionActual: 1  // Se iniciará en 1
        };

        // La versión se manejará internamente en el backend
        addDocumento(datosCreacion as any, archivo);
      } else {
        setErrores(prev => ({ ...prev, archivo: 'Debes seleccionar un archivo' }));
        return;
      }
    }

    onSubmit();
  };

  // Limpiar recursos cuando se desmonte el componente
  useEffect(() => {
    return () => {
      // Liberar URL de vista previa si existe
      if (archivoPreview) {
        URL.revokeObjectURL(archivoPreview);
      }
    };
  }, [archivoPreview]);

  return (
    <Paper elevation={0} sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {modoEdicion ? 'Editar Documento' : 'Nuevo Documento'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {/* Nombre del documento */}
          <Box sx={{ width: '100%' }}>
            <TextField
              required
              fullWidth
              label="Nombre del documento"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              error={!!errores.nombre}
              helperText={errores.nombre}
            />
          </Box>

          {/* Descripción */}
          <Box sx={{ width: '100%' }}>
            <TextField
              fullWidth
              label="Descripción"
              name="descripcion"
              multiline
              rows={3}
              value={formData.descripcion}
              onChange={handleInputChange}
            />
          </Box>

          {/* Tipo de documento */}
          <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
            <FormControl fullWidth>
              <InputLabel>Tipo de documento</InputLabel>
              <Select
                name="tipo"
                value={formData.tipo}
                onChange={handleSelectChange}
                label="Tipo de documento"
              >
                {tiposDocumento.map(tipo => (
                  <MenuItem key={tipo.valor} value={tipo.valor}>
                    {tipo.etiqueta}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Estado del documento */}
          <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                name="estado"
                value={formData.estado}
                onChange={handleSelectChange}
                label="Estado"
              >
                {estadosDocumento.map(estado => (
                  <MenuItem key={estado.valor} value={estado.valor}>
                    {estado.etiqueta}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Cliente relacionado */}
          <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
            <FormControl fullWidth>
              <InputLabel>Cliente</InputLabel>
              <Select
                name="clienteId"
                value={formData.clienteId || ''}
                onChange={handleSelectChange}
                label="Cliente"
              >
                <MenuItem value="">Ninguno</MenuItem>
                {clientes.map(cliente => (
                  <MenuItem key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Expediente relacionado */}
          <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
            <FormControl fullWidth>
              <InputLabel>Expediente</InputLabel>
              <Select
                name="expedienteId"
                value={formData.expedienteId || ''}
                onChange={handleSelectChange}
                label="Expediente"
              >
                <MenuItem value="">Ninguno</MenuItem>
                {expedientes.map(expediente => (
                  <MenuItem key={expediente.id} value={expediente.id}>
                    {expediente.numero} - {expediente.titulo}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Archivo */}
          <Box sx={{ width: '100%' }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Archivo del documento (Requerido)
            </Typography>
            <Box
              sx={{
                border: '2px dashed',
                borderColor: errores.archivo ? 'error.main' : 'primary.main',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                mb: 2,
                bgcolor: 'background.paper'
              }}
            >
              <Typography variant="body1" sx={{ mb: 2 }}>
                Paso 1: Seleccione un archivo para cargar
              </Typography>

              <input
                accept="application/pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                id="documento-archivo"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="documento-archivo">
                <Button
                  variant="contained"
                  size="large"
                  component="span"
                  startIcon={<CloudUpload />}
                  sx={{ mb: 2, py: 1.5, px: 4 }}
                >
                  {modoEdicion ? 'Cambiar archivo' : 'Seleccionar archivo'}
                </Button>
              </label>

              {/* Vista previa del archivo (solo para imágenes) */}
              {archivoPreview && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Vista previa:
                  </Typography>
                  <Box
                    component="img"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      objectFit: 'contain',
                      border: '1px solid #eee',
                      borderRadius: 1
                    }}
                    src={archivoPreview}
                    alt="Vista previa"
                  />
                </Box>
              )}

              {/* Información del archivo seleccionado o existente */}
              {(archivo || (documento && !archivo)) && (
                <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #eee' }}>
                  <Typography variant="subtitle2">
                    Archivo seleccionado: {archivo ? archivo.name : documento?.archivoNombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Formato: {archivo ? archivo.type : documento?.archivoFormato} •
                    Tamaño: {formatoBytes(archivo ? archivo.size : documento?.archivoTamanio || 0)}
                  </Typography>
                </Box>
              )}

              {archivo && (
                <Typography variant="body1" sx={{ mt: 3 }}>
                  Paso 2: Complete el formulario y presione el botón "Crear documento" para finalizar
                </Typography>
              )}

              {errores.archivo && (
                <FormHelperText error sx={{ fontSize: '1rem' }}>{errores.archivo}</FormHelperText>
              )}
            </Box>
          </Box>

          {/* Etiquetas */}
          <Box sx={{ width: '100%' }}>
            <Typography variant="subtitle2" gutterBottom>
              Etiquetas
            </Typography>

            <Box sx={{ display: 'flex', mb: 1 }}>
              <TextField
                size="small"
                value={nuevaEtiqueta}
                onChange={(e) => setNuevaEtiqueta(e.target.value)}
                placeholder="Nueva etiqueta"
                sx={{ mr: 1 }}
              />
              <Button
                variant="outlined"
                onClick={handleAddEtiqueta}
                disabled={!nuevaEtiqueta}
              >
                Añadir
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {formData.etiquetas.map((etiqueta, index) => (
                <Chip
                  key={index}
                  label={etiqueta}
                  onDelete={() => handleDeleteEtiqueta(etiqueta)}
                />
              ))}
              {formData.etiquetas.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No hay etiquetas añadidas
                </Typography>
              )}
            </Box>
          </Box>

          {/* Opciones adicionales */}
          <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
            <FormControl>
              <label>
                <input
                  type="checkbox"
                  name="esPublico"
                  checked={formData.esPublico}
                  onChange={handleCheckboxChange}
                />
                {' '}Documento público
              </label>
              <FormHelperText>
                Los documentos públicos son accesibles para todos los usuarios del sistema
              </FormHelperText>
            </FormControl>
          </Box>

          <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
            <FormControl>
              <label>
                <input
                  type="checkbox"
                  name="destacado"
                  checked={formData.destacado}
                  onChange={handleCheckboxChange}
                />
                {' '}Destacar documento
              </label>
              <FormHelperText>
                Los documentos destacados aparecen en primer lugar en las búsquedas
              </FormHelperText>
            </FormControl>
          </Box>

          {/* Botones */}
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<Cancel />}
              onClick={onCancel}
              size="large"
              sx={{ py: 1, px: 3 }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<Save />}
              size="large"
              sx={{ py: 1, px: 4 }}
              disabled={!archivo && !modoEdicion}
            >
              {modoEdicion ? 'Actualizar documento' : 'Crear documento'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default FormularioDocumento;
