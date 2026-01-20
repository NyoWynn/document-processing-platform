# Document Processing & Analytics Platform

[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=flat&logo=github)](https://github.com/NyoWynn/document-processing-platform)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=flat&logo=vue.js&logoColor=4FC08D)](https://vuejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![PowerBI](https://img.shields.io/badge/PowerBI-F2C811?style=flat&logo=power-bi&logoColor=black)](https://powerbi.microsoft.com/)

## 📋 Descripción del Proyecto

**Document Processing & Analytics Platform** es una solución integral de **ETL (Extract, Transform, Load)** diseñada para procesar documentos PDF, extraer información estructurada y transformarla en datos analizables. El sistema incluye una API REST robusta con autenticación JWT, una interfaz web moderna y responsiva, y un dashboard de Business Intelligence para análisis avanzados.

Este proyecto demuestra competencias en arquitectura de software full-stack, procesamiento de documentos, gestión de bases de datos relacionales, autenticación y autorización, integración con herramientas de BI, y desarrollo de interfaces de usuario modernas.

### 🎯 Objetivos del Sistema

El sistema está diseñado para resolver el problema común de **ingesta de datos desde documentos no estructurados** (PDFs) hacia sistemas de almacenamiento estructurados (bases de datos relacionales), permitiendo:

- ✅ **Extracción automatizada** de datos desde documentos PDF
- ✅ **Normalización y validación** de datos extraídos
- ✅ **Carga idempotente** en base de datos MySQL
- ✅ **API REST segura** con autenticación basada en tokens JWT
- ✅ **Interfaz web intuitiva** para gestión y visualización de datos
- ✅ **Dashboard de BI** para análisis y reportes avanzados

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐
│   PDF Document  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│      Backend API (NestJS)           │
│  ┌───────────────────────────────┐  │
│  │  PDF Processing Service       │  │
│  │  - Extract                    │  │
│  │  - Transform/Normalize        │  │
│  │  - Validate                   │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  REST API                     │  │
│  │  - Authentication (JWT)       │  │
│  │  - CRUD Operations            │  │
│  │  - File Upload                │  │
│  └───────────────────────────────┘  │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────┐
│   MySQL DB      │
│  - Records      │
│  - Users        │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌─────────────────┐
│ Frontend│ │  PowerBI        │
│ (Vue 3) │ │  Dashboard      │
└─────────┘ └─────────────────┘
```

## ✨ Características Principales

### 🔐 Autenticación y Seguridad
- Autenticación JWT (JSON Web Tokens)
- Guards de protección de rutas
- Encriptación de contraseñas con bcrypt
- Validación de datos en entrada y salida
- CORS configurado para seguridad

### 📄 Procesamiento de Documentos
- Extracción de datos estructurados desde PDFs
- Normalización automática de datos
- Validación de formato y tipos de datos
- Procesamiento idempotente (previene duplicados)

### 🗄️ Gestión de Datos
- API REST completa (CRUD)
- Operaciones idempotentes para ingesta de datos
- Relaciones y constraints en base de datos
- Migraciones con TypeORM

### 🎨 Interfaz de Usuario
- Diseño responsivo con Vuetify 3
- Gestión de estado con Pinia
- Tablas interactivas con filtros y paginación
- Formularios validados
- Navegación con Vue Router

### 📊 Business Intelligence
- Dashboard interactivo en PowerBI
- Conexión directa a MySQL
- Visualizaciones avanzadas (gráficos, tablas, métricas)
- Análisis de tendencias y agregaciones

## 🛠️ Stack Tecnológico

### Backend
- **Framework**: NestJS 11 (TypeScript)
- **Base de Datos**: MySQL con TypeORM
- **Autenticación**: JWT con Passport.js
- **Validación**: class-validator, class-transformer
- **PDF Processing**: pdf-parse
- **Seguridad**: bcryptjs

### Frontend
- **Framework**: Vue 3 (Composition API)
- **UI Library**: Vuetify 3
- **Estado**: Pinia
- **Ruteo**: Vue Router 4
- **HTTP Client**: Axios
- **Build Tool**: Vite

### Base de Datos y BI
- **Base de Datos**: MySQL 8+
- **ORM**: TypeORM
- **BI Tool**: PowerBI Desktop

## 📸 Capturas de Pantalla

### Pantalla de Login
![Login](./screenshots/login.png)

Interfaz de autenticación con validación en tiempo real y manejo de errores.

### Panel de Registros
![Panel de Registros](./screenshots/records.png)

Vista principal con tabla interactiva, filtros, búsqueda y acciones CRUD.

## 🚀 Instalación y Configuración

### Prerrequisitos

Asegúrate de tener instalado:

- **Node.js** (v18 o superior)
- **MySQL** (v8.0 o superior) o **Laragon** (recomendado para Windows)
- **pnpm** o **npm**
- **PowerBI Desktop** (opcional, para visualización)

### 1. Clonar el Repositorio

```bash
git clone https://github.com/NyoWynn/document-processing-platform.git
cd document-processing-platform
```

### 2. Configurar Base de Datos

Crea una base de datos MySQL:

```sql
CREATE DATABASE document_processing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

O usa Laragon para crear la base de datos desde la interfaz gráfica.

### 3. Configurar Backend

```bash
cd backend
npm install

# Configurar variables de entorno
# Crea un archivo .env en la carpeta backend con:
```

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=tu_password
DB_DATABASE=document_processing
JWT_SECRET=tu_secret_jwt_muy_seguro
JWT_EXPIRES_IN=24h
PORT=3000
FRONTEND_URL=http://localhost:5173
```

```bash
# Iniciar el servidor en modo desarrollo
npm run start:dev
```

El backend estará disponible en `http://localhost:3000`

### 4. Configurar Frontend

```bash
cd frontend
npm install

# Configurar variables de entorno (opcional)
# Crea un archivo .env en la carpeta frontend:
```

```env
VITE_API_URL=http://localhost:3000
```

```bash
# Iniciar el servidor de desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

### 5. Crear Usuario Inicial

Para crear un usuario administrador, puedes usar el endpoint de registro o ejecutar un script SQL:

```sql
INSERT INTO users (email, password, createdAt, updatedAt) 
VALUES (
  'admin@example.com',
  '$2a$10$TuHashBcryptGenerado',
  NOW(),
  NOW()
);
```

> **Nota**: El hash de la contraseña debe generarse usando bcrypt. Usa la API de autenticación o un script Node.js para generar el hash.

## 📖 Uso del Sistema

### 1. Autenticación

1. Accede a `http://localhost:5173/login`
2. Ingresa tus credenciales (email y contraseña)
3. El sistema redirigirá automáticamente al panel de registros

### 2. Ingesta de Datos desde PDF

1. Ve a la sección de Records
2. Usa el endpoint `/api/records/ingest` para subir un PDF
3. El sistema procesará el PDF, extraerá los datos y los cargará en la base de datos

**Ejemplo con cURL:**

```bash
curl -X POST http://localhost:3000/records/ingest \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -F "file=@/ruta/a/tu/archivo.pdf"
```

### 3. Gestión de Registros

Desde la interfaz web puedes:
- Ver todos los registros en una tabla paginada
- Filtrar y buscar registros
- Crear nuevos registros manualmente
- Editar registros existentes
- Eliminar registros

### 4. Dashboard PowerBI

1. Abre PowerBI Desktop
2. Selecciona "Obtener datos" → "Base de datos" → "Base de datos de MySQL"
3. Ingresa las credenciales de conexión:
   - Servidor: `localhost`
   - Base de datos: `document_processing`
4. Selecciona la tabla `records`
5. Crea visualizaciones personalizadas según tus necesidades

## 📁 Estructura del Proyecto

```
document-processing-platform/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── auth/           # Módulo de autenticación JWT
│   │   ├── records/        # Módulo de registros (CRUD + ingesta)
│   │   ├── users/          # Módulo de usuarios
│   │   ├── entities/       # Entidades TypeORM
│   │   ├── config/         # Configuración (DB, etc.)
│   │   └── services/       # Servicios compartidos
│   ├── data/               # Datos procesados (raw y normalized)
│   └── package.json
│
├── frontend/               # Aplicación Vue 3
│   ├── src/
│   │   ├── views/          # Vistas (Login, Records)
│   │   ├── components/     # Componentes reutilizables
│   │   ├── stores/         # Stores Pinia (auth, records)
│   │   ├── services/       # Cliente API Axios
│   │   └── router/         # Configuración de rutas
│   └── package.json
│
├── data/                   # Datos de ejemplo
│   ├── data.pdf            # PDF de prueba
│   └── README.md           # Documentación de datos
│
├── POWERBI/                # Dashboard PowerBI
│   ├── BIdata.pbix         # Archivo de PowerBI Desktop
│   └── graficospdf.pdf     # Documentación de visualizaciones
│
└── README.md               # Este archivo
```

## 🔌 Endpoints de la API

### Autenticación
- `POST /auth/login` - Iniciar sesión (público)

### Registros (requieren autenticación JWT)
- `GET /records` - Obtener todos los registros
- `GET /records/:id` - Obtener un registro por ID
- `POST /records` - Crear un nuevo registro
- `POST /records/ingest` - Ingesta desde PDF (multipart/form-data)
- `PATCH /records/:id` - Actualizar un registro
- `DELETE /records/:id` - Eliminar un registro

### Ejemplo de Uso de la API

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"tu_password"}'

# Obtener registros (con token)
curl -X GET http://localhost:3000/records \
  -H "Authorization: Bearer TU_TOKEN_JWT"
```

## 🧪 Testing

### Backend
```bash
cd backend
npm run test           # Unit tests
npm run test:e2e       # E2E tests
npm run test:cov       # Coverage
```

### Frontend
```bash
cd frontend
npm run test:unit      # Unit tests
npm run test:e2e       # E2E tests con Playwright
```

## 📚 Documentación Adicional

- **[Backend README](./backend/README.md)** - Guía detallada del backend
- **[Frontend README](./frontend/README.md)** - Guía detallada del frontend
- **[Data README](./data/README.md)** - Información sobre estructura de datos
- **[JWT Auth Demo](./JWT_AUTH_DEMO.md)** - Demostración de autenticación
- **[Quick Start Guide](./QUICK_START.md)** - Guía de inicio rápido

## 🎯 Casos de Uso

Este proyecto es ideal para:

- **Portafolio profesional**: Demuestra competencias full-stack completas
- **Sistemas de gestión documental**: Procesamiento automatizado de facturas, recibos, etc.
- **ETL empresarial**: Pipeline de ingesta de datos desde documentos
- **Business Intelligence**: Base para análisis y reportes empresariales
- **Aprendizaje**: Ejemplo práctico de arquitectura moderna full-stack

## 🔄 Mejoras Futuras

- [ ] Soporte para múltiples formatos de documentos (Excel, CSV, JSON)
- [ ] Procesamiento asíncrono con colas (Bull/BullMQ)
- [ ] Exportación de datos a múltiples formatos
- [ ] Sistema de logs y auditoría
- [ ] Caché con Redis
- [ ] Tests unitarios y de integración completos
- [ ] Dockerización del proyecto
- [ ] CI/CD pipeline
- [ ] Documentación con Swagger/OpenAPI

## 📝 Licencia

Este proyecto es parte de un portafolio personal y está disponible para fines educativos y de demostración.

## 👨‍💻 Autor

Desarrollado como parte de un portafolio profesional demostrando competencias en desarrollo full-stack moderno.

---

## 🚀 Inicio Rápido (TL;DR)

```bash
# 1. Clonar y entrar al proyecto
git clone https://github.com/NyoWynn/document-processing-platform.git
cd document-processing-platform

# 2. Configurar backend
cd backend && npm install
# Configurar .env con credenciales de MySQL
npm run start:dev

# 3. Configurar frontend (en otra terminal)
cd frontend && npm install
npm run dev

# 4. Acceder a la aplicación
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
```

---

**⭐ Si este proyecto te resulta útil, considera darle una estrella en GitHub!**
