const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { requireAuth } = require('../middleware/authMiddleware_new');

router.post('/parish/:parishId/roles/list', requireAuth, roleController.listRoles);
router.post('/parish/:parishId/roles/search', requireAuth, roleController.searchRoles);
router.post('/parish/:parishId/roles/create', requireAuth, roleController.createRole);

router.get('/parish/:parishId/roles/:roleId', requireAuth, roleController.getRoleById);
router.put('/parish/:parishId/roles/:roleId', requireAuth, roleController.updateRole);
router.delete('/parish/:parishId/roles/:roleId', requireAuth, roleController.deleteRole);

router.patch('/parish/:parishId/roles/:roleId/status', requireAuth, roleController.updateRoleStatus);

router.get('/parish/:parishId/roles/:roleId/permissions', requireAuth, roleController.getRolePermissions);
router.put('/parish/:parishId/roles/:roleId/permissions', requireAuth, roleController.updateRolePermissions);

module.exports = router;
