const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

router.post(
  '/parishes/:parishId/chapels/:chapelId/general-schedules/list',
  scheduleController.publicListGeneralSchedules
);

router.post(
  '/parishes/:parishId/chapels/:chapelId/specific-schedules/list',
  scheduleController.publicListSpecificSchedules
);

module.exports = router;
