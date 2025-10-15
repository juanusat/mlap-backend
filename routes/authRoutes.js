const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/select-context', authMiddleware, authController.selectContext);
router.get('/roles', authMiddleware, authController.getRolesForCurrentParish);
router.post('/select-role', authMiddleware, authController.selectRole);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;