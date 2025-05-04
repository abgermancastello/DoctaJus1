import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [resetInfo, setResetInfo] = useState<{ token?: string; resetUrl?: string } | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setMessage({ text: 'Por favor ingrese su dirección de correo electrónico', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setResetInfo(null);

    try {
      // Llamar al endpoint de recuperación de contraseña
      const response = await authService.forgotPassword(email);

      // Si fue exitoso, mostrar mensaje
      setMessage({
        text: 'Se ha enviado un correo con instrucciones para restablecer su contraseña',
        type: 'success'
      });

      // En modo desarrollo, mostramos el token y URL para facilitar pruebas
      if (response.resetToken && response.resetUrl) {
        setResetInfo({
          token: response.resetToken,
          resetUrl: response.resetUrl
        });
      }

      // Opcional: redireccionar después de un tiempo (solo si no hay info de desarrollo)
      if (!response.resetToken) {
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      }

    } catch (error: any) {
      // Mostrar mensaje de error
      setMessage({
        text: error.response?.data?.message || 'Ocurrió un error al procesar su solicitud',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="DoctaJus Logo" className="h-16 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Recuperar Contraseña</h1>
          <p className="text-gray-600 mt-2">Ingrese su correo electrónico para recibir instrucciones</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="nombre@ejemplo.com"
              autoComplete="email"
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

          {/* Mostrar información de reseteo solo en desarrollo */}
          {resetInfo && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-sm">
              <p className="font-bold">Información para desarrollo:</p>
              <p className="mt-1">Ya que estás en modo desarrollo, aquí tienes el token de recuperación:</p>
              <p className="mt-2 font-mono text-xs break-all bg-gray-100 p-2 rounded">{resetInfo.token}</p>
              <p className="mt-2">Puedes usar este link para restablecer tu contraseña:</p>
              <a
                href={resetInfo.resetUrl}
                className="mt-1 text-blue-600 hover:underline break-all block"
                target="_blank"
                rel="noopener noreferrer"
              >
                {resetInfo.resetUrl}
              </a>
              <p className="mt-2">O ir directamente a:</p>
              <Link
                to={`/reset-password?token=${resetInfo.token}`}
                className="mt-1 text-blue-600 hover:underline"
              >
                Página de restablecimiento de contraseña
              </Link>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:bg-blue-300 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar instrucciones'}
          </button>

          <div className="text-center text-sm text-gray-600 space-y-2">
            <div>
              <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Regresar al inicio de sesión
              </Link>
            </div>
          </div>
        </form>

        <div className="text-center text-sm text-gray-500 mt-8">
          © 2025 DoctaJus. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
