# 🔐 Demostración de Autenticación JWT

Este documento explica cómo está implementada la autenticación JWT en la API REST y cómo demostrarla.



La API REST está **completamente protegida con JWT** mediante:

1. **Guard Global**: Todos los endpoints están protegidos por defecto con `JwtAuthGuard`
2. **Estrategia JWT**: Usa Passport JWT para validar tokens
3. **Endpoint Público**: Solo `/auth/login` es público (marcado con `@Public()`)

## Endpoints Protegidos

Todos los endpoints de `/records` requieren autenticación JWT:

- `GET /records` - Listar todos los registros
- `GET /records/:id` - Obtener un registro específico
- `POST /records` - Crear un nuevo registro
- `POST /records/ingest` - Importar PDF
- `PATCH /records/:id` - Actualizar un registro
- `DELETE /records/:id` - Eliminar un registro

## Endpoint Público

- `POST /auth/login` - Autenticarse y obtener token JWT





```bash
curl -X GET http://localhost:3000/records
```

**Respuesta esperada:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

#### 2: Obtener token JWT

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123"
  }'
```

**Respuesta esperada:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@example.com"
  }
}
```

####  Usar el token para acceder a endpoints protegidos

```bash
# Guarda el token en una variable
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Ahora intenta acceder con el token
curl -X GET http://localhost:3000/records \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta esperada:** Lista de registros en formato JSON

### Opción 2: Usando Postman

1. **Crear una petición POST** a `http://localhost:3000/auth/login`
   - Body (raw JSON):
     ```json
     {
       "email": "admin@example.com",
       "password": "password123"
     }
     ```
   - Deberías recibir un `access_token`

2. **Copiar el token** de la respuesta

3. **Crear una nueva petición GET** a `http://localhost:3000/records`
   - Ir a la pestaña "Authorization"
   - Seleccionar "Bearer Token"
   - Pegar el token copiado
   - Enviar la petición

4. **Verificar que funciona:**
   - Con token: Deberías recibir los registros
   - Sin token: Deberías recibir error 401 Unauthorized


La API REST está **completamente protegida con JWT**. Todos los endpoints (excepto `/auth/login`) requieren un token válido en el header `Authorization: Bearer <token>`.



