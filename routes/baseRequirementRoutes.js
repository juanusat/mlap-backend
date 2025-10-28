const express = require('express');
const router = express.Router();
const baseRequirementController = require('../controllers/baseRequirementController');
const authMiddleware = require('../middleware/authMiddleware');
const dioceseMiddleware = require('../middleware/dioceseMiddleware');

router.post('/events/:id/requirements/create', authMiddleware, dioceseMiddleware, baseRequirementController.create);
router.post('/events/:id/requirements/list', authMiddleware, dioceseMiddleware, baseRequirementController.list);
router.post('/events/:id/requirements/search', authMiddleware, dioceseMiddleware, baseRequirementController.search);
router.get('/events/:event_id/requirements/:id', authMiddleware, dioceseMiddleware, baseRequirementController.getById);
router.put('/events/:event_id/requirements/:id', authMiddleware, dioceseMiddleware, baseRequirementController.update);
router.patch('/events/:event_id/requirements/:id', authMiddleware, dioceseMiddleware, baseRequirementController.partialUpdate);
router.patch('/events/:event_id/requirements/:id/status', authMiddleware, dioceseMiddleware, baseRequirementController.updateStatus);
router.delete('/events/:event_id/requirements/:id/delete', authMiddleware, dioceseMiddleware, baseRequirementController.delete);

module.exports = router;
