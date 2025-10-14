const authService = require('../services/authService');
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const config = require('../config');

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    
    res.cookie('token', result.token, cookieOptions);

    res.status(200).json({
      message: 'Login successful',
      data: {
        user_name_full: result.user.user_name_full,
        associations: result.associations,
      },
      error: '',
    });
  } catch (error) {
    next(error);
  }
};

const selectParish = async (req, res, next) => {
    try {
        const { parishId } = req.body;
        const currentToken = req.cookies.token;

        if (!currentToken) return res.status(401).json({ message: 'Authentication required' });

        const decoded = jwt.verify(currentToken, config.jwtSecret);
        const userId = decoded.userId;

        const tokenPayload = { userId, parishId };
        const newToken = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: '24h' });
        
        const roles = await userModel.findUserRolesInParish(userId, parishId);

        res.cookie('token', newToken, cookieOptions);

        res.status(200).json({
            message: 'Parish selected successfully',
            data: { roles },
            error: ''
        });
    } catch (error) {
        next(error);
    }
};

const selectRole = async (req, res, next) => {
    try {
        const { roleId } = req.body;
        const currentToken = req.cookies.token;

        if (!currentToken) return res.status(401).json({ message: 'Authentication required' });

        const decoded = jwt.verify(currentToken, config.jwtSecret);
        const { userId, parishId } = decoded;

        if (!parishId) return res.status(400).json({ message: 'A parish must be selected first' });

        const tokenPayload = { userId, parishId, roleId };
        const finalToken = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: '24h' });

        res.cookie('token', finalToken, cookieOptions);

        res.status(200).json({
            message: 'Role selected successfully. Session is fully active.',
            data: {},
            error: ''
        });
    } catch (error) {
        next(error);
    }
};

const logout = (req, res) => {
    res.clearCookie('token', cookieOptions);
    res.status(200).json({ 
        message: 'Logout successful',
        data: { redirect_url: '/login' },
        error: ''
    });
};

module.exports = {
  login,
  selectParish,
  selectRole,
  logout
};