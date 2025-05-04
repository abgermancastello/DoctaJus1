import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error, user } = useAuth();
  const navigate = useNavigate();

  // Estado adicional para mensajes de depuración
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  useEffect(() => {
    // Si ya hay un usuario autenticado, redirigir al dashboard
    if (user) {
      console.log('Usuario ya autenticado, redirigiendo al dashboard');
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Iniciando proceso de login');

    if (!email || !password) {
      setDebugInfo('Email y contraseña son obligatorios');
      return;
    }

    setIsSubmitting(true);
    setDebugInfo('Enviando solicitud de login...');

    try {
      console.log('Llamando a función login con email:', email);
      const success = await login(email, password);

      if (success) {
        console.log('Login exitoso, redirigiendo inmediatamente...');
        setDebugInfo('Login exitoso, redirigiendo...');

        // Redirección forzada después de un breve retraso si el cambio de estado no lo activa
        setTimeout(() => {
          console.log('Forzando redirección al dashboard después del timeout');
          window.location.href = '/'; // Forzar navegación directamente
        }, 1000);
      } else {
        console.log('Login fallido');
        setDebugInfo('Login fallido. Verifique el error mostrado.');
      }
    } catch (error) {
      console.error('Error inesperado en inicio de sesión:', error);
      setDebugInfo(`Error inesperado: ${(error as Error).message}`);
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
          <h1 className="text-3xl font-bold text-gray-900">DoctaJus</h1>
          <p className="text-gray-600 mt-2">Sistema de gestión jurídica profesional</p>
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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {debugInfo && process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-100 border-l-4 border-gray-500 p-4 text-sm">
              <strong>Información de depuración:</strong> {debugInfo}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:bg-blue-300 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>

          <div className="text-center text-sm text-gray-600">
            ¿No tienes una cuenta? <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">Regístrate</Link>
          </div>
        </form>

        <div className="text-center text-sm text-gray-500 mt-8">
          © 2025 DoctaJus. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );
};

export default Login;
