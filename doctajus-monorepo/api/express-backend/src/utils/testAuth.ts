import axios from 'axios';
import logger from '../config/logger';

const API_URL = 'http://localhost:4002/api';

async function testAuth() {
  try {
    // 1. Registrar un nuevo usuario
    logger.info('Probando registro de usuario...');
    const registerResponse = await axios.post(`${API_URL}/auth/register`, {
      nombre: 'Usuario Prueba',
      email: 'usuario@prueba.com',
      password: '123456',
      role: 'asistente'
    });
    logger.info('Registro exitoso:', registerResponse.data);

    // 2. Iniciar sesión
    logger.info('\nProbando login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'usuario@prueba.com',
      password: '123456'
    });
    logger.info('Login exitoso:', loginResponse.data);

    const token = loginResponse.data.data.token;

    // 3. Obtener perfil
    logger.info('\nProbando obtener perfil...');
    const profileResponse = await axios.get(`${API_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    logger.info('Perfil obtenido:', profileResponse.data);

  } catch (error: any) {
    if (error.response) {
      logger.error('Error en la respuesta:', {
        status: error.response.status,
        data: error.response.data
      });
    } else {
      logger.error('Error:', error.message);
    }
  }
}

// Ejecutar las pruebas
testAuth();
