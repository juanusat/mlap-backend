const express = require('express');
const router = express.Router();
const parishController = require('../controllers/parishController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireAuth } = require('../middleware/authMiddleware_new');

router.get('/my-parishes', authMiddleware, parishController.getMyParishes);

router.get('/chapels', authMiddleware, parishController.getChapelsForCurrentParish);

router.get('/:parishId/roles', requireAuth, parishController.getRolesForParish);

module.exports = router;