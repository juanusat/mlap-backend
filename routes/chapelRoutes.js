const express = require('express');
const router = express.Router();
const parishController = require('../controllers/parishController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, parishController.getChapelsForCurrentParish);

module.exports = router;