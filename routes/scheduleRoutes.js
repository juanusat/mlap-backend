const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const authMiddleware = require('../middleware/authMiddleware_new');

// Horarios Generales
router.post(
  '/parishes/:parishId/chapels/:chapelId/general-schedules/list',
  authMiddleware,
  scheduleController.listGeneralSchedules
);

router.post(
  '/parishes/:parishId/chapels/:chapelId/general-schedules/bulk-update',
  authMiddleware,
  scheduleController.bulkUpdateGeneralSchedules
);

// Horarios Específicos (Excepciones)
router.post(
  '/parishes/:parishId/chapels/:chapelId/specific-schedules/list',
  authMiddleware,
  scheduleController.listSpecificSchedules
);

router.post(
  '/parishes/:parishId/chapels/:chapelId/specific-schedules/create',
  authMiddleware,
  scheduleController.createSpecificSchedule
);

router.put(
  '/parishes/:parishId/chapels/:chapelId/specific-schedules/:scheduleId',
  authMiddleware,
  scheduleController.updateSpecificSchedule
);

router.delete(
  '/parishes/:parishId/chapels/:chapelId/specific-schedules/:scheduleId',
  authMiddleware,
  scheduleController.deleteSpecificSchedule
);

module.exports = router;
