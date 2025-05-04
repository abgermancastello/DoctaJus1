import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Expedientes from './pages/Expedientes';
import ExpedienteForm from './components/forms/ExpedienteForm';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Tareas from './pages/Tareas';
import Calendario from './pages/Calendario';
import Tesoreria from './pages/Tesoreria';
import Facturas from './pages/Facturas';
import ConfigFinanzas from './pages/ConfigFinanzas';
import Documentos from './pages/Documentos';
import Directorio from './pages/Directorio';
import Perfil from './pages/Perfil';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DetalleExpediente from './pages/DetalleExpediente';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Rutas protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/expedientes" element={<Expedientes />} />
        <Route path="/tareas" element={<Tareas />} />
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/tesoreria" element={<Tesoreria />} />
        <Route path="/facturas" element={<Facturas />} />
        <Route path="/config-finanzas" element={<ConfigFinanzas />} />
        <Route path="/documentos" element={<Documentos />} />
        <Route path="/plantillas" element={<Documentos />} />
        <Route path="/directorio" element={<Directorio />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/configuracion" element={<Perfil />} />
        <Route path="/permisos" element={<Perfil />} />
        <Route path="/expedientes/nuevo" element={<ExpedienteForm />} />
        <Route path="/expedientes/:id" element={<DetalleExpediente />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
