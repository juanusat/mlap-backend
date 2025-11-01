const express = require('express');
const router = express.Router();
const multer = require('multer');
const parishController = require('../controllers/parishController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireAuth } = require('../middleware/authMiddleware_new');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/my-parishes', authMiddleware, parishController.getMyParishes);

router.get('/chapels', authMiddleware, parishController.getChapelsForCurrentParish);

router.get('/:parishId/roles', requireAuth, parishController.getRolesForParish);

router.get('/account', authMiddleware, parishController.getParishAccount);

router.patch('/account/info', authMiddleware, upload.fields([
    { name: 'profile_photo', maxCount: 1 },
    { name: 'cover_photo', maxCount: 1 }
]), parishController.updateParishAccountInfo);

router.patch('/account/credentials', authMiddleware, parishController.updateParishCredentials);

module.exports = router;