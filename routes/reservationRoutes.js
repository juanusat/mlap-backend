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

router.post('/history/list', authMiddleware, reservationController.listHistoryReservations);
router.post('/history/search', authMiddleware, reservationController.searchHistoryReservations);
router.get('/:id', authMiddleware, reservationController.getReservationDetails);

module.exports = router;
