# 🚀 Inicio Rápido - Cómo Ejecutar la Aplicación

Guía rápida para ejecutar el backend y frontend.

## 📋 Prerrequisitos

- ✅ Laragon instalado y corriendo (MySQL activo)
- ✅ Node.js instalado
- ✅ npm o pnpm

## ⚙️ Configuración Inicial

### 1. Base de Datos MySQL

Asegúrate de que MySQL esté corriendo en Laragon y crea la base de datos:

```sql
CREATE DATABASE test_programacion;
```

### 2. Variables de Entorno

Crea un archivo `.env` en la carpeta `backend/`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=test_programacion
JWT_SECRET=your-secret-key-change-in-production
```

## 🔧 Backend (NestJS)

```bash
# 1. Ir a la carpeta backend
cd backend

# 2. Instalar dependencias
npm install

# 3. Ejecutar migraciones (si aplica)
npm run migration:run

# 4. Iniciar servidor en modo desarrollo
npm run start:dev
```

✅ Backend corriendo en: `http://localhost:3000`

## 🎨 Frontend (Vue 3 + Vuetify)

```bash
# 1. Ir a la carpeta frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
```

✅ Frontend corriendo en: `http://localhost:5173` (o el puerto que indique)

## 👤 Usuario por Defecto

Para iniciar sesión, necesitas crear un usuario. Puedes hacerlo ejecutando este script SQL en MySQL:

```sql
INSERT INTO users (email, password, createdAt, updatedAt) 
VALUES (
  'admin@test.com', 
  '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', 
  NOW(), 
  NOW()
);
```

O usa el endpoint de registro si está disponible.

**Credenciales de ejemplo:**
- Email: `admin@test.com`
- Password: `admin123` (o la que hayas configurado)

## 📊 Importar Datos desde PDF

1. Inicia sesión en la aplicación web
2. Haz clic en **"Importar PDF"**
3. Selecciona el archivo `data/data.pdf`
4. Espera a que se procesen los datos

## ✅ Verificar que Todo Funciona

1. **Backend**: Abre `http://localhost:3000` → Deberías ver un mensaje de bienvenida
2. **Frontend**: Abre `http://localhost:5173` → Deberías ver la pantalla de login
3. **Login**: Inicia sesión con tus credenciales
4. **Registros**: Deberías ver la tabla de registros (vacía si no has importado el PDF)



## 📝 Comandos Útiles

```bash
# Backend - Ver logs en tiempo real
cd backend && npm run start:dev

# Frontend - Ver logs en tiempo real
cd frontend && npm run dev

# Backend - Compilar para producción
cd backend && npm run build

# Frontend - Compilar para producción
cd frontend && npm run build
```

---





