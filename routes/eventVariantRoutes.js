const express = require('express');
const router = express.Router();
const eventVariantController = require('../controllers/eventVariantController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkPermissions } = require('../middleware/permissionMiddleware');

router.get('/events/base/list', authMiddleware, eventVariantController.listEventsBase);
router.post('/events/variants/list', authMiddleware, checkPermissions('ACTOS_LITURGICOS_ACTOS_R'), eventVariantController.list);
router.post('/events/variants/search', authMiddleware, checkPermissions('ACTOS_LITURGICOS_ACTOS_R'), eventVariantController.search);
router.get('/events/variants/:id', authMiddleware, checkPermissions('ACTOS_LITURGICOS_ACTOS_R'), eventVariantController.getById);
router.post('/events/variants/create', authMiddleware, checkPermissions('ACTOS_LITURGICOS_ACTOS_C'), eventVariantController.create);
router.put('/events/variants/:id', authMiddleware, checkPermissions('ACTOS_LITURGICOS_ACTOS_U'), eventVariantController.update);
router.patch('/events/variants/:id', authMiddleware, checkPermissions(['ACTOS_LITURGICOS_ACTOS_U', 'ESTADO_ACTOS_LITURGICOS_U']), eventVariantController.partialUpdate);
router.delete('/events/variants/:id', authMiddleware, checkPermissions('ACTOS_LITURGICOS_ACTOS_D'), eventVariantController.delete);

module.exports = router;
