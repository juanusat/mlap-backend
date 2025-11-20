const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/reservations-by-chapel', authMiddleware, reportController.getReservationsByChapel);
router.get('/occupancy-map', authMiddleware, reportController.getOccupancyMap);
router.get('/events-by-chapel', authMiddleware, reportController.getEventsByChapel);
router.get('/parish-hierarchy', authMiddleware, reportController.getParishHierarchy);
router.get('/chapel-events', authMiddleware, reportController.getChapelEvents);

module.exports = router;
