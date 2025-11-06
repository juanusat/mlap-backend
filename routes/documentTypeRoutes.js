const express = require('express');
const router = express.Router();
const documentTypeController = require('../controllers/documentTypeController');
const authMiddleware = require('../middleware/authMiddleware');
const dioceseMiddleware = require('../middleware/dioceseMiddleware');

// Ruta pública para obtener tipos de documento activos (sin requerir permisos de diócesis)
router.get('/document-types/active', authMiddleware, documentTypeController.listActive);

router.post('/document-types/create', authMiddleware, dioceseMiddleware, documentTypeController.create);
router.post('/document-types/list', authMiddleware, dioceseMiddleware, documentTypeController.list);
router.post('/document-types/search', authMiddleware, dioceseMiddleware, documentTypeController.search);
router.get('/document-types/:id', authMiddleware, dioceseMiddleware, documentTypeController.getById);
router.put('/document-types/:id', authMiddleware, dioceseMiddleware, documentTypeController.update);
router.patch('/document-types/:id', authMiddleware, dioceseMiddleware, documentTypeController.partialUpdate);
router.patch('/document-types/:id/status', authMiddleware, dioceseMiddleware, documentTypeController.updateStatus);
router.delete('/document-types/:id/delete', authMiddleware, dioceseMiddleware, documentTypeController.delete);

module.exports = router;
