const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { authMiddleware } = require('../middleware/authMiddleware_new');

// Rutas para gestión administrativa de reservas (contexto de parroquia)
router.post('/reservations/list', authMiddleware, reservationController.listReservationsForManagement);
router.post('/reservations/search', authMiddleware, reservationController.searchReservationsForManagement);
router.get('/reservations/:id', authMiddleware, reservationController.getReservationDetailsForManagement);
router.patch('/reservations/:id/status', authMiddleware, reservationController.updateReservationStatus);
router.patch('/reservations/:id/reject', authMiddleware, reservationController.rejectReservation);

module.exports = router;
