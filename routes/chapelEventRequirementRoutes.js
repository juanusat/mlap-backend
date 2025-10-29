const express = require('express');
const router = express.Router();
const chapelEventRequirementController = require('../controllers/chapelEventRequirementController');
const authMiddleware = require('../middleware/authMiddleware');

// Obtener todos los requisitos (base + adicionales) de un event_variant
router.get('/events/variants/:eventVariantId/requirements', authMiddleware, chapelEventRequirementController.getRequirementsByEventVariant);

// CRUD de requisitos adicionales
router.post('/requirements/create', authMiddleware, chapelEventRequirementController.create);
router.get('/requirements/:id', authMiddleware, chapelEventRequirementController.getById);
router.put('/requirements/:id', authMiddleware, chapelEventRequirementController.update);
router.patch('/requirements/:id/status', authMiddleware, chapelEventRequirementController.updateStatus);
router.delete('/requirements/:id', authMiddleware, chapelEventRequirementController.delete);

module.exports = router;
