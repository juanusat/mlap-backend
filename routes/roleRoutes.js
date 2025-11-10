const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { requireAuth } = require('../middleware/authMiddleware_new');
const { checkPermissions } = require('../middleware/permissionMiddleware');

router.post('/parish/:parishId/roles/list', requireAuth, checkPermissions('SEGURIDAD_ROL_R'), roleController.listRoles);
router.post('/parish/:parishId/roles/search', requireAuth, checkPermissions('SEGURIDAD_ROL_R'), roleController.searchRoles);
router.post('/parish/:parishId/roles/create', requireAuth, checkPermissions('SEGURIDAD_ROL_C'), roleController.createRole);

router.get('/parish/:parishId/roles/:roleId', requireAuth, checkPermissions('SEGURIDAD_ROL_R'), roleController.getRoleById);
router.put('/parish/:parishId/roles/:roleId', requireAuth, checkPermissions('SEGURIDAD_ROL_DATA_U'), roleController.updateRole);
router.delete('/parish/:parishId/roles/:roleId', requireAuth, checkPermissions('SEGURIDAD_ROL_D'), roleController.deleteRole);

router.patch('/parish/:parishId/roles/:roleId/status', requireAuth, checkPermissions('ESTADO_ROL_U'), roleController.updateRoleStatus);

router.get('/parish/:parishId/roles/:roleId/permissions', requireAuth, checkPermissions('SEGURIDAD_ROL_R'), roleController.getRolePermissions);
router.put('/parish/:parishId/roles/:roleId/permissions', requireAuth, checkPermissions('SEGURIDAD_ROL_PERMS_U'), roleController.updateRolePermissions);

module.exports = router;
