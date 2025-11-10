const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { authMiddleware } = require('../middleware/authMiddleware_new');
const { checkPermissions } = require('../middleware/permissionMiddleware');

router.post(
  '/parishes/:parishId/chapels/:chapelId/general-schedules/list',
  authMiddleware,
  scheduleController.listGeneralSchedules
);

router.post(
  '/parishes/:parishId/chapels/:chapelId/general-schedules/bulk-update',
  authMiddleware,
  checkPermissions(['ACTOS_LITURGICOS_HORA_C', 'ACTOS_LITURGICOS_HORA_U']),
  scheduleController.bulkUpdateGeneralSchedules
);

router.post(
  '/parishes/:parishId/chapels/:chapelId/specific-schedules/list',
  authMiddleware,
  scheduleController.listSpecificSchedules
);

router.post(
  '/parishes/:parishId/chapels/:chapelId/specific-schedules/create',
  authMiddleware,
  checkPermissions(['EXCEP_DISP_C', 'EXCEP_NO_DISP_C']),
  scheduleController.createSpecificSchedule
);

router.put(
  '/parishes/:parishId/chapels/:chapelId/specific-schedules/:scheduleId',
  authMiddleware,
  checkPermissions(['EXCEP_DISP_U', 'EXCEP_NO_DISP_U']),
  scheduleController.updateSpecificSchedule
);

router.delete(
  '/parishes/:parishId/chapels/:chapelId/specific-schedules/:scheduleId',
  authMiddleware,
  checkPermissions(['EXCEP_DISP_D', 'EXCEP_NO_DISP_D']),
  scheduleController.deleteSpecificSchedule
);

module.exports = router;
