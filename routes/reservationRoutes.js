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

// Rutas para gestión administrativa (requieren contexto de parroquia)
router.post('/management/list', authMiddleware, reservationController.listReservationsForManagement);
router.post('/management/search', authMiddleware, reservationController.searchReservationsForManagement);
router.get('/management/:id', authMiddleware, reservationController.getReservationDetailsForManagement);
router.patch('/management/:id/status', authMiddleware, reservationController.updateReservationStatus);
router.patch('/management/:id/reject', authMiddleware, reservationController.rejectReservation);
router.patch('/management/:id', authMiddleware, reservationController.updateReservation);

module.exports = router;
