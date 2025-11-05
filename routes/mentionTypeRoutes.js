const express = require('express');
const router = express.Router();
const mentionTypeController = require('../controllers/mentionTypeController');
const { authMiddleware } = require('../middleware/authMiddleware_new');

/**
 * @route   GET /api/mention-types
 * @desc    Obtener lista de tipos de mención activos
 * @access  Autenticado
 */
router.get('/', authMiddleware, mentionTypeController.listMentionTypes);

module.exports = router;
