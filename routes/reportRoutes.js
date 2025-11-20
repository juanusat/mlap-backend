const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/reservations-by-chapel', authMiddleware, reportController.getReservationsByChapel);
router.get('/reservations-by-date-range', authMiddleware, reportController.getReservationsByDateRange);
router.get('/occupancy-map', authMiddleware, reportController.getOccupancyMap);
router.get('/events-by-chapel', authMiddleware, reportController.getEventsByChapel);
router.get('/parish-hierarchy', authMiddleware, reportController.getParishHierarchy);
router.get('/chapel-events', authMiddleware, reportController.getChapelEvents);
router.get('/cancelled-reservations', authMiddleware, reportController.getCancelledReservations);
router.get('/completed-reservations', authMiddleware, reportController.getCompletedReservations);
router.get('/role-frequency', authMiddleware, reportController.getRoleFrequency);
router.get('/user-audit-log', authMiddleware, reportController.getUserAuditLog);

module.exports = router;
