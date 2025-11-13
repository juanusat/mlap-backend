const express = require('express');
const router = express.Router();
const multer = require('multer');
const chapelController = require('../controllers/chapelController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkPermissions } = require('../middleware/permissionMiddleware');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/create', authMiddleware, checkPermissions('PARROQUIA_CAPILLA_C'), upload.fields([
  { name: 'profile_photo', maxCount: 1 },
  { name: 'cover_photo', maxCount: 1 }
]), chapelController.create);

router.post('/search', authMiddleware, chapelController.search);

router.get('/:id', authMiddleware, chapelController.getById);

router.patch('/:id', authMiddleware, checkPermissions('PARROQUIA_CAPILLA_U'), upload.fields([
  { name: 'profile_photo', maxCount: 1 },
  { name: 'cover_photo', maxCount: 1 }
]), chapelController.update);

router.patch('/:id/status', authMiddleware, checkPermissions('ESTADO_CAPILLA_U'), chapelController.updateStatus);

router.delete('/:id/delete', authMiddleware, checkPermissions('PARROQUIA_CAPILLA_D'), chapelController.delete);

module.exports = router;