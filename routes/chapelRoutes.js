const express = require('express');
const router = express.Router();
const multer = require('multer');
const chapelController = require('../controllers/chapelController');
const authMiddleware = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/create', authMiddleware, upload.fields([
  { name: 'profile_photo', maxCount: 1 },
  { name: 'cover_photo', maxCount: 1 }
]), chapelController.create);

router.post('/search', authMiddleware, chapelController.search);

router.get('/:id', authMiddleware, chapelController.getById);

router.patch('/:id', authMiddleware, upload.fields([
  { name: 'profile_photo', maxCount: 1 },
  { name: 'cover_photo', maxCount: 1 }
]), chapelController.update);

router.patch('/:id/status', authMiddleware, chapelController.updateStatus);

router.delete('/:id/delete', authMiddleware, chapelController.delete);

module.exports = router;