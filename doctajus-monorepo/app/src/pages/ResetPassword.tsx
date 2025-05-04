import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Extraer token de los parámetros de la URL
    const queryParams = new URLSearchParams(location.search);
    const urlToken = queryParams.get('token');

    if (urlToken) {
      setToken(urlToken);
      validateToken(urlToken);
    } else {
      setTokenValid(false);
      setMessage({
        text: 'El enlace no es válido o ha expirado. Por favor solicite un nuevo enlace para restablecer su contraseña.',
        type: 'error'
      });
    }
  }, [location]);

  const validateToken = async (token: string) => {
    try {
      // Validar el token con el backend
      await authService.validateResetToken(token);
      setTokenValid(true);
    } catch (error) {
      setTokenValid(false);
      setMessage({
        text: 'El enlace no es válido o ha expirado. Por favor solicite un nuevo enlace para restablecer su contraseña.',
        type: 'error'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (password.length < 8) {
      setMessage({
        text: 'La contraseña debe tener al menos 8 caracteres',
        type: 'error'
      });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({
        text: 'Las contraseñas no coinciden',
        type: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      // Enviar solicitud al backend
      await authService.resetPassword(token, password);

      // Mensaje de éxito
      setMessage({
        text: 'Su contraseña ha sido restablecida con éxito. Redirigiendo al inicio de sesión...',
        type: 'success'
      });

      // Redireccionar después de un tiempo
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error: any) {
      setMessage({
        text: error.response?.data?.message || 'Ocurrió un error al restablecer su contraseña',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (tokenValid === null) {
    // Estado de carga mientras se valida el token
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando enlace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="DoctaJus Logo" className="h-16 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Restablecer Contraseña</h1>
          <p className="text-gray-600 mt-2">Ingrese su nueva contraseña</p>
        </div>

        {!tokenValid ? (
          <div className="text-center">
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-md text-sm mb-6">
              {message?.text || 'El enlace no es válido o ha expirado.'}
            </div>
            <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800 font-medium">
              Solicitar un nuevo enlace
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Nueva contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar contraseña
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            {message && (
              <div
                className={`px-4 py-3 rounded-md text-sm ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:bg-blue-300 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Procesando...' : 'Restablecer contraseña'}
            </button>

            <div className="text-center text-sm text-gray-600">
              <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Regresar al inicio de sesión
              </Link>
            </div>
          </form>
        )}

        <div className="text-center text-sm text-gray-500 mt-8">
          © 2025 DoctaJus. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
