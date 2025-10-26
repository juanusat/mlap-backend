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
  const result = await pool.query(
    `INSERT INTO role (parish_id, name, description, active)
     VALUES ($1, $2, $3, true)
     RETURNING id, name`,
    [parishId, name, description]
  );
  
  return {
    role_id: result.rows[0].id,
    name: result.rows[0].name
  };
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
  const result = await pool.query(
    `SELECT 
      p.id as permission_id,
      p.code,
      p.name,
      p.category,
      CASE 
        WHEN rp.id IS NOT NULL AND rp.granted = true AND rp.revocation_date IS NULL THEN true
        ELSE false
      END as granted
     FROM permission p
     LEFT JOIN role_permission rp ON p.id = rp.permission_id AND rp.role_id = $1
     ORDER BY p.category, p.name`,
    [roleId]
  );
  
  return result.rows;
};

const updateRolePermissions = async (roleId, permissions) => {
  const client = await pool.getClient();
  
  try {
    await client.query('BEGIN');
    
    await client.query(
      `UPDATE role_permission 
       SET revocation_date = CURRENT_TIMESTAMP
       WHERE role_id = $1 AND revocation_date IS NULL`,
      [roleId]
    );
    
    for (const permission of permissions) {
      if (permission.granted) {
        await client.query(
          `INSERT INTO role_permission (role_id, permission_id, granted, assignment_date)
           VALUES ($1, $2, true, CURRENT_DATE)`,
          [roleId, permission.permission_id]
        );
      }
    }
    
    await client.query('COMMIT');
    return permissions.filter(p => p.granted).length;
  } catch (error) {
    await client.query('ROLLBACK');
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
