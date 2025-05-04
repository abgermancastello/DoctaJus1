# DoctaJus - Backend API

API REST desarrollada con Express.js y TypeScript para el sistema de gestión de estudio jurídico DoctaJus.

## Requisitos previos

- Node.js (v16 o superior)
- MongoDB (v4.4 o superior)
- npm o yarn

## Instalación

1. Clonar el repositorio o navegar a la carpeta del proyecto

```bash
cd doctajus-monorepo/api/express-backend
```

2. Instalar dependencias

```bash
npm install
```

3. Crear archivo `.env` en la raíz del proyecto con las siguientes variables:

```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/doctajus
JWT_SECRET=doctajus_jwt_secret_dev_key
JWT_EXPIRES_IN=1d
NODE_ENV=development
```

## Ejecución

### Modo desarrollo

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:4000` en modo desarrollo con recarga automática.

### Construir para producción

```bash
npm run build
```

### Iniciar en producción

```bash
npm start
```

## Características

- Autenticación con JWT
- Validación de datos con express-validator
- Manejador global de errores
- Protección de rutas basada en roles
- Soporte para MongoDB con Mongoose
- TypeScript para tipado estático
- Arquitectura modular y escalable

## Estructura de carpetas

```
src/
  ├── config/         # Configuración de la aplicación
  ├── controllers/    # Controladores de rutas
  ├── middleware/     # Middleware personalizado
  ├── models/         # Modelos de datos Mongoose
  ├── routes/         # Definición de rutas
  ├── services/       # Lógica de negocio
  ├── types/          # Definiciones de tipos TypeScript
  ├── utils/          # Utilidades y funciones auxiliares
  ├── app.ts          # Configuración de Express
  └── server.ts       # Punto de entrada de la aplicación
```

## Semillas de datos

Para poblar la base de datos con datos de prueba, ejecutar:

```bash
npm run seed
```

Esto creará:

- Usuarios de prueba (admin, abogado, asistente)
- Clientes (personas y empresas)
- Expedientes jurídicos
- Tareas asignadas

## Sistema de Autenticación

### Access Tokens y Refresh Tokens

El sistema implementa una autenticación basada en tokens JWT con dos tipos de tokens:

1. **Access Token**: Token de corta duración (15 minutos por defecto)

   - Se usa para autorizar peticiones a la API
   - Se envía en el header Authorization: `Bearer <token>`
   - Contiene la identidad del usuario y sus roles

2. **Refresh Token**: Token de larga duración (7 días por defecto)
   - Se usa para obtener nuevos access tokens
   - Se almacena en una cookie HttpOnly o en el cuerpo de la petición
   - Permite mantener la sesión sin pedir credenciales nuevamente

### Endpoints de Autenticación

#### Login

```
POST /api/auth/login
```

**Body:**

```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña"
}
```

**Respuesta:**

```json
{
  "success": true,
  "token": "jwt-token-compatible",
  "accessToken": "jwt-access-token",
  "user": {
    "id": "user-id",
    "nombre": "Nombre",
    "apellido": "Apellido",
    "email": "usuario@ejemplo.com",
    "role": "user-role"
  }
}
```

#### Refresh Token

```
POST /api/auth/refresh-token
```

**Body (opcional si se usa cookie):**

```json
{
  "refreshToken": "refresh-token-value"
}
```

**Respuesta:**

```json
{
  "success": true,
  "token": "jwt-token-compatible",
  "accessToken": "jwt-access-token",
  "user": {
    "id": "user-id",
    "nombre": "Nombre",
    "apellido": "Apellido",
    "email": "usuario@ejemplo.com",
    "role": "user-role"
  }
}
```

#### Logout

```
POST /api/auth/logout
```

**Body (opcional si se usa cookie):**

```json
{
  "refreshToken": "refresh-token-value"
}
```

**Respuesta:**

```json
{
  "success": true,
  "message": "Sesión cerrada correctamente"
}
```

### Configuración

El comportamiento del sistema de tokens se puede configurar mediante variables de entorno:

- `USE_REFRESH_TOKENS`: Habilita o deshabilita el sistema de refresh tokens (true/false)
- `JWT_SECRET`: Clave secreta para firmar los access tokens
- `JWT_EXPIRES_IN`: Tiempo de expiración de los access tokens (15m, 1h, etc.)
- `REFRESH_TOKEN_SECRET`: Clave secreta para firmar los refresh tokens
- `REFRESH_TOKEN_EXPIRATION`: Tiempo de expiración de los refresh tokens (7d, 30d, etc.)
- `REFRESH_TOKEN_EXPIRATION_DAYS`: Número de días de validez para los refresh tokens (7, 30, etc.)

### Compatibilidad con Sistema Anterior

El sistema mantiene compatibilidad con la implementación anterior:

- El endpoint `/api/auth/login` devuelve el campo `token` exactamente como antes
- Las aplicaciones cliente existentes pueden seguir usando el token de la misma manera
- Las nuevas aplicaciones pueden usar el sistema mejorado de refresh tokens

### Manejo de Sesiones

El sistema permite:

1. Mantener sesiones de larga duración sin comprometer la seguridad
2. Cerrar sesión en todos los dispositivos
3. Renovar tokens sin interrumpir la experiencia del usuario

## API Endpoints

### Autenticación

- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual
- `POST /api/auth/change-password` - Cambiar contraseña

### Usuarios

- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener un usuario
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Expedientes

- `GET /api/expedientes` - Listar expedientes
- `GET /api/expedientes/:id` - Obtener un expediente
- `POST /api/expedientes` - Crear expediente
- `PUT /api/expedientes/:id` - Actualizar expediente
- `DELETE /api/expedientes/:id` - Eliminar expediente

### Tareas

- `GET /api/tareas` - Listar tareas
- `GET /api/tareas/:id` - Obtener una tarea
- `POST /api/tareas` - Crear tarea
- `PUT /api/tareas/:id` - Actualizar tarea
- `DELETE /api/tareas/:id` - Eliminar tarea

## Licencia

MIT
