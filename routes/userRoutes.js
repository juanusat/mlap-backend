const express = require('express');
const router = express.Router();
const multer = require('multer');
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware_new');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/account', requireAuth, userController.getUserAccount);
router.patch('/account/info', requireAuth, upload.single('profile_photo'), userController.updatePersonalInfo);
router.patch('/account/credentials', requireAuth, userController.updateCredentials);

module.exports = router;
