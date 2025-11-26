const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Rutas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);

// Rutas de recuperación de contraseña (públicas)
router.post('/forgot-password', authController.requestPasswordReset);
router.post('/verify-reset-code', authController.verifyResetCode);
router.post('/reset-password', authController.resetPassword);

// Rutas protegidas
router.post('/select-context', authMiddleware, authController.selectContext);
router.get('/roles', authMiddleware, authController.getRolesForCurrentParish);
router.post('/select-role', authMiddleware, authController.selectRole);
router.get('/session', authMiddleware, authController.getSession);
router.get('/session/roles', authMiddleware, authController.getRolesForCurrentParish);
router.put('/session/role', authMiddleware, authController.selectRole);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;