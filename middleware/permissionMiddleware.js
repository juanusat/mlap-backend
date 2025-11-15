const db = require('../db');

const checkPermissions = (requiredPermissions) => {
    return async (req, res, next) => {
        try {
            const { userId, context_type, parishId, roleId } = req.user;

            if (context_type !== 'PARISH') {
                return res.status(403).json({
                    message: 'Acceso denegado. Esta acción requiere contexto de parroquia.'
                });
            }

            const isParishAdminQuery = `
                SELECT EXISTS(
                    SELECT 1 FROM parish 
                    WHERE id = $1 AND admin_user_id = $2
                ) as is_admin
            `;
            const adminResult = await db.query(isParishAdminQuery, [parishId, userId]);
            
            if (adminResult.rows[0].is_admin) {
                return next();
            }

            if (!roleId) {
                return res.status(403).json({
                    message: 'Acceso denegado. No hay rol activo seleccionado.'
                });
            }

            const permissionsQuery = `
                SELECT ARRAY_AGG(DISTINCT p.code) as user_permissions
                FROM role_permission rp
                JOIN permission p ON p.id = rp.permission_id
                WHERE rp.role_id = $1 
                  AND rp.granted = true
                  AND (rp.revocation_date IS NULL OR rp.revocation_date > CURRENT_TIMESTAMP)
            `;
            
            const result = await db.query(permissionsQuery, [roleId]);
            const userPermissions = result.rows[0]?.user_permissions || [];

            const requiredPermsArray = Array.isArray(requiredPermissions) 
                ? requiredPermissions 
                : [requiredPermissions];

            const hasPermission = requiredPermsArray.some(perm => 
                userPermissions.includes(perm)
            );

            if (!hasPermission) {
                return res.status(403).json({
                    message: 'Acceso denegado. No tienes los permisos necesarios para realizar esta acción.',
                    required: requiredPermsArray,
                    user_permissions: userPermissions
                });
            }

            req.userPermissions = userPermissions;
            next();
        } catch (error) {
            console.error('Error verificando permisos:', error);
            return res.status(500).json({
                message: 'Error al verificar permisos.'
            });
        }
    };
};

module.exports = { checkPermissions };
