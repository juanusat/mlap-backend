const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');
const dioceseMiddleware = require('../middleware/dioceseMiddleware');

router.get('/events/select', authMiddleware, dioceseMiddleware, eventController.listForSelect);
router.post('/events/create', authMiddleware, dioceseMiddleware, eventController.create);
router.post('/events/list', authMiddleware, dioceseMiddleware, eventController.list);
router.post('/events/search', authMiddleware, dioceseMiddleware, eventController.search);
router.get('/events/:id', authMiddleware, dioceseMiddleware, eventController.getById);
router.put('/events/:id', authMiddleware, dioceseMiddleware, eventController.update);
router.patch('/events/:id', authMiddleware, dioceseMiddleware, eventController.partialUpdate);
router.patch('/events/:id/status', authMiddleware, dioceseMiddleware, eventController.updateStatus);
router.delete('/events/:id/delete', authMiddleware, dioceseMiddleware, eventController.delete);

module.exports = router;
