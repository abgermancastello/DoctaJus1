# Guía de Desarrollo DoctaJus

Este documento proporciona una guía completa para el desarrollo, configuración y mantenimiento del proyecto DoctaJus.

## Requisitos previos

- Node.js (v14 o superior)
- npm (v6 o superior)
- MongoDB (instalado localmente o usar MongoDB Atlas)
- TypeScript (instalado globalmente o localmente en el proyecto)

## Estructura del Proyecto

El proyecto está organizado como un monorepo con las siguientes carpetas principales:

### Frontend (`app/`)

- **Tecnologías principales**:

  - React 18.2.0
  - TypeScript
  - Material-UI (MUI) y Ant Design
  - TailwindCSS
  - Zustand para manejo de estado
  - React Router para navegación

- **Características UI/UX**:

  - Sistema de diseño moderno con MUI y Ant Design
  - Gráficos interactivos (Chart.js, Recharts)
  - Calendario interactivo (react-big-calendar)
  - Soporte para PDF (react-pdf)
  - Animaciones con Framer Motion

- **Estructura**:
  - `/src/components` - Componentes reutilizables
  - `/src/pages` - Páginas principales
  - `/src/styles` - Estilos globales y configuración de Tailwind
  - `/src/types` - Definiciones de TypeScript

### Backend (`api/`)

- **Servicios principales**:

  - `express-backend/` - API principal en Express
  - `nest-backend/` - API alternativa en NestJS
  - `ia-service/` - Servicio de IA

- **Características del Backend Express**:
  - TypeScript
  - Sistema de logs
  - Manejo de archivos
  - API RESTful
  - Integración con MongoDB

### Otros Componentes

- `infra/` - Configuración de infraestructura
- `site/` - Sitio web público

## Configuración del Entorno

### 1. Instalación de Dependencias

```bash
# Frontend
cd app
npm install

# Backend Express
cd ../api/express-backend
npm install

# Backend NestJS (opcional)
cd ../api/nest-backend
npm install
```

### 2. Configuración de Variables de Entorno

#### Frontend (.env.local)

```
REACT_APP_API_URL=http://localhost:4002
REACT_APP_ENV=development
```

#### Backend Express (.env)

```
PORT=4002
MONGODB_URI=mongodb://localhost:27017/doctajus
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### 3. Compilación del Backend

```bash
# Usando el script de compilación
cd api/express-backend
node build.js

# O usando TypeScript directamente
npx tsc
```

## Ejecución del Entorno de Desarrollo

### Método 1: Inicio Unificado

```bash
# Desde la raíz del proyecto
node start-dev.js
```

### Método 2: Inicio Separado

**Backend:**

```bash
cd api/express-backend
node build.js  # Si es necesario
node start.js
```

**Frontend:**

```bash
cd app
npm start
```

## Características Técnicas

### Frontend

- **Gestión de Estado**: Zustand
- **UI Components**: MUI, Ant Design
- **Estilos**: TailwindCSS
- **Navegación**: React Router
- **Gráficos**: Chart.js, Recharts
- **Calendario**: react-big-calendar
- **PDF**: react-pdf
- **Animaciones**: Framer Motion

### Backend

- **API**: RESTful
- **Base de Datos**: MongoDB
- **Autenticación**: JWT
- **Logging**: Sistema personalizado
- **Manejo de Archivos**: Sistema de uploads
- **TypeScript**: Tipado estático

## Descripción Detallada de los Backends

### 1. Backend Express (Principal)

#### Arquitectura

- **Estructura MVC (Model-View-Controller)**
  - `models/`: Definiciones de esquemas de MongoDB
  - `controllers/`: Lógica de negocio
  - `routes/`: Definición de endpoints
  - `services/`: Servicios reutilizables
  - `middleware/`: Funciones intermedias
  - `utils/`: Utilidades generales
  - `config/`: Configuraciones
  - `types/`: Definiciones de TypeScript

#### Características Técnicas

1. **Base de Datos**

   - MongoDB como base de datos principal
   - Mongoose como ODM (Object Document Mapper)
   - Esquemas tipados con TypeScript

2. **Seguridad**

   - Autenticación JWT
   - Middleware de autorización
   - Validación de datos
   - Protección contra ataques comunes

3. **API RESTful**

   - Endpoints RESTful
   - Manejo de errores estandarizado
   - Respuestas HTTP consistentes
   - Documentación de API

4. **Características Adicionales**
   - Sistema de logging personalizado
   - Manejo de archivos
   - Caché
   - Rate limiting
   - Validación de datos

### 2. Backend NestJS (Alternativo)

#### Arquitectura

- **Arquitectura Modular**
  - `modules/`: Módulos de la aplicación
  - `controllers/`: Controladores de endpoints
  - `services/`: Servicios de negocio
  - `dto/`: Data Transfer Objects
  - `entities/`: Entidades de base de datos
  - `interfaces/`: Interfaces TypeScript

#### Características Técnicas

1. **Framework Features**

   - Decoradores TypeScript
   - Inyección de dependencias
   - Módulos encapsulados
   - Guards y Pipes

2. **Base de Datos**

   - TypeORM/Mongoose
   - Migraciones
   - Repositorios
   - Relaciones entre entidades

3. **Seguridad**

   - Guards de autenticación
   - Estrategias de autenticación
   - Interceptores
   - Validación de datos con class-validator

4. **Características Adicionales**
   - Swagger para documentación
   - Configuración por entorno
   - Testing integrado
   - WebSockets

### Comparación de Ambos Backends

#### Express Backend

**Ventajas:**

- Más ligero y flexible
- Curva de aprendizaje más suave
- Mejor rendimiento en operaciones simples
- Más fácil de personalizar

**Desventajas:**

- Menos estructura por defecto
- Requiere más configuración manual
- Menos características integradas

#### NestJS Backend

**Ventajas:**

- Arquitectura más robusta
- Más características integradas
- Mejor para proyectos grandes
- Mejor soporte para testing

**Desventajas:**

- Más pesado
- Curva de aprendizaje más pronunciada
- Puede ser excesivo para proyectos pequeños

### Características Compartidas

1. **TypeScript**

   - Tipado estático
   - Interfaces y tipos
   - Decoradores
   - Mejor autocompletado

2. **Seguridad**

   - Autenticación JWT
   - Validación de datos
   - Protección CORS
   - Rate limiting

3. **Base de Datos**

   - MongoDB
   - Esquemas tipados
   - Validación de datos
   - Índices y optimizaciones

4. **Testing**
   - Pruebas unitarias
   - Pruebas de integración
   - Mocks y stubs
   - Cobertura de código

### Recomendaciones de Uso

1. **Usar Express Backend cuando:**

   - El proyecto es pequeño o mediano
   - Se necesita máxima flexibilidad
   - El equipo está más familiarizado con Express
   - Se requiere máximo rendimiento

2. **Usar NestJS Backend cuando:**
   - El proyecto es grande o complejo
   - Se necesita una arquitectura más robusta
   - El equipo está familiarizado con Angular
   - Se requiere más características integradas

## Pruebas y Calidad de Código

### Frontend

- Jest para pruebas unitarias
- React Testing Library
- ESLint para linting
- TypeScript para type safety

### Backend

- Pruebas de integración
- Pruebas unitarias
- ESLint
- TypeScript

## Solución de Problemas

### Problemas Comunes

1. **El backend no se inicia**

   - Verificar MongoDB
   - Comprobar puerto 4002
   - Revisar logs
   - Verificar compilación

2. **Frontend no conecta con backend**

   - Verificar que el backend esté corriendo
   - Comprobar URLs en .env
   - Verificar CORS
   - Comprobar endpoints

3. **Errores de compilación**
   - Verificar TypeScript
   - Comprobar dependencias
   - Limpiar caché de npm
   - Reinstalar node_modules

## Áreas de Mejora

### Frontend

- [ ] Aumentar cobertura de pruebas
- [ ] Optimizar bundle size
- [ ] Mejorar documentación de componentes
- [ ] Implementar PWA features

### Backend

- [ ] Implementar rate limiting
- [ ] Mejorar sistema de caché
- [ ] Optimizar consultas a MongoDB
- [ ] Aumentar cobertura de pruebas

### DevOps

- [ ] Implementar CI/CD
- [ ] Mejorar sistema de logging
- [ ] Implementar monitoreo
- [ ] Optimizar despliegue

## Contribución

1. Crear una rama para tu feature
2. Hacer commit de tus cambios
3. Crear un Pull Request
4. Esperar revisión y aprobación

## Recursos Adicionales

- [Documentación de React](https://reactjs.org/docs)
- [Documentación de Express](https://expressjs.com/)
- [Documentación de MongoDB](https://docs.mongodb.com/)
- [Documentación de TypeScript](https://www.typescriptlang.org/docs/)
