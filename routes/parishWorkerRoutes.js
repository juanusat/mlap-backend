const express = require('express');
const router = express.Router();
const parishWorkerController = require('../controllers/parishWorkerController');
const { requireAuth } = require('../middleware/authMiddleware_new');

router.post('/parish/:parishId/workers/list', requireAuth, parishWorkerController.listWorkers);
router.post('/parish/:parishId/workers/search', requireAuth, parishWorkerController.searchWorkers);
router.post('/parish/:parishId/workers/create', requireAuth, parishWorkerController.inviteWorker);

router.post('/security/parish-workers/:id/roles/list', requireAuth, parishWorkerController.listWorkerRoles);
router.post('/security/parish-workers/:id/roles/create', requireAuth, parishWorkerController.assignRole);

router.delete('/parish/user-roles/:userRoleId', requireAuth, parishWorkerController.revokeRole);

router.patch('/parish/associations/:associationId/status', requireAuth, parishWorkerController.updateAssociationStatus);
router.delete('/parish/associations/:associationId', requireAuth, parishWorkerController.deleteAssociation);

module.exports = router;
