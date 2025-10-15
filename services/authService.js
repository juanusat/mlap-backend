const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const config = require('../config');

const register = async (userData) => {
  const existingUser = await userModel.findByEmail(userData.email);
  if (existingUser) {
    throw new Error('User already exists with this email');
  }

  const passwordHash = crypto.createHash('sha256').update(userData.password).digest('hex');
  
  const newUser = await userModel.create({
    first_names: userData.first_names,
    paternal_surname: userData.paternal_surname,
    maternal_surname: userData.maternal_surname,
    email: userData.email,
    type_doc_id: userData.document_type_id,
    doc_value: userData.document,
    username: userData.username,
    password_hash: passwordHash
  });

  return newUser;
};

const login = async (email, password) => {
  const user = await userModel.findByEmail(email);
  if (!user || !user.active) {
    throw new Error('Invalid credentials or inactive user');
  }

  const sha256Hash = crypto.createHash('sha256').update(password).digest('hex');
  const isPasswordMatch = sha256Hash === user.password_hash;

  if (!isPasswordMatch) {
    throw new Error('Invalid credentials');
  }

  const associations = await userModel.findUserAssociations(user.id);
  const isDioceseUser = await userModel.isDioceseUser(user.id);

  const tokenPayload = { userId: user.id };
  const token = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: '24h' });

  // Mapear associations al formato requerido por el YAML
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

module.exports = {
  register,
  login,
};