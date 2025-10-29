const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const authMiddleware = require('../middleware/authMiddleware');

// Rutas públicas (no requieren autenticación para consultar disponibilidad)
router.get('/form/:event_id', reservationController.getFormInfo);
router.post('/check-availability', reservationController.checkAvailability);
router.post('/available-slots', reservationController.getAvailableSlots);

// Rutas protegidas (requieren autenticación para crear reservas)
router.post('/create', authMiddleware, reservationController.createReservation);

module.exports = router;
