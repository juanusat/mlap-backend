const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { authMiddleware } = require('../middleware/authMiddleware_new');

router.post('/reservations/list', authMiddleware, reservationController.listReservationsForManagement);
router.post('/reservations/search', authMiddleware, reservationController.searchReservationsForManagement);
router.get('/reservations/:id', authMiddleware, reservationController.getReservationDetailsForManagement);
router.patch('/reservations/:id/status', authMiddleware, reservationController.updateReservationStatus);
router.patch('/reservations/:id/reject', authMiddleware, reservationController.rejectReservation);
router.patch('/reservations/:id', authMiddleware, reservationController.updateReservation);

router.get('/reservations/:id/payments', authMiddleware, reservationController.getReservationPayments);
router.post('/reservations/:id/payments', authMiddleware, reservationController.createPayment);

module.exports = router;
