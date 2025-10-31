const pool = require('../db');

const listWorkers = async (parishId, page, limit) => {
  const offset = (page - 1) * limit;
  
  const countResult = await pool.query(
    `SELECT COUNT(*) 
     FROM association a
     INNER JOIN "user" u ON a.user_id = u.id
     WHERE a.parish_id = $1 AND a.end_date IS NULL`,
    [parishId]
  );
  
  const totalRecords = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(totalRecords / limit);
  
  const result = await pool.query(
    `SELECT 
      a.id as association_id,
      p.id as person_id,
      p.first_names,
      p.paternal_surname,
      p.email,
      a.active
     FROM association a
     INNER JOIN "user" u ON a.user_id = u.id
     INNER JOIN person p ON u.person_id = p.id
     WHERE a.parish_id = $1 AND a.end_date IS NULL
     ORDER BY p.first_names ASC
     LIMIT $2 OFFSET $3`,
    [parishId, limit, offset]
  );
  
  return {
    total_records: totalRecords,
    total_pages: totalPages,
    current_page: page,
    workers: result.rows
  };
};

const searchWorkers = async (parishId, page, limit, search) => {
  const offset = (page - 1) * limit;
  const searchPattern = `%${search}%`;
  
  const countResult = await pool.query(
    `SELECT COUNT(*) 
     FROM association a
     INNER JOIN "user" u ON a.user_id = u.id
     INNER JOIN person p ON u.person_id = p.id
     WHERE a.parish_id = $1 AND a.end_date IS NULL
     AND (p.first_names ILIKE $2 OR p.paternal_surname ILIKE $2 OR p.email ILIKE $2)`,
    [parishId, searchPattern]
  );
  
  const totalRecords = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(totalRecords / limit);
  
  const result = await pool.query(
    `SELECT 
      a.id as association_id,
      p.id as person_id,
      p.first_names,
      p.paternal_surname,
      p.email,
      a.active
     FROM association a
     INNER JOIN "user" u ON a.user_id = u.id
     INNER JOIN person p ON u.person_id = p.id
     WHERE a.parish_id = $1 AND a.end_date IS NULL
     AND (p.first_names ILIKE $2 OR p.paternal_surname ILIKE $2 OR p.email ILIKE $2)
     ORDER BY p.first_names ASC
     LIMIT $3 OFFSET $4`,
    [parishId, searchPattern, limit, offset]
  );
  
  return {
    total_records: totalRecords,
    total_pages: totalPages,
    current_page: page,
    workers: result.rows
  };
};

const inviteWorker = async (parishId, email) => {
  const personResult = await pool.query(
    `SELECT p.id, u.id as user_id 
     FROM person p
     LEFT JOIN "user" u ON p.id = u.person_id
     WHERE p.email = $1`,
    [email]
  );
  
  if (personResult.rows.length === 0) {
    return {
      message: 'Usuario no encontrado. Se ha enviado una invitación por correo electrónico para que se registre y se asocie a la parroquia.',
      data: null
    };
  }
  
  const person = personResult.rows[0];
  
  if (!person.user_id) {
    return {
      message: 'Usuario no encontrado. Se ha enviado una invitación por correo electrónico para que se registre y se asocie a la parroquia.',
      data: null
    };
  }
  
  const existingAssociation = await pool.query(
    `SELECT id FROM association 
     WHERE user_id = $1 AND parish_id = $2 AND end_date IS NULL`,
    [person.user_id, parishId]
  );
  
  if (existingAssociation.rows.length > 0) {
    throw new Error('El usuario ya está asociado a esta parroquia');
  }
  
  const result = await pool.query(
    `INSERT INTO association (id, user_id, parish_id, start_date, active)
     VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM association), $1, $2, CURRENT_DATE, true)
     RETURNING id`,
    [person.user_id, parishId]
  );
  
  return {
    message: 'Usuario asociado exitosamente a la parroquia.',
    data: { association_id: result.rows[0].id }
  };
};

const listWorkerRoles = async (associationId, page, limit) => {
  const offset = (page - 1) * limit;
  
  const workerResult = await pool.query(
    `SELECT 
      a.id as association_id,
      p.first_names,
      p.paternal_surname,
      p.email
     FROM association a
     INNER JOIN "user" u ON a.user_id = u.id
     INNER JOIN person p ON u.person_id = p.id
     WHERE a.id = $1`,
    [associationId]
  );
  
  if (workerResult.rows.length === 0) {
    throw new Error('Asociación no encontrada');
  }
  
  const countResult = await pool.query(
    `SELECT COUNT(*) 
     FROM user_role ur
     WHERE ur.association_id = $1 AND ur.revocation_date IS NULL`,
    [associationId]
  );
  
  const totalRecords = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(totalRecords / limit);
  
  const rolesResult = await pool.query(
    `SELECT 
      ur.id as user_role_id,
      r.id as role_id,
      r.name as role_name,
      ur.assignment_date
     FROM user_role ur
     INNER JOIN role r ON ur.role_id = r.id
     WHERE ur.association_id = $1 AND ur.revocation_date IS NULL
     ORDER BY ur.assignment_date DESC
     LIMIT $2 OFFSET $3`,
    [associationId, limit, offset]
  );
  
  return {
    worker_details: workerResult.rows[0],
    total_records: totalRecords,
    total_pages: totalPages,
    current_page: page,
    active_roles: rolesResult.rows
  };
};

const assignRole = async (associationId, roleId) => {
  const existingRole = await pool.query(
    `SELECT id FROM user_role 
     WHERE association_id = $1 AND role_id = $2 AND revocation_date IS NULL`,
    [associationId, roleId]
  );
  
  if (existingRole.rows.length > 0) {
    throw new Error('El usuario ya tiene este rol asignado');
  }
  
  await pool.query(
    `INSERT INTO user_role (id, association_id, role_id, assignment_date)
     VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM user_role), $1, $2, CURRENT_DATE)`,
    [associationId, roleId]
  );
};

const revokeRole = async (userRoleId) => {
  await pool.query(
    `UPDATE user_role 
     SET revocation_date = CURRENT_DATE
     WHERE id = $1`,
    [userRoleId]
  );
};

const updateAssociationStatus = async (associationId, active) => {
  await pool.query(
    `UPDATE association 
     SET active = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
    [active, associationId]
  );
};

const deleteAssociation = async (associationId) => {
  await pool.query(
    `UPDATE association 
     SET end_date = CURRENT_DATE, active = false, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [associationId]
  );
};

module.exports = {
  listWorkers,
  searchWorkers,
  inviteWorker,
  listWorkerRoles,
  assignRole,
  revokeRole,
  updateAssociationStatus,
  deleteAssociation
};
