# Configuración del Servicio de Email para Recuperación de Contraseña

## 📧 Descripción General

El sistema de recuperación de contraseña permite a los usuarios restablecer su contraseña mediante un código de verificación de 6 dígitos enviado a su correo electrónico.

## 🔧 Configuración Inicial

### 1. Instalar Dependencias

```bash
npm install nodemailer
```

### 2. Configurar Variables de Entorno

Agrega las siguientes variables al archivo `.env`:

```env
# Configuración de correo electrónico
EMAIL_SERVICE=gmail
EMAIL_USER=tu-correo@gmail.com
EMAIL_PASSWORD=tu-contraseña-de-aplicacion
EMAIL_FROM=noreply@mlap.com
```

## 📮 Configuración con Gmail

### Paso 1: Activar Verificación en 2 Pasos

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Selecciona "Seguridad" en el menú izquierdo
3. Busca "Verificación en 2 pasos"
4. Actívala siguiendo las instrucciones

### Paso 2: Generar Contraseña de Aplicación

1. En la misma sección de "Seguridad"
2. Busca "Contraseñas de aplicaciones"
3. Selecciona "Correo" y "Otro (nombre personalizado)"
4. Ingresa "MLAP Backend" como nombre
5. Copia la contraseña generada (16 caracteres sin espacios)
6. Usa esta contraseña en `EMAIL_PASSWORD`

### Configuración Final

```env
EMAIL_SERVICE=gmail
EMAIL_USER=tu-correo@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop  # Contraseña de aplicación (sin espacios)
EMAIL_FROM=MLAP <noreply@mlap.com>
```

## 📮 Configuración con Otros Proveedores

### Outlook / Hotmail

```env
EMAIL_SERVICE=hotmail
EMAIL_USER=tu-correo@outlook.com
EMAIL_PASSWORD=tu-contraseña
EMAIL_FROM=noreply@mlap.com
```

### Yahoo

```env
EMAIL_SERVICE=yahoo
EMAIL_USER=tu-correo@yahoo.com
EMAIL_PASSWORD=tu-contraseña-de-aplicacion
EMAIL_FROM=noreply@mlap.com
```

### Configuración Manual (SMTP)

Si tu proveedor no está soportado directamente:

```env
EMAIL_HOST=smtp.tuprovedor.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-correo@tuprovedor.com
EMAIL_PASSWORD=tu-contraseña
EMAIL_FROM=noreply@mlap.com
```

Y modifica `services/emailService.js`:

```javascript
const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.emailHost,
    port: config.emailPort,
    secure: config.emailSecure,
    auth: {
      user: config.emailUser,
      pass: config.emailPassword,
    },
  });
};
```

## 🔐 Flujo de Recuperación de Contraseña

### 1. Solicitar Recuperación

**Endpoint:** `POST /api/auth/forgot-password`

**Request:**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Response:**
```json
{
  "message": "Si el correo existe, recibirás un código de verificación en tu bandeja de entrada"
}
```

### 2. Verificar Código

**Endpoint:** `POST /api/auth/verify-reset-code`

**Request:**
```json
{
  "email": "usuario@ejemplo.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "message": "Código verificado correctamente",
  "data": {
    "verified": true
  }
}
```

### 3. Restablecer Contraseña

**Endpoint:** `POST /api/auth/reset-password`

**Request:**
```json
{
  "email": "usuario@ejemplo.com",
  "code": "123456",
  "newPassword": "nuevaContraseña123",
  "confirmPassword": "nuevaContraseña123"
}
```

**Response:**
```json
{
  "message": "Contraseña restablecida correctamente"
}
```

## ⚙️ Características de Seguridad

### 1. Código de Verificación
- **Formato:** 6 dígitos numéricos aleatorios
- **Expiración:** 15 minutos
- **Uso único:** Se elimina después de usarse

### 2. Validaciones
- Email válido con formato correcto
- Código de 6 dígitos
- Contraseña mínima de 8 caracteres
- Contraseñas coincidentes

### 3. Protección de Información
- No se revela si un email existe en el sistema
- Los códigos expirados no son aceptados
- El token se limpia después de restablecer la contraseña

## 🧪 Testing

### Probar en Desarrollo

1. Solicita recuperación con un email válido
2. Revisa la consola del servidor para ver el código generado
3. También recibirás el código por email
4. Ingresa el código en el formulario
5. Cambia la contraseña
6. Prueba el login con la nueva contraseña

### Debug

Si los correos no se envían, verifica:

1. Las credenciales en `.env` son correctas
2. La "Verificación en 2 pasos" está activada (Gmail)
3. Generaste una "Contraseña de aplicación" (Gmail)
4. No hay espacios en la contraseña de aplicación
5. El firewall/antivirus no bloquea conexiones SMTP

### Logs

Los emails enviados se registran en la consola:

```
Email enviado: <message-id@gmail.com>
```

## ⚠️ Consideraciones de Producción

1. **Variables de entorno:** Nunca subas el archivo `.env` al repositorio
2. **Rate limiting:** Considera limitar las solicitudes por IP
3. **Monitoreo:** Implementa logs para detectar abusos
4. **Servicio profesional:** Para producción, considera usar:
   - SendGrid
   - Amazon SES
   - Mailgun
   - Postmark

## 📊 Base de Datos

Las columnas necesarias ya existen en la tabla `user`:

```sql
reset_token VARCHAR(6)                -- Código de 6 dígitos
reset_token_expires_at TIMESTAMP      -- Fecha de expiración
```

No se requieren migraciones adicionales.

## 🔍 Troubleshooting

### Error: "No se pudo enviar el correo electrónico"

**Posibles causas:**
- Credenciales incorrectas
- Contraseña de aplicación no generada
- Servicio de email bloqueado
- Límite de envío alcanzado

**Solución:**
- Verifica las variables de entorno
- Regenera la contraseña de aplicación
- Revisa los logs del servidor

### Error: "Código de verificación incorrecto o expirado"

**Posibles causas:**
- El código ya expiró (15 minutos)
- Se ingresó un código incorrecto
- El código ya fue usado

**Solución:**
- Solicitar un nuevo código
- Verificar que el código sea de 6 dígitos

## 📝 Notas Adicionales

- El código expira en **15 minutos**
- Solo se puede usar **una vez**
- El sistema **no revela** si un email existe por seguridad
- Los correos incluyen una **advertencia** si no fue el usuario quien solicitó el cambio
