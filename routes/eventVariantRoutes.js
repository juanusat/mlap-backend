const express = require('express');
const router = express.Router();
const eventVariantController = require('../controllers/eventVariantController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/events/base/list', authMiddleware, eventVariantController.listEventsBase);
router.post('/events/variants/list', authMiddleware, eventVariantController.list);
router.post('/events/variants/search', authMiddleware, eventVariantController.search);
router.get('/events/variants/:id', authMiddleware, eventVariantController.getById);
router.post('/events/variants/create', authMiddleware, eventVariantController.create);
router.put('/events/variants/:id', authMiddleware, eventVariantController.update);
router.patch('/events/variants/:id', authMiddleware, eventVariantController.partialUpdate);
router.delete('/events/variants/:id', authMiddleware, eventVariantController.delete);

module.exports = router;
