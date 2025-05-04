import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  Button,
  Grid,
  Stack,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  DialogTitle,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
// Importar íconos individualmente
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import FolderIcon from '@mui/icons-material/Folder';
import HistoryIcon from '@mui/icons-material/History';
import LockIcon from '@mui/icons-material/Lock';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { Documento, Cliente, Expediente, useDocumentoStore } from '../../stores/documentoStore';
import moment from 'moment';
import 'moment/locale/es';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configuración para react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface VistaDocumentoProps {
  documento: Documento;
  cliente?: Cliente;
  expediente?: Expediente;
  onEdit: () => void;
  onClose: () => void;
}

const VistaDocumento: React.FC<VistaDocumentoProps> = ({
  documento,
  cliente,
  expediente,
  onEdit,
  onClose
}) => {
  const {
    destacarDocumento,
    deleteDocumento,
    downloadDocumento,
    fetchVersiones,
    fetchHistorial,
    fetchPermisos,
    versiones,
    historial,
    permisos,
    loading
  } = useDocumentoStore();

  // Estados para los diálogos
  const [mostrarVisorPDF, setMostrarVisorPDF] = useState(false);
  const [mostrarVersiones, setMostrarVersiones] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [mostrarPermisos, setMostrarPermisos] = useState(false);

  // Estado para react-pdf
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  const handleDestacar = () => {
    destacarDocumento(documento.id, !documento.destacado);
  };

  const handleEliminar = () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este documento?')) {
      deleteDocumento(documento.id);
      onClose();
    }
  };

  const handleDescargar = () => {
    downloadDocumento(documento.id);
  };

  const handleVerVersiones = async () => {
    await fetchVersiones(documento.id);
    setMostrarVersiones(true);
  };

  const handleVerHistorial = async () => {
    await fetchHistorial(documento.id);
    setMostrarHistorial(true);
  };

  const handleVerPermisos = async () => {
    await fetchPermisos(documento.id);
    setMostrarPermisos(true);
  };

  const handleVerPDF = () => {
    setMostrarVisorPDF(true);
  };

  const formatoBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const isPdf = documento.archivoFormato.toLowerCase() === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(documento.archivoFormato.toLowerCase());

  return (
    <Paper elevation={0} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {documento.nombre}
        </Typography>
        <Button
          variant="text"
          color="inherit"
          startIcon={documento.destacado ? <StarIcon color="warning" /> : <StarBorderIcon />}
          onClick={handleDestacar}
        >
          {documento.destacado ? 'Destacado' : 'Destacar'}
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Chip
          label={getTextByEstado(documento.estado)}
          size="small"
          sx={{
            backgroundColor: getColorByEstado(documento.estado),
            color: 'white',
            mr: 1
          }}
        />
        <Chip
          label={documento.tipo.charAt(0).toUpperCase() + documento.tipo.slice(1)}
          variant="outlined"
          size="small"
        />
      </Box>

      {documento.descripcion && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {documento.descripcion}
          </Typography>
        </Box>
      )}

      {isPdf && (
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleVerPDF}
          >
            Previsualizar PDF
          </Button>
        </Box>
      )}

      {isImage && (
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <img
            src={documento.archivoUrl}
            alt={documento.nombre}
            style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
          />
        </Box>
      )}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <DescriptionIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2">
              <strong>Archivo:</strong> {documento.archivoNombre || documento.archivoUrl.split('/').pop()} ({documento.archivoFormato.toUpperCase()}, {formatoBytes(documento.archivoTamanio)})
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PersonIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2">
              <strong>Creado por:</strong> {documento.creadoPor}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          {cliente && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PersonIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">
                <strong>Cliente:</strong> {cliente.nombre}
              </Typography>
            </Box>
          )}

          {expediente && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <FolderIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">
                <strong>Expediente:</strong> {expediente.numero} - {expediente.titulo}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Etiquetas
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
          {documento.etiquetas.map((etiqueta, index) => (
            <Chip
              key={index}
              label={etiqueta}
              size="small"
              variant="outlined"
            />
          ))}
          {documento.etiquetas.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No hay etiquetas para este documento
            </Typography>
          )}
        </Stack>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Creado:</strong> {moment(documento.fechaCreacion).format('DD/MM/YYYY HH:mm')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Modificado:</strong> {moment(documento.fechaModificacion).format('DD/MM/YYYY HH:mm')}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleDescargar}
          >
            Descargar
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
          >
            Imprimir
          </Button>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={handleVerVersiones}
          >
            Versiones
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<LockIcon />}
            onClick={handleVerPermisos}
          >
            Permisos
          </Button>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={handleVerHistorial}
          >
            Historial
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            onClick={onEdit}
          >
            Editar
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleEliminar}
          >
            Eliminar
          </Button>
        </Box>
      </Box>

      {/* Diálogo para Visor PDF */}
      <Dialog
        open={mostrarVisorPDF}
        onClose={() => setMostrarVisorPDF(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Vista previa: {documento.nombre}</Typography>
            <IconButton onClick={() => setMostrarVisorPDF(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Document
              file={documento.archivoUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<CircularProgress />}
              error={<Typography color="error">Error al cargar el PDF</Typography>}
            >
              <Page
                pageNumber={pageNumber}
                width={550}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </Document>
            {numPages && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                <Button
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber(pageNumber - 1)}
                >
                  Anterior
                </Button>
                <Typography>
                  Página {pageNumber} de {numPages}
                </Typography>
                <Button
                  disabled={pageNumber >= numPages}
                  onClick={() => setPageNumber(pageNumber + 1)}
                >
                  Siguiente
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Diálogo para Versiones */}
      <Dialog
        open={mostrarVersiones}
        onClose={() => setMostrarVersiones(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Versiones</Typography>
            <IconButton onClick={() => setMostrarVersiones(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              {versiones.length > 0 ? (
                versiones.map(version => (
                  <Paper key={version.id} elevation={0} sx={{ p: 2, mb: 2, border: '1px solid #eee' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1">
                        Versión {version.numeroVersion}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {moment(version.fechaCreacion).format('DD/MM/YYYY HH:mm')}
                      </Typography>
                    </Box>
                    {version.descripcionCambios && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {version.descripcionCambios}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {version.archivoNombre} ({version.archivoFormato.toUpperCase()}, {formatoBytes(version.archivoTamanio)})
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<PictureAsPdfIcon />}
                        onClick={() => downloadDocumento(documento.id)}
                      >
                        Descargar
                      </Button>
                    </Box>
                  </Paper>
                ))
              ) : (
                <Typography color="text.secondary">No hay versiones disponibles</Typography>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo para Historial */}
      <Dialog
        open={mostrarHistorial}
        onClose={() => setMostrarHistorial(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Historial</Typography>
            <IconButton onClick={() => setMostrarHistorial(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              {historial.length > 0 ? (
                historial.map(item => (
                  <Paper key={item.id} elevation={0} sx={{ p: 2, mb: 2, border: '1px solid #eee' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1">
                        {item.usuario?.nombre || 'Usuario'} - {item.tipoAccion.replace(/_/g, ' ')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {moment(item.fechaAccion).format('DD/MM/YYYY HH:mm')}
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      {item.detalles}
                    </Typography>
                  </Paper>
                ))
              ) : (
                <Typography color="text.secondary">No hay registros en el historial</Typography>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo para Permisos */}
      <Dialog
        open={mostrarPermisos}
        onClose={() => setMostrarPermisos(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Permisos</Typography>
            <IconButton onClick={() => setMostrarPermisos(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              {permisos.length > 0 ? (
                permisos.map(permiso => (
                  <Paper key={permiso.id} elevation={0} sx={{ p: 2, mb: 2, border: '1px solid #eee' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1">
                        {permiso.usuario?.nombre || 'Usuario'}
                      </Typography>
                      <Chip
                        label={permiso.tipoPermiso}
                        color={
                          permiso.tipoPermiso === 'administrador'
                            ? 'error'
                            : permiso.tipoPermiso === 'escritura'
                              ? 'primary'
                              : 'default'
                        }
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Otorgado por: {permiso.otorgadoPor?.nombre || 'Desconocido'} el {moment(permiso.fechaCreacion).format('DD/MM/YYYY')}
                    </Typography>
                  </Paper>
                ))
              ) : (
                <Typography color="text.secondary">No hay permisos registrados</Typography>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default VistaDocumento;
