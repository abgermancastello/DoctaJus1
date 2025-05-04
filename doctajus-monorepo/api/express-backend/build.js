/**
 * Script para compilar el backend
 * Ejecuta este script con: node build.js
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('=== COMPILANDO BACKEND EXPRESS ===');

// Función para comprobar si existe un archivo
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

// Verificar si TypeScript está instalado
let tscPath = '';
const possiblePaths = [
  path.join(__dirname, 'node_modules', '.bin', 'tsc'),
  path.join(__dirname, 'node_modules', '.bin', 'tsc.cmd'), // Para Windows
  path.join(__dirname, '..', '..', 'node_modules', '.bin', 'tsc'),
  path.join(__dirname, '..', '..', 'node_modules', '.bin', 'tsc.cmd') // Para Windows
];

for (const potentialPath of possiblePaths) {
  if (fileExists(potentialPath)) {
    tscPath = potentialPath;
    break;
  }
}

if (!tscPath) {
  console.error('ERROR: TypeScript (tsc) no está instalado o no se encuentra.');
  console.log('Intentando usar npm para ejecutar tsc...');

  // Intentar usar npm run build como alternativa
  console.log('Ejecutando compilación con: npm run build');
  const buildProcess = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });

  buildProcess.on('error', (error) => {
    console.error('Error durante la compilación:', error.message);
    console.log('Por favor, instala TypeScript con: npm install --save-dev typescript');
    process.exit(1);
  });

  buildProcess.on('exit', (code) => {
    if (code !== 0) {
      console.error(`La compilación falló con código de error: ${code}`);
      process.exit(code);
    } else {
      console.log('=== COMPILACIÓN COMPLETADA EXITOSAMENTE ===');
      console.log('El servidor está listo para ser iniciado con: node start.js');
    }
  });

  return;
}

// Ejecutar la compilación con tsc directamente
console.log(`Ejecutando compilación con TypeScript: ${tscPath}`);
const buildProcess = spawn(tscPath, [], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

buildProcess.on('error', (error) => {
  console.error('Error durante la compilación:', error.message);
  process.exit(1);
});

buildProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`La compilación falló con código de error: ${code}`);
    process.exit(code);
  } else {
    console.log('=== COMPILACIÓN COMPLETADA EXITOSAMENTE ===');
    console.log('El servidor está listo para ser iniciado con: node start.js');
  }
});
