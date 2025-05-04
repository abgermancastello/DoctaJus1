import { useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null
  });

  // Función de utilidad para desarrollo
  const createDevelopmentUser = () => {
    const mockUser = {
      id: '1',
      nombre: 'Administrador',
      apellido: 'DoctaJus',
      email: 'admin@doctajus.com',
      role: UserRole.ADMIN,
      especialidad: 'Administración',
      activo: true
    };

    try {
      // Crear un token JWT simulado con formato válido
      // Usamos la codificación Base64 adecuada para JWT
      const encodeBase64 = (obj: any) => {
        return btoa(JSON.stringify(obj))
          .replace(/=/g, '')
          .replace(/\+/g, '-')
          .replace(/\//g, '_');
      };

      const header = encodeBase64({ alg: 'HS256', typ: 'JWT' });
      const payload = encodeBase64({
        id: mockUser.id,
        role: mockUser.role,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
      });
      const signature = encodeBase64('mock_signature');
      const mockToken = `${header}.${payload}.${signature}`;

      localStorage.setItem('token', mockToken);
      console.log('Token de desarrollo guardado en localStorage:', mockToken);

      setAuthState({
        user: mockUser,
        isLoading: false,
        error: null
      });
    } catch (e) {
      console.error('Error al crear usuario de desarrollo:', e);

      // Si falla la creación del token, seguimos permitiendo el acceso
      setAuthState({
        user: mockUser,
        isLoading: false,
        error: null
      });
    }
  };

  const loadUser = useCallback(async () => {
    console.log('Intentando cargar usuario...');
    const token = localStorage.getItem('token');

    if (!token) {
      console.log('No hay token, usuario no autenticado');
      setAuthState({
        user: null,
        isLoading: false,
        error: null
      });
      return;
    }

    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      console.log('Solicitando datos del usuario actual al backend...');
      const user = await authService.getCurrentUser();
      console.log('Usuario obtenido correctamente:', user);

      setAuthState({
        user,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Error al cargar el usuario:', error);

      // Manejo específico de errores
      let errorMessage = 'Error al cargar el usuario';

      if (error.response && error.response.status === 404) {
        errorMessage = 'La ruta para obtener el usuario no existe. Verifique la configuración del backend.';
      } else if (error.response && error.response.status === 401) {
        errorMessage = 'Sesión expirada o token inválido.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'No se pudo conectar al servidor. Verifique su conexión.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      // En caso de error, limpiar el token
      localStorage.removeItem('token');

      // En modo desarrollo, si es un error de conexión, usar el usuario de prueba
      if ((process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) &&
          (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED')) {
        console.log('Usando usuario de prueba en desarrollo por error de conexión al cargar usuario');
        createDevelopmentUser();
        return;
      }

      setAuthState({
        user: null,
        isLoading: false,
        error: errorMessage
      });
    }
  }, []);

  // Cargar usuario al iniciar
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email: string, password: string) => {
    console.log(`Intentando iniciar sesión con email: ${email}`);

    try {
      // Actualizar estado a "cargando"
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      // Llamar al servicio de autenticación
      console.log('Enviando credenciales al backend...');
      const result = await authService.login(email, password);
      console.log('Respuesta de login recibida:', result);

      // Extraer token y datos de usuario
      const { token, user } = result.data;

      // Guardar token en localStorage
      localStorage.setItem('token', token);
      console.log('Token guardado en localStorage');

      // Actualizar estado de forma optimizada para evitar re-renders innecesarios
      setAuthState({
        user,
        isLoading: false,
        error: null
      });

      // Devolver éxito de inmediato sin esperar a que React actualice el estado
      return true;
    } catch (error: any) {
      console.error('Error completo al iniciar sesión:', error);

      // Mensaje de error apropiado según el tipo de error
      let errorMessage = 'Credenciales inválidas';

      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        errorMessage = 'No se pudo conectar al servidor. Compruebe su conexión.';
      } else if (error.response) {
        // Error con respuesta del servidor
        if (error.response.status === 429) {
          errorMessage = 'Demasiados intentos. Inténtelo de nuevo más tarde.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }

      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      // Modo desarrollo - usar usuario de prueba en caso de problemas de conexión
      if ((process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) &&
          (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED')) {
        console.log('Usando usuario de prueba en desarrollo por error de conexión');
        // Crear usuario de desarrollo y devolver éxito inmediatamente
        createDevelopmentUser();
        return true;
      }

      return false;
    }
  };

  const register = async (userData: {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
  }) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      console.log('Enviando datos de registro al backend...');
      const response = await authService.register(userData);
      console.log('Respuesta de registro recibida:', response);

      // Si hay token en la respuesta, autenticar al usuario
      if (response.data?.token && response.data?.user) {
        localStorage.setItem('token', response.data.token);
        console.log('Token de registro guardado en localStorage');
        setAuthState({
          user: response.data.user,
          isLoading: false,
          error: null
        });
        return true;
      }

      setAuthState(prev => ({ ...prev, isLoading: false }));
      return true;
    } catch (error: any) {
      console.error('Error al registrar usuario:', error);

      let errorMessage = 'Error al registrar usuario';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return false;
    }
  };

  const logout = async () => {
    console.log('Cerrando sesión...');
    try {
      await authService.logout();
      console.log('Sesión cerrada en el backend');
    } catch (error) {
      console.error('Error al cerrar sesión en el backend:', error);
    } finally {
      // Siempre limpiar el localStorage y el estado
      console.log('Limpiando token del localStorage');
      localStorage.removeItem('token');

      setAuthState({
        user: null,
        isLoading: false,
        error: null
      });
      console.log('Estado de autenticación limpiado');
    }
  };

  return {
    user: authState.user,
    isLoading: authState.isLoading,
    error: authState.error,
    login,
    register,
    logout,
    loadUser
  };
};
