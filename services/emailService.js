const nodemailer = require('nodemailer');
const config = require('../config');

/**
 * Configuración del transporte de correo electrónico
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    service: config.emailService,
    auth: {
      user: config.emailUser,
      pass: config.emailPassword,
    },
  });
};

/**
 * Envía un correo con el código de verificación para restablecer contraseña
 * @param {string} email - Email del destinatario
 * @param {string} code - Código de 6 dígitos
 * @param {string} userName - Nombre del usuario
 * @returns {Promise<boolean>}
 */
const sendPasswordResetEmail = async (email, code, userName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: config.emailFrom,
      to: email,
      subject: 'Restablecimiento de contraseña - MLAP',
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 2px solid #b1b1b1;
            }
            .header h1 {
              color: #424242;
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 30px 0;
              text-align: center;
            }
            .content p {
              color: #555555;
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 20px;
            }
            .code-box {
              background-color: #f8f9fa;
              border: 2px dashed #b1b1b1;
              border-radius: 8px;
              padding: 20px;
              margin: 25px 0;
              text-align: center;
            }
            .code {
              font-size: 36px;
              font-weight: bold;
              color: #424242;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .expiry {
              color: #dc3545;
              font-size: 14px;
              font-weight: bold;
              margin-top: 15px;
            }
            .footer {
              text-align: center;
              padding-top: 20px;
              border-top: 2px solid #b1b1b1;
              color: #888888;
              font-size: 14px;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .warning p {
              margin: 0;
              color: #856404;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 MLAP</h1>
            </div>
            
            <div class="content">
              <p><strong>Hola ${userName || 'Usuario'},</strong></p>
              <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
              <p>Utiliza el siguiente código de verificación:</p>
              
              <div class="code-box">
                <div class="code">${code}</div>
                <div class="expiry">⏱️ Este código expira en 15 minutos</div>
              </div>
              
              <div class="warning">
                <p><strong>⚠️ Importante:</strong> Si no solicitaste este cambio, ignora este correo y tu contraseña permanecerá segura.</p>
              </div>
            </div>
            
            <div class="footer">
              <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
              <p>&copy; ${new Date().getFullYear()} MLAP. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Hola ${userName || 'Usuario'},
        
        Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.
        
        Tu código de verificación es: ${code}
        
        Este código expira en 15 minutos.
        
        Si no solicitaste este cambio, ignora este correo y tu contraseña permanecerá segura.
        
        MLAP - Sistema de Gestión Parroquial
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error al enviar email:', error);
    throw new Error('No se pudo enviar el correo electrónico');
  }
};

/**
 * Genera un código de verificación de 6 dígitos
 * @returns {string}
 */
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = {
  sendPasswordResetEmail,
  generateVerificationCode,
};
