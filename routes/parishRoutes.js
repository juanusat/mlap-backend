const express = require('express');
const router = express.Router();
const parishController = require('../controllers/parishController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireAuth } = require('../middleware/authMiddleware_new');

router.get('/my-parishes', authMiddleware, parishController.getMyParishes);

router.get('/chapels', authMiddleware, parishController.getChapelsForCurrentParish);

router.get('/:parishId/roles', requireAuth, parishController.getRolesForParish);

router.get('/account', authMiddleware, parishController.getParishAccount);

router.patch('/account/info', authMiddleware, parishController.updateParishAccountInfo);

router.patch('/account/credentials', authMiddleware, parishController.updateParishCredentials);

module.exports = router;