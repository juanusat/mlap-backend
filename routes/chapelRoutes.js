const express = require('express');
const router = express.Router();
const chapelController = require('../controllers/chapelController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create', authMiddleware, chapelController.create);

router.post('/search', authMiddleware, chapelController.search);

router.get('/:id', authMiddleware, chapelController.getById);

router.patch('/:id', authMiddleware, chapelController.update);

router.patch('/:id/status', authMiddleware, chapelController.updateStatus);

router.delete('/:id/delete', authMiddleware, chapelController.delete);

module.exports = router;