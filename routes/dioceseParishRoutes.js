const express = require('express');
const router = express.Router();
const dioceseParishController = require('../controllers/dioceseParishController');
const authMiddleware = require('../middleware/authMiddleware');
const dioceseMiddleware = require('../middleware/dioceseMiddleware');

router.post('/parishes/create', authMiddleware, dioceseMiddleware, dioceseParishController.create);
router.post('/parishes/list', authMiddleware, dioceseMiddleware, dioceseParishController.list);
router.post('/parishes/search', authMiddleware, dioceseMiddleware, dioceseParishController.search);
router.get('/parishes/:id', authMiddleware, dioceseMiddleware, dioceseParishController.getById);
router.put('/parishes/:id', authMiddleware, dioceseMiddleware, dioceseParishController.update);
router.patch('/parishes/:id', authMiddleware, dioceseMiddleware, dioceseParishController.partialUpdate);
router.patch('/parishes/:id/status', authMiddleware, dioceseMiddleware, dioceseParishController.updateStatus);
router.delete('/parishes/:id/delete', authMiddleware, dioceseMiddleware, dioceseParishController.delete);

module.exports = router;
