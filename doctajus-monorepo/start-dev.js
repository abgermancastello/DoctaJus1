/**
 * Script para iniciar el entorno de desarrollo completo
 * Inicia tanto el backend como el frontend
 * Ejecuta este script con: node start-dev.js
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const net = require('net');

console.log('=== INICIANDO ENTORNO DE DESARROLLO DOCTAJUS ===');

// Función para comprobar si un puerto está en uso
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => resolve(true))
      .once('listening', () => {
        server.close();
        resolve(false);
      })
      .listen(port);
  });
}

// Función para iniciar un proceso
function startProcess(name, command, args, cwd, callback) {
  console.log(`Iniciando ${name}...`);

  // Guardar una referencia al entorno actual
  const currentEnv = process.env;

  const childProcess = spawn(command, args, {
    cwd: path.join(__dirname, cwd),
    stdio: 'inherit',
    shell: true,
    env: {
      ...currentEnv,
      FORCE_COLOR: true
    }
  });

  childProcess.on('error', (error) => {
    console.error(`Error al iniciar ${name}:`, error.message);
    if (callback) callback(false);
  });

  childProcess.on('exit', (code) => {
    if (code !== 0) {
      console.error(`${name} se detuvo con código de error: ${code}`);
      if (callback) callback(false);
    } else {
      console.log(`${name} completado correctamente.`);
      if (callback) callback(true);
    }
  });

  return childProcess;
}

// Verificar si necesitamos compilar el backend
const backendPath = path.join(__dirname, 'api/express-backend');
const distServerExists = fs.existsSync(path.join(backendPath, 'dist', 'server.js'));
const srcServerExists = fs.existsSync(path.join(backendPath, 'src', 'server.ts'));
const tsNodeInstalled = fs.existsSync(path.join(backendPath, 'node_modules', '.bin', 'ts-node')) ||
                       fs.existsSync(path.join(__dirname, 'node_modules', '.bin', 'ts-node'));

// Función para esperar a que un servicio esté disponible
async function waitForService(port, maxAttempts = 30, delay = 1000) {
  console.log(`Esperando a que el servicio en el puerto ${port} esté disponible...`);
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const inUse = await isPortInUse(port);
    if (inUse) {
      console.log(`El servicio en el puerto ${port} está disponible.`);
      return true;
    }

    console.log(`Intento ${attempt}/${maxAttempts} - Servicio no disponible, esperando...`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  console.error(`El servicio en el puerto ${port} no está disponible después de ${maxAttempts} intentos.`);
  return false;
}

// Función para iniciar todo el entorno
async function startEnvironment() {
  try {
    console.log('Verificando si los puertos necesarios están libres...');

    // Verificar el puerto del backend (4002)
    const backendPort = 4002;
    const backendPortInUse = await isPortInUse(backendPort);
    if (backendPortInUse) {
      console.error(`ERROR: El puerto ${backendPort} ya está en uso. No se puede iniciar el backend.`);
      console.log('Solución: Cierra cualquier aplicación que esté usando ese puerto o modifica el puerto en la configuración.');
      process.exit(1);
    }

    // Verificar el puerto del frontend (3000)
    const frontendPort = 3000;
    const frontendPortInUse = await isPortInUse(frontendPort);
    if (frontendPortInUse) {
      console.error(`ERROR: El puerto ${frontendPort} ya está en uso. No se puede iniciar el frontend.`);
      console.log('Solución: Cierra cualquier aplicación que esté usando ese puerto o modifica el puerto en la configuración.');
      process.exit(1);
    }

    // Iniciar el backend (Express)
    console.log('Iniciando el backend (Express)...');
    const backendProcess = startProcess(
      'Backend (Express)',
      'node',
      ['start.js'],
      'api/express-backend'
    );

    // Esperar a que el backend esté disponible antes de iniciar el frontend
    console.log('Esperando a que el backend esté listo (15 segundos)...');
    await new Promise(resolve => setTimeout(resolve, 15000));

    // Iniciar el frontend (React) una vez que el backend esté listo
    console.log('Iniciando el frontend (React)...');
    const frontendProcess = startProcess(
      'Frontend (React)',
      process.platform === 'win32' ? 'npm.cmd' : 'npm',
      ['start'],
      'app'
    );

    // Manejar terminación del frontend
    frontendProcess.on('exit', () => {
      console.log('Frontend detenido. Deteniendo backend...');
      backendProcess.kill('SIGINT');
    });

    // Establecer manejadores para detectar fallos
    backendProcess.on('error', (error) => {
      console.error('Error en el proceso del backend:', error.message);
    });

    frontendProcess.on('error', (error) => {
      console.error('Error en el proceso del frontend:', error.message);
    });

    // Manejar señal de terminación
    process.on('SIGINT', () => {
      console.log('\n=== DETENIENDO TODOS LOS PROCESOS ===');
      frontendProcess.kill('SIGINT');
      backendProcess.kill('SIGINT');
    });

    // Mostrar instrucciones para el usuario
    console.log('\n=== ENTORNO DE DESARROLLO INICIADO ===');
    console.log('Backend: http://localhost:4002');
    console.log('Frontend: http://localhost:3000');
    console.log('Presiona Ctrl+C para detener ambos servicios');
  } catch (error) {
    console.error('Error al iniciar el entorno de desarrollo:', error.message);
    process.exit(1);
  }
}

// Comprobar si necesitamos compilar el backend primero
if (!distServerExists && srcServerExists && !tsNodeInstalled) {
  console.log('No se encontró la versión compilada del backend. Compilando primero...');

  // Compilar el backend
  const buildProcess = startProcess(
    'Compilación Backend',
    'node',
    ['build.js'],
    'api/express-backend',
    (success) => {
      if (success) {
        startEnvironment();
      } else {
        console.error('La compilación del backend falló. No se puede iniciar el entorno.');
        process.exit(1);
      }
    }
  );
} else {
  // Iniciar directamente
  startEnvironment();
}
