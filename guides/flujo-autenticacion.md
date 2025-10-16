# Resumen de autenticación


## 🔄 Flujo de autenticación implementado

### Paso 1: Registro (`POST /api/auth/register`)
```json
{
  "first_names": "Juan Carlos",
  "paternal_surname": "Pérez", 
  "maternal_surname": "García",
  "email": "user@example.com",
  "document_type_id": 1,
  "document": "12345678",
  "username": "jperez",
  "password": "password123"
}
```

### Paso 2: Login (`POST /api/auth/login`)
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Respuesta:**
```json
{
  "message": "Operación exitosa",
  "data": {
    "user_info": { "full_name": "Juan Carlos Pérez", "email": "user@example.com" },
    "is_diocese_user": false,
    "parish_associations": [{"id": 1, "name": "Parroquia La Consolación"}]
  }
}
```

### Paso 3: Seleccionar Contexto (`POST /api/auth/select-context`)
```json
{
  "context_type": "PARISH",
  "parishId": 1
}
```
O para modo feligrés:
```json
{
  "context_type": "PARISH", 
  "parishId": null
}
```
O para modo diócesis:
```json
{
  "context_type": "DIOCESE"
}
```

### Paso 4: Obtener Roles (`GET /api/auth/roles`)
**Respuesta:**
```json
{
  "message": "Operación exitosa",
  "data": [{"id": 2, "name": "Secretario(a)"}]
}
```

### Paso 5: Seleccionar Rol (`POST /api/auth/select-role`)
```json
{
  "roleId": 2
}
```

### Paso 6: Acceder a Recursos (`GET /api/chapels`)
**Respuesta:**
```json
{
  "message": "Operación exitosa", 
  "data": [{"id": 101, "name": "Capilla San Martín", "address": "Av. Principal 123"}]
}
```

### Paso 7: Logout (`POST /api/auth/logout`)
**Respuesta:**
```json
{
  "message": "Operación exitosa"
}
```

## 🛠️ Archivos implicados

1. `controllers/authController.js` - Lógica principal de autenticación
2. `services/authService.js` - Servicios de autenticación  
3. `models/userModel.js` - Modelo de datos de usuario
4. `middleware/authMiddleware.js` - Middleware de autenticación
5. `routes/authRoutes.js` - Definición de rutas
6. `controllers/parishController.js` - Controlador de parroquia

## 🧪 Archivo de Pruebas

- `test_api_flow.js` - Script completo para probar todo el flujo de autenticación
