const pool = require('../db');

const listRoles = async (parishId, page, limit) => {
  const offset = (page - 1) * limit;
  
  const countResult = await pool.query(
    `SELECT COUNT(*) 
     FROM role 
     WHERE parish_id = $1`,
    [parishId]
  );
  
  const totalRecords = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(totalRecords / limit);
  
  const result = await pool.query(
    `SELECT 
      id as role_id,
      name,
      description,
      active
     FROM role
     WHERE parish_id = $1
     ORDER BY name ASC
     LIMIT $2 OFFSET $3`,
    [parishId, limit, offset]
  );
  
  return {
    total_records: totalRecords,
    total_pages: totalPages,
    current_page: page,
    roles: result.rows
  };
};

const searchRoles = async (parishId, page, limit, search) => {
  const offset = (page - 1) * limit;
  const searchPattern = `%${search}%`;
  
  const countResult = await pool.query(
    `SELECT COUNT(*) 
     FROM role
     WHERE parish_id = $1 AND name ILIKE $2`,
    [parishId, searchPattern]
  );
  
  const totalRecords = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(totalRecords / limit);
  
  const result = await pool.query(
    `SELECT 
      id as role_id,
      name,
      description,
      active
     FROM role
     WHERE parish_id = $1 AND name ILIKE $2
     ORDER BY name ASC
     LIMIT $3 OFFSET $4`,
    [parishId, searchPattern, limit, offset]
  );
  
  return {
    total_records: totalRecords,
    total_pages: totalPages,
    current_page: page,
    roles: result.rows
  };
};

const createRole = async (parishId, name, description) => {
  const client = await pool.getClient();
  
  try {
    await client.query('BEGIN');
    
    const roleResult = await client.query(
      `INSERT INTO role (id, parish_id, name, description, active)
       VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM role), $1, $2, $3, true)
       RETURNING id, name`,
      [parishId, name, description]
    );
    
    const roleId = roleResult.rows[0].id;
    
    const permissionsResult = await client.query(
      `SELECT id FROM permission ORDER BY id`
    );
    
    for (const perm of permissionsResult.rows) {
      await client.query(
        `INSERT INTO role_permission (id, role_id, permission_id, granted, assignment_date)
         VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM role_permission), $1, $2, false, NULL)`,
        [roleId, perm.id]
      );
    }
    
    await client.query('COMMIT');
    
    return {
      role_id: roleId,
      name: roleResult.rows[0].name
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const getRoleById = async (roleId) => {
  const result = await pool.query(
    `SELECT 
      id as role_id,
      parish_id,
      name,
      description,
      active,
      created_at
     FROM role
     WHERE id = $1`,
    [roleId]
  );
  
  if (result.rows.length === 0) {
    throw new Error('Rol no encontrado');
  }
  
  return result.rows[0];
};

const updateRole = async (roleId, name, description) => {
  await pool.query(
    `UPDATE role 
     SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = $3`,
    [name, description, roleId]
  );
};

const updateRoleStatus = async (roleId, active) => {
  await pool.query(
    `UPDATE role 
     SET active = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
    [active, roleId]
  );
};

const deleteRole = async (roleId) => {
  await pool.query(
    `UPDATE role 
     SET active = false, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [roleId]
  );
};

const getRolePermissions = async (roleId) => {
  console.log('=== getRolePermissions SERVICE ===');
  console.log('Role ID:', roleId);
  
  const result = await pool.query(
    `SELECT 
      p.id as permission_id,
      p.code,
      p.name,
      p.category,
      COALESCE(rp.granted, false) as granted
     FROM permission p
     LEFT JOIN role_permission rp ON p.id = rp.permission_id AND rp.role_id = $1
     ORDER BY p.category, p.name`,
    [roleId]
  );
  
  console.log('Total permisos encontrados:', result.rows.length);
  console.log('Permisos con granted=true:', result.rows.filter(r => r.granted).length);
  console.log('Primeros 5 permisos:', result.rows.slice(0, 5));
  
  return result.rows;
};

const updateRolePermissions = async (roleId, permissions) => {
  console.log('=== updateRolePermissions SERVICE ===');
  console.log('Role ID:', roleId);
  console.log('Permisos a actualizar:', permissions.length);
  console.log('Permisos con granted=true:', permissions.filter(p => p.granted).length);
  console.log('Primeros 5 permisos:', permissions.slice(0, 5));
  
  const client = await pool.getClient();
  
  try {
    await client.query('BEGIN');
    
    let updatedCount = 0;
    
    for (const permission of permissions) {
      const existingPerm = await client.query(
        `SELECT id, granted FROM role_permission 
         WHERE role_id = $1 AND permission_id = $2`,
        [roleId, permission.permission_id]
      );
      
      if (existingPerm.rows.length > 0) {
        const currentGranted = existingPerm.rows[0].granted;
        
        if (permission.granted && !currentGranted) {
          console.log(`Activando permiso ${permission.permission_id}`);
          await client.query(
            `UPDATE role_permission 
             SET granted = true, 
                 assignment_date = CURRENT_DATE,
                 revocation_date = NULL,
                 updated_at = CURRENT_TIMESTAMP
             WHERE role_id = $1 AND permission_id = $2`,
            [roleId, permission.permission_id]
          );
          updatedCount++;
        } else if (!permission.granted && currentGranted) {
          console.log(`Desactivando permiso ${permission.permission_id}`);
          await client.query(
            `UPDATE role_permission 
             SET granted = false,
                 revocation_date = CURRENT_DATE,
                 updated_at = CURRENT_TIMESTAMP
             WHERE role_id = $1 AND permission_id = $2`,
            [roleId, permission.permission_id]
          );
          updatedCount++;
        }
      } else {
        if (permission.granted) {
          console.log(`Insertando permiso ${permission.permission_id} como activo`);
          await client.query(
            `INSERT INTO role_permission (id, role_id, permission_id, granted, assignment_date)
             VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM role_permission), $1, $2, true, CURRENT_DATE)`,
            [roleId, permission.permission_id]
          );
          updatedCount++;
        } else {
          console.log(`Insertando permiso ${permission.permission_id} como inactivo`);
          await client.query(
            `INSERT INTO role_permission (id, role_id, permission_id, granted, assignment_date)
             VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM role_permission), $1, $2, false, NULL)`,
            [roleId, permission.permission_id]
          );
        }
      }
    }
    
    await client.query('COMMIT');
    console.log(`Total de cambios realizados: ${updatedCount}`);
    return updatedCount;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en updateRolePermissions:', error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  listRoles,
  searchRoles,
  createRole,
  getRoleById,
  updateRole,
  updateRoleStatus,
  deleteRole,
  getRolePermissions,
  updateRolePermissions
};
