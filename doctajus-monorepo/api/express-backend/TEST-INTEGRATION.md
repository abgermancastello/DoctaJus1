# Guía para probar la integración de DoctaJus

Este documento proporciona una guía paso a paso para probar la integración completa entre el frontend (React) y el backend (Express) del sistema DoctaJus.

## Prerequisitos

1. MongoDB instalado y en ejecución
2. Backend y Frontend instalados y configurados
3. Variables de entorno configuradas correctamente

## Pasos para la prueba

### 1. Iniciar el backend

```bash
cd doctajus-monorepo/api/express-backend
npm run dev
```

El servidor debe iniciar en http://localhost:4000

### 2. Iniciar el frontend

```bash
cd doctajus-monorepo/app
npm start
```

La aplicación React debe iniciar en http://localhost:3000

### 3. Cargar datos de prueba en la base de datos

```bash
cd doctajus-monorepo/api/express-backend
npm run seed
```

Esto cargará usuarios, clientes, expedientes y tareas de prueba.

### 4. Pruebas de funcionalidad

#### 4.1. Prueba de autenticación

1. Visitar http://localhost:3000/login
2. Iniciar sesión con las credenciales:
   - Email: admin@doctajus.com
   - Contraseña: admin123
3. Verificar que se redirige al dashboard
4. Verificar que aparece el nombre del usuario en la barra de navegación

#### 4.2. Prueba de expedientes

1. Ir a la sección "Expedientes"
2. Verificar que se cargan los expedientes desde el backend
3. Crear un nuevo expediente
   - Hacer clic en "Nuevo Expediente"
   - Completar el formulario
   - Guardar y verificar que aparece en la lista
4. Editar un expediente existente
   - Hacer clic en un expediente de la lista
   - Modificar algunos campos
   - Guardar y verificar que los cambios se reflejan
5. Filtrar expedientes
   - Usar el campo de búsqueda
   - Filtrar por estado
   - Verificar que los resultados son correctos

#### 4.3. Prueba de tareas

1. Ir a la sección "Tareas"
2. Verificar que se cargan las tareas desde el backend
3. Crear una nueva tarea
   - Hacer clic en "Nueva Tarea"
   - Completar el formulario
   - Guardar y verificar que aparece en la lista
4. Marcar una tarea como completada
   - Cambiar el estado de una tarea a "Completada"
   - Verificar que se actualiza correctamente
5. Verificar que se muestran las tareas vencidas
   - Usar el filtro de tareas vencidas
   - Verificar que se muestran correctamente

#### 4.4. Prueba de integración entre expedientes y tareas

1. Ir a un expediente específico
2. Verificar que se muestran las tareas asociadas a ese expediente
3. Crear una nueva tarea desde la vista de expediente
4. Verificar que la tarea se asocia correctamente al expediente

#### 4.5. Prueba de usuarios y permisos

1. Cerrar sesión
2. Iniciar sesión con un usuario abogado (juan@doctajus.com / abogado123)
3. Verificar que tiene acceso limitado a ciertas funciones
4. Cerrar sesión
5. Iniciar sesión con un usuario asistente (maria@doctajus.com / asistente123)
6. Verificar que tiene acceso limitado a ciertas funciones

## Problemas comunes y soluciones

### Error de conexión a la base de datos

Verificar que MongoDB está en ejecución:

```bash
mongod --version
```

### Error de CORS

Verificar que el backend tiene configurado correctamente CORS para permitir solicitudes desde el frontend:

```javascript
app.use(cors());
```

### Errores de autenticación

Verificar que el token JWT se está almacenando correctamente en localStorage y se envía en las cabeceras de las solicitudes.

## Pruebas avanzadas

### Pruebas de rendimiento

Verificar el rendimiento con un gran volumen de datos:

```bash
cd doctajus-monorepo/api/express-backend
npm run seed -- --count=100
```

### Pruebas de seguridad

1. Intentar acceder a rutas protegidas sin autenticación
2. Intentar realizar acciones no permitidas para el rol del usuario

## Flujos de trabajo completos

### Flujo de trabajo 1: Gestión completa de un expediente

1. Crear un nuevo cliente
2. Crear un nuevo expediente para ese cliente
3. Asignar tareas al expediente
4. Completar tareas
5. Cambiar estado del expediente
6. Verificar historial de cambios

### Flujo de trabajo 2: Gestión de tareas vencidas

1. Identificar tareas vencidas
2. Reasignar a otro responsable
3. Actualizar fecha de vencimiento
4. Verificar notificaciones
