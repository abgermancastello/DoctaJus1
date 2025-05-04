import React, { useEffect, useState } from 'react';
import { useDocumentoStore } from '../stores/documentoStore';
import { Box, Typography, Button, Card, CardContent, Grid, Chip, Stack, IconButton, Divider, Tooltip, Dialog, DialogContent } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FiltrosDocumentos from '../components/documentos/FiltrosDocumentos';
import FormularioDocumento from '../components/documentos/FormularioDocumento';
import VistaDocumento from '../components/documentos/VistaDocumento';
import moment from 'moment';
import 'moment/locale/es';

const Documentos: React.FC = () => {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarVistaDetalle, setMostrarVistaDetalle] = useState(false);

  const {
    documentosFiltrados,
    documentoSeleccionado,
    clientes,
    expedientes,
    fetchDocumentos,
    fetchClientes,
    fetchExpedientes,
    setDocumentoSeleccionado,
    destacarDocumento,
    deleteDocumento,
  } = useDocumentoStore();

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchDocumentos();
    fetchClientes();
    fetchExpedientes();
  }, [fetchDocumentos, fetchClientes, fetchExpedientes]);

  const formatoBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleToggleFiltros = () => {
    setMostrarFiltros(!mostrarFiltros);
  };

  const handleNuevoDocumento = () => {
    setDocumentoSeleccionado(null);
    setMostrarFormulario(true);
  };

  const handleVerDocumento = (documento: any) => {
    setDocumentoSeleccionado(documento);
    setMostrarVistaDetalle(true);
  };

  const handleEditarDocumento = () => {
    setMostrarVistaDetalle(false);
    setMostrarFormulario(true);
  };

  const handleCerrarFormulario = () => {
    setMostrarFormulario(false);
  };

  const handleGuardarDocumento = () => {
    setMostrarFormulario(false);
    fetchDocumentos(); // Refrescar la lista de documentos
  };

  const handleCerrarVistaDetalle = () => {
    setMostrarVistaDetalle(false);
  };

  const getColorByEstado = (estado: string) => {
    switch (estado) {
      case 'borrador': return '#f44336';
      case 'pendiente_revision': return '#ff9800';
      case 'finalizado': return '#4caf50';
      case 'aprobado': return '#2196f3';
      case 'archivado': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  const getTextByEstado = (estado: string) => {
    switch (estado) {
      case 'borrador': return 'Borrador';
      case 'pendiente_revision': return 'Pendiente de revisión';
      case 'finalizado': return 'Finalizado';
      case 'aprobado': return 'Aprobado';
      case 'archivado': return 'Archivado';
      default: return 'Desconocido';
    }
  };

  // Buscar cliente y expediente relacionados al documento seleccionado
  const clienteSeleccionado = documentoSeleccionado?.clienteId
    ? clientes.find(c => c.id === documentoSeleccionado.clienteId)
    : undefined;

  const expedienteSeleccionado = documentoSeleccionado?.expedienteId
    ? expedientes.find(e => e.id === documentoSeleccionado.expedienteId)
    : undefined;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestión de Documentos
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FilterListIcon />}
            onClick={handleToggleFiltros}
            sx={{ mr: 1 }}
          >
            Filtros
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleNuevoDocumento}
          >
            Nuevo Documento
          </Button>
        </Box>
      </Box>

      {mostrarFiltros && (
        <Box sx={{ mb: 3 }}>
          <FiltrosDocumentos />
        </Box>
      )}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {documentosFiltrados.map((documento) => (
          <Box
            key={documento.id}
            sx={{
              flex: '1 1 300px',
              minWidth: 0,
              maxWidth: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)' }
            }}
          >
            <Card
              elevation={3}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                },
                cursor: 'pointer'
              }}
              onClick={() => handleVerDocumento(documento)}
            >
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" component="h2" noWrap sx={{ maxWidth: '80%' }}>
                    {documento.nombre}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      destacarDocumento(documento.id, !documento.destacado);
                    }}
                  >
                    {documento.destacado ? <StarIcon color="warning" /> : <StarBorderIcon />}
                  </IconButton>
                </Box>

                <Chip
                  label={getTextByEstado(documento.estado)}
                  size="small"
                  sx={{
                    backgroundColor: getColorByEstado(documento.estado),
                    color: 'white',
                    alignSelf: 'flex-start',
                    mb: 1
                  }}
                />

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, flexGrow: 1 }}>
                  {documento.descripcion || "Sin descripción"}
                </Typography>

                <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                  {documento.etiquetas.map((etiqueta, index) => (
                    <Chip
                      key={index}
                      label={etiqueta}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Stack>

                <Divider sx={{ my: 1 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {documento.archivoFormato.toUpperCase()} · {formatoBytes(documento.archivoTamanio)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {moment(documento.fechaModificacion).format('DD/MM/YYYY')}
                  </Typography>
                </Box>
              </CardContent>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, pt: 0 }}>
                <Tooltip title="Ver documento">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVerDocumento(documento);
                    }}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Descargar">
                  <IconButton
                    size="small"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Editar">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDocumentoSeleccionado(documento);
                      setMostrarFormulario(true);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('¿Estás seguro de que deseas eliminar este documento?')) {
                        deleteDocumento(documento.id);
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Card>
          </Box>
        ))}

        {documentosFiltrados.length === 0 && (
          <Box sx={{ width: '100%', textAlign: 'center', py: 5 }}>
            <Typography variant="h6" color="text.secondary">
              No se encontraron documentos con los filtros aplicados
            </Typography>
          </Box>
        )}
      </Box>

      {/* Modal para el formulario */}
      <Dialog
        open={mostrarFormulario}
        onClose={handleCerrarFormulario}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <FormularioDocumento
            documento={documentoSeleccionado || undefined}
            onCancel={handleCerrarFormulario}
            onSubmit={handleGuardarDocumento}
          />
        </DialogContent>
      </Dialog>

      {/* Modal para la vista de detalle */}
      <Dialog
        open={mostrarVistaDetalle && !!documentoSeleccionado}
        onClose={handleCerrarVistaDetalle}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {documentoSeleccionado && (
            <VistaDocumento
              documento={documentoSeleccionado}
              cliente={clienteSeleccionado}
              expediente={expedienteSeleccionado}
              onEdit={handleEditarDocumento}
              onClose={handleCerrarVistaDetalle}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Documentos;
