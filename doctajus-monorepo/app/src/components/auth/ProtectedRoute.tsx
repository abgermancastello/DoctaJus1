import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute: React.FC = () => {
  const { user, isLoading, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si hay un error en la autenticación, ir al login
    if (error && !isLoading) {
      navigate('/login');
    }
  }, [error, isLoading, navigate]);

  // Si está cargando, mostramos un indicador
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  // Si no hay usuario autenticado, redirigimos a login
  if (!user) {
    console.log('No hay usuario autenticado, redirigiendo al login');
    return <Navigate to="/login" replace />;
  }

  // Si hay usuario, permitimos acceso a la ruta protegida
  return <Outlet />;
};

export default ProtectedRoute;
