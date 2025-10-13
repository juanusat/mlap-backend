require('dotenv').config();

const config = {
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
};

module.exports = config;