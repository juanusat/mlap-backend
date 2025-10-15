const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/select-parish', authController.selectParish);
router.post('/select-role', authController.selectRole);
router.post('/logout', authController.logout);
router.post('/select-parishioner-mode', authController.selectParishionerMode);
router.get('/roles', authMiddleware, authController.getRolesForCurrentParish);

module.exports = router;