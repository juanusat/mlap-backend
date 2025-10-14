const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const config = require('../config');

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

  const tokenPayload = { userId: user.id };
  const token = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: '24h' });

  return {
    token,
    user: {
      user_name_full: `${user.first_names} ${user.paternal_surname}`.trim(),
    },
    associations,
  };
};

module.exports = {
  login,
};