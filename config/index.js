require('dotenv').config();

const config = {
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
  // Configuración de correo electrónico
  emailService: process.env.EMAIL_SERVICE || 'gmail',
  emailUser: process.env.EMAIL_USER,
  emailPassword: process.env.EMAIL_PASSWORD,
  emailFrom: process.env.EMAIL_FROM || 'noreply@mlap.com',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};

module.exports = config;