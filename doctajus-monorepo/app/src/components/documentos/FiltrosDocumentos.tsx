import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Autocomplete,
  Paper,
  Divider,
  SelectChangeEvent,
  Grid
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ClearIcon from '@mui/icons-material/Clear';
import {
  FiltrosDocumento,
  TipoDocumento,
  EstadoDocumento,
  Cliente,
  Expediente,
  useDocumentoStore
} from '../../stores/documentoStore';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

const tiposDocumento: { valor: TipoDocumento | ''; etiqueta: string }[] = [
  { valor: '', etiqueta: 'Todos los tipos' },
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

const estadosDocumento: { valor: EstadoDocumento | ''; etiqueta: string }[] = [
  { valor: '', etiqueta: 'Todos los estados' },
  { valor: 'borrador', etiqueta: 'Borrador' },
  { valor: 'pendiente_revision', etiqueta: 'Pendiente de revisión' },
  { valor: 'finalizado', etiqueta: 'Finalizado' },
  { valor: 'aprobado', etiqueta: 'Aprobado' },
  { valor: 'archivado', etiqueta: 'Archivado' }
];

const FiltrosDocumentos: React.FC = () => {
  const { filtros, setFiltros, resetFiltros, fetchDocumentos, clientes, expedientes } = useDocumentoStore();

  // Estado local para los filtros (para no aplicarlos inmediatamente)
  const [filtrosLocales, setFiltrosLocales] = useState<FiltrosDocumento>(filtros);
  const [etiquetaSeleccionada, setEtiquetaSeleccionada] = useState<string>('');

  // Manejar cambios en los inputs de texto
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFiltrosLocales(prev => ({ ...prev, [name]: value }));
  };

  // Manejar cambios en los selects
  const handleSelectChange = (e: SelectChangeEvent<unknown>) => {
    const { name, value } = e.target;

    // Si el valor es una cadena vacía, establecer null
    const valorFinal = value === '' ? null : value;

    setFiltrosLocales(prev => ({ ...prev, [name]: valorFinal }));
  };

  // Manejar cambios en las fechas
  const handleFechaChange = (nombre: string, fecha: Date | null) => {
    setFiltrosLocales(prev => ({ ...prev, [nombre]: fecha }));
  };

  // Añadir etiqueta
  const handleAddEtiqueta = () => {
    if (etiquetaSeleccionada && (!filtrosLocales.etiquetas || !filtrosLocales.etiquetas.includes(etiquetaSeleccionada))) {
      setFiltrosLocales(prev => ({
        ...prev,
        etiquetas: [...(prev.etiquetas || []), etiquetaSeleccionada]
      }));
      setEtiquetaSeleccionada('');
    }
  };

  // Eliminar etiqueta
  const handleDeleteEtiqueta = (etiqueta: string) => {
    setFiltrosLocales(prev => ({
      ...prev,
      etiquetas: prev.etiquetas ? prev.etiquetas.filter(e => e !== etiqueta) : []
    }));
  };

  // Cambiar filtro de destacados
  const handleDestacadosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltrosLocales(prev => ({
      ...prev,
      destacados: e.target.checked
    }));
  };

  // Aplicar filtros
  const handleAplicarFiltros = () => {
    setFiltros(filtrosLocales);
    fetchDocumentos();
  };

  // Limpiar filtros
  const handleLimpiarFiltros = () => {
    setFiltrosLocales({});
    resetFiltros();
    fetchDocumentos();
  };

  // Obtener todas las etiquetas únicas de los documentos para sugerencias
  const etiquetasSugeridas = ["urgente", "importante", "pendiente", "contrato", "judicial", "interno", "externo", "borrador", "final", "template"];

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Filtrar documentos</Typography>
        <Button
          variant="text"
          color="inherit"
          startIcon={<ClearIcon />}
          onClick={handleLimpiarFiltros}
        >
          Limpiar filtros
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={2}>
        {/* Búsqueda por texto */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Buscar en documentos"
            name="busqueda"
            value={filtrosLocales.busqueda || ''}
            onChange={handleTextChange}
            placeholder="Buscar por nombre, descripción o contenido..."
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
        </Grid>

        {/* Filtros por tipo y estado */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Tipo de documento</InputLabel>
            <Select
              name="tipo"
              value={filtrosLocales.tipo || ''}
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
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Estado</InputLabel>
            <Select
              name="estado"
              value={filtrosLocales.estado || ''}
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
        </Grid>

        {/* Filtros por cliente y expediente */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Cliente</InputLabel>
            <Select
              name="clienteId"
              value={filtrosLocales.clienteId || ''}
              onChange={handleSelectChange}
              label="Cliente"
            >
              <MenuItem value="">Todos los clientes</MenuItem>
              {clientes.map(cliente => (
                <MenuItem key={cliente.id} value={cliente.id}>
                  {cliente.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Expediente</InputLabel>
            <Select
              name="expedienteId"
              value={filtrosLocales.expedienteId || ''}
              onChange={handleSelectChange}
              label="Expediente"
            >
              <MenuItem value="">Todos los expedientes</MenuItem>
              {expedientes.map(expediente => (
                <MenuItem key={expediente.id} value={expediente.id}>
                  {expediente.numero} - {expediente.titulo}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Filtros por fecha */}
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="es">
            <DatePicker
              label="Fecha desde"
              value={filtrosLocales.fechaDesde ? moment(filtrosLocales.fechaDesde) : null}
              onChange={(fecha) => handleFechaChange('fechaDesde', fecha ? fecha.toDate() : null)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="es">
            <DatePicker
              label="Fecha hasta"
              value={filtrosLocales.fechaHasta ? moment(filtrosLocales.fechaHasta) : null}
              onChange={(fecha) => handleFechaChange('fechaHasta', fecha ? fecha.toDate() : null)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
        </Grid>

        {/* Filtros por etiquetas */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Etiquetas
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Autocomplete
              freeSolo
              options={etiquetasSugeridas}
              value={etiquetaSeleccionada}
              onChange={(_, value) => setEtiquetaSeleccionada(value || '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Añadir etiqueta"
                  fullWidth
                  size="small"
                />
              )}
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={handleAddEtiqueta}
              sx={{ ml: 1, minWidth: 100 }}
            >
              Añadir
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {filtrosLocales.etiquetas && filtrosLocales.etiquetas.map((etiqueta) => (
              <Chip
                key={etiqueta}
                label={etiqueta}
                onDelete={() => handleDeleteEtiqueta(etiqueta)}
                color="primary"
                variant="outlined"
                size="small"
              />
            ))}
          </Box>
        </Grid>

        {/* Filtro por destacados */}
        <Grid item xs={12}>
          <FormControl>
            <label>
              <input
                type="checkbox"
                checked={filtrosLocales.destacados || false}
                onChange={handleDestacadosChange}
              />
              <Typography component="span" sx={{ ml: 1 }}>
                Solo mostrar documentos destacados
              </Typography>
            </label>
          </FormControl>
        </Grid>

        {/* Botón de aplicar filtros */}
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAplicarFiltros}
            startIcon={<FilterAltIcon />}
          >
            Aplicar filtros
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default FiltrosDocumentos;
