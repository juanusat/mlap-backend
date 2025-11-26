const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const emailService = require('./emailService');
const config = require('../config');

const register = async (userData) => {
  const existingUser = await userModel.findByEmail(userData.email);
  if (existingUser) {
    throw new Error('Ya existe un usuario con este correo electrónico');
  }

  const passwordHash = crypto.createHash('sha256').update(userData.password).digest('hex');
  
  const newUser = await userModel.create({
    first_names: userData.first_names,
    paternal_surname: userData.paternal_surname,
    maternal_surname: userData.maternal_surname,
    email: userData.email,
    document_type_id: userData.document_type_id,
    document: userData.document,
    username: userData.username,
    password_hash: passwordHash
  });

  return newUser;
};

const login = async (email, password) => {
  const user = await userModel.findByEmail(email);
  if (!user) {
    throw new Error('Credenciales inválidas');
  }
  
  if (!user.active) {
    throw new Error('Usuario no existe');
  }

  const sha256Hash = crypto.createHash('sha256').update(password).digest('hex');
  const isPasswordMatch = sha256Hash === user.password_hash;

  if (!isPasswordMatch) {
    throw new Error('Credenciales inválidas');
  }

  const associations = await userModel.findUserAssociations(user.id);
  const isDioceseUser = await userModel.isDioceseUser(user.id);

  const tokenPayload = { userId: user.id };
  const token = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: '24h' });

  const parish_associations = associations.map(assoc => ({
    id: assoc.parish_id,
    name: assoc.parish_name
  }));

  return {
    token,
    user: {
      user_name_full: `${user.first_names} ${user.paternal_surname}`.trim(),
      email: user.email
    },
    is_diocese_user: isDioceseUser,
    parish_associations,
  };
};

/**
 * Solicita el restablecimiento de contraseña
 * Genera un código y lo envía por email
 * @param {string} email - Email del usuario
 */
const requestPasswordReset = async (email) => {
  // Buscar el usuario por email
  const user = await userModel.findByEmail(email);
  
  // Por seguridad, no revelamos si el email existe o no
  // Pero solo enviamos el correo si el usuario existe y está activo
  if (!user || !user.active) {
    // Retornamos éxito de todas formas para no revelar información
    return { success: true };
  }

  // Generar código de 6 dígitos
  const verificationCode = emailService.generateVerificationCode();
  
  // Calcular expiración (15 minutos)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  
  // Guardar el token en la base de datos
  await userModel.updateResetToken(user.id, verificationCode, expiresAt);
  
  // Enviar el correo
  const userName = `${user.first_names} ${user.paternal_surname}`.trim();
  await emailService.sendPasswordResetEmail(email, verificationCode, userName);
  
  return { success: true };
};

/**
 * Verifica el código de restablecimiento
 * @param {string} email - Email del usuario
 * @param {string} code - Código de 6 dígitos
 * @returns {Object} Resultado de la verificación
 */
const verifyResetCode = async (email, code) => {
  // Buscar usuario con token válido y no expirado
  const user = await userModel.findByResetToken(email, code);
  
  if (!user) {
    throw new Error('Código de verificación incorrecto o expirado');
  }
  
  return {
    success: true,
    message: 'Código verificado correctamente'
  };
};

/**
 * Restablece la contraseña del usuario
 * @param {string} email - Email del usuario
 * @param {string} code - Código de verificación
 * @param {string} newPassword - Nueva contraseña
 */
const resetPassword = async (email, code, newPassword) => {
  // Verificar que el código sea válido
  const user = await userModel.findByResetToken(email, code);
  
  if (!user) {
    throw new Error('Código de verificación incorrecto o expirado');
  }
  
  // Hashear la nueva contraseña
  const passwordHash = crypto.createHash('sha256').update(newPassword).digest('hex');
  
  // Actualizar la contraseña
  await userModel.updatePassword(user.id, passwordHash);
  
  // Limpiar el token de restablecimiento
  await userModel.clearResetToken(user.id);
  
  return {
    success: true,
    message: 'Contraseña restablecida correctamente'
  };
};

module.exports = {
  register,
  login,
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
};