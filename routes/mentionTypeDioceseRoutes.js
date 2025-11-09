const express = require('express');
const router = express.Router();
const mentionTypeController = require('../controllers/mentionTypeDioceseController');
const { authMiddleware } = require('../middleware/authMiddleware_new');
const dioceseMiddleware = require('../middleware/dioceseMiddleware');

// Todas las rutas requieren autenticación y acceso de diócesis
router.post('/list', authMiddleware, dioceseMiddleware, mentionTypeController.listMentionTypes);
router.post('/search', authMiddleware, dioceseMiddleware, mentionTypeController.searchMentionTypes);
router.post('/', authMiddleware, dioceseMiddleware, mentionTypeController.createMentionType);
router.put('/:id', authMiddleware, dioceseMiddleware, mentionTypeController.updateMentionType);
router.delete('/:id', authMiddleware, dioceseMiddleware, mentionTypeController.deleteMentionType);
router.patch('/:id/status', authMiddleware, dioceseMiddleware, mentionTypeController.updateMentionTypeStatus);

module.exports = router;
