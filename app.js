require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const apiRouter = require('./routes');
const errorMiddleware = require('./middleware/errorMiddleware');
const requestLogger = require('./middleware/requestLogger');
const http = require('http');
const socket = require('./socket');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
socket.init(server);

const allowedOrigin = `${process.env.FRONTEND_URL}:${process.env.FRONTEND_PORT}`;
app.use(
  cors({
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use(requestLogger);

app.use('/api/static/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', apiRouter);

app.use(errorMiddleware);

const PORT = process.env.BACKEND_PORT;

server.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log('='.repeat(60));

  // Verificar configuración de email
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  if (emailUser && emailPassword &&
    emailUser !== 'tu-correo@gmail.com' &&
    emailUser !== 'sistema.mlap@gmail.com' &&
    emailPassword !== 'tu-contraseña-de-aplicacion' &&
    emailPassword !== 'tu-contraseña-de-aplicacion-16-caracteres') {
    console.log('✅ Servicio de email configurado correctamente');
    console.log(`   📧 Remitente: ${emailUser}`);
    console.log('   ℹ️  Los códigos se enviarán DESDE esta cuenta');
    console.log('   ℹ️  Los usuarios pueden tener cualquier correo (Gmail, Outlook, etc.)');
  } else {
    console.log('⚠️  Servicio de email NO configurado');
    console.log('   ❌ La recuperación de contraseña no funcionará');
    console.log('   📖 Consulta: GUIA-RAPIDA-EMAIL.md');
  }
  console.log('='.repeat(60));
});