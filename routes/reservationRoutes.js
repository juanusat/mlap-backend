const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { authMiddleware } = require('../middleware/authMiddleware_new');

router.get('/form/:event_id', reservationController.getFormInfo);
router.post('/check-availability', reservationController.checkAvailability);
router.post('/available-slots', reservationController.getAvailableSlots);

router.post('/create', authMiddleware, reservationController.createReservation);

router.post('/pending/list', authMiddleware, reservationController.listPendingReservations);
router.post('/pending/search', authMiddleware, reservationController.searchPendingReservations);
router.post('/:id/cancel', authMiddleware, reservationController.cancelReservation);

module.exports = router;
