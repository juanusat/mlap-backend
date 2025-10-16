// routes/parishRoutes.js

const express = require('express');
const router = express.Router();
const parishController = require('../controllers/parishController');
const authMiddleware = require('../middleware/authMiddleware');

// ✅ ESTA ES LA RUTA QUE TU FRONTEND DEBE LLAMAR
router.get('/my-parishes', authMiddleware, parishController.getMyParishes);

router.get('/chapels', authMiddleware, parishController.getChapelsForCurrentParish);

module.exports = router;