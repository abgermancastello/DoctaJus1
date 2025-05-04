/**
 * Script para iniciar el servidor de backend
 * Ejecuta este script con: node start.js
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const net = require('net');

// Función para comprobar si existe un archivo
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

// Función para verificar si un puerto está en uso
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

// Función para encontrar un puerto disponible
async function findAvailablePort(startPort) {
  let port = startPort;
  while (await isPortInUse(port)) {
    console.log(`Puerto ${port} en uso, intentando con ${port + 1}...`);
    port++;
    if (port > startPort + 10) {
      throw new Error('No se pudo encontrar un puerto disponible después de 10 intentos');
    }
  }
  return port;
}

// Verificar archivos disponibles
const distServerExists = fileExists(path.join(__dirname, 'dist', 'server.js'));
const srcServerExists = fileExists(path.join(__dirname, 'src', 'server.ts'));

// Puerto preferido
const PREFERRED_PORT = 4002;

// Iniciar servidor con el puerto verificado
async function startServer() {
  try {
    const port = await findAvailablePort(PREFERRED_PORT);
    console.log(`Iniciando servidor de backend en puerto ${port}...`);
    console.log('Presiona Ctrl+C para detener el servidor.');

    // En Windows, ejecutar directamente con npm es más seguro cuando hay espacios en la ruta
    const isWindows = process.platform === 'win32';

    // Determinar cómo ejecutar
    if (distServerExists) {
      // Si existe la versión compilada, usar node con el archivo JS
      console.log('Usando versión compilada (dist/server.js)');
      executeNodeServer('dist/server.js', port);
    } else if (srcServerExists) {
      if (isWindows) {
        // En Windows, usamos npm para evitar problemas con espacios en rutas
        console.log('Usando npm para ejecutar ts-node (Windows)');
        const npmProcess = spawn('npm.cmd', ['run', 'start'], {
          cwd: __dirname,
          stdio: 'inherit',
          shell: true,
          env: {
            ...process.env,
            PORT: port,
            NODE_ENV: 'development'
          }
        });

        // Manejadores para el proceso
        npmProcess.on('error', handleProcessError);
        npmProcess.on('exit', handleProcessExit);

        // Manejar señal de terminación
        process.on('SIGINT', () => {
          console.log('\nDeteniendo servidor...');
          npmProcess.kill('SIGINT');
        });
      } else {
        // En Linux/Mac, podemos usar ts-node directamente
        console.log('Usando ts-node con el archivo fuente (src/server.ts)');
        executeWithTsNode(port);
      }
    } else {
      console.error('No se encontró ningún archivo de servidor (ni en dist/server.js ni en src/server.ts)');
      console.log('Compila el proyecto primero o verifica que los archivos existan');
      process.exit(1);
    }
  } catch (error) {
    console.error(`Error al iniciar el servidor: ${error.message}`);
    process.exit(1);
  }
}

// Función para ejecutar con node
function executeNodeServer(serverPath, port) {
  const serverProcess = spawn('node', [serverPath], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      PORT: port,
      NODE_ENV: 'development'
    }
  });

  // Manejadores para el proceso
  serverProcess.on('error', handleProcessError);
  serverProcess.on('exit', handleProcessExit);

  // Manejar señal de terminación
  process.on('SIGINT', () => {
    console.log('\nDeteniendo servidor...');
    serverProcess.kill('SIGINT');
  });
}

// Función para ejecutar con ts-node
function executeWithTsNode(port) {
  // Verificar si ts-node está instalado
  const tsNodePaths = [
    path.join(__dirname, 'node_modules', '.bin', 'ts-node'),
    path.join(__dirname, '..', '..', 'node_modules', '.bin', 'ts-node')
  ];

  let tsNodePath = '';
  for (const potentialPath of tsNodePaths) {
    if (fileExists(potentialPath)) {
      tsNodePath = potentialPath;
      break;
    }
  }

  if (!tsNodePath) {
    // No se encontró ts-node, intentar compilar e iniciar con node
    console.log('ADVERTENCIA: ts-node no está instalado. Intentando compilar primero...');
    executeCompileAndRun();
    return;
  }

  const serverProcess = spawn(tsNodePath, ['src/server.ts'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      PORT: port,
      NODE_ENV: 'development'
    }
  });

  // Manejadores para el proceso
  serverProcess.on('error', handleProcessError);
  serverProcess.on('exit', handleProcessExit);

  // Manejar señal de terminación
  process.on('SIGINT', () => {
    console.log('\nDeteniendo servidor...');
    serverProcess.kill('SIGINT');
  });
}

// Función para compilar y ejecutar
function executeCompileAndRun() {
  console.log('Compilando primero...');
  const buildProcess = spawn('node', ['build.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });

  buildProcess.on('exit', (code) => {
    if (code !== 0) {
      console.error('La compilación falló. No se puede iniciar el servidor.');
      process.exit(1);
    } else {
      // Compilación exitosa, ahora iniciar con node dist/server.js
      console.log('Iniciando servidor con la versión compilada...');
      executeNodeServer('dist/server.js');
    }
  });
}

// Manejadores de eventos para el proceso
function handleProcessError(error) {
  console.error('Error al iniciar el servidor:', error.message);
}

function handleProcessExit(code) {
  if (code !== 0) {
    console.error(`El servidor se detuvo con código de error: ${code}`);
  } else {
    console.log('Servidor detenido correctamente.');
  }
}

// Iniciar el servidor
startServer();
