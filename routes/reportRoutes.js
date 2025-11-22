const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkPermissions } = require('../middleware/permissionMiddleware');

router.get('/reservations-by-chapel', authMiddleware, checkPermissions('ACTOS_LITURGICOS_REP01'), reportController.getReservationsByChapel);
router.get('/reservations-by-date-range', authMiddleware, checkPermissions('ACTOS_LITURGICOS_REP02'), reportController.getReservationsByDateRange);
router.get('/occupancy-map', authMiddleware, checkPermissions('ACTOS_LITURGICOS_REP03'), reportController.getOccupancyMap);
router.get('/events-by-chapel', authMiddleware, checkPermissions('PARROQUIA_REP01'), reportController.getEventsByChapel);
router.get('/parish-hierarchy', authMiddleware, reportController.getParishHierarchy);
router.get('/chapel-events', authMiddleware, reportController.getChapelEvents);
router.get('/cancelled-reservations', authMiddleware, reportController.getCancelledReservations);
router.get('/completed-reservations', authMiddleware, reportController.getCompletedReservations);
router.get('/role-frequency', authMiddleware, checkPermissions('SEGURIDAD_REP01'), reportController.getRoleFrequency);
router.get('/user-audit-log', authMiddleware, reportController.getUserAuditLog);

module.exports = router;
