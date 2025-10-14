const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/select-parish', authController.selectParish);
router.post('/select-role', authController.selectRole);
router.post('/logout', authController.logout);

module.exports = router;