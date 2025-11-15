const db = require('../db');

const create = async (userData) => {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    const personQuery = `
      INSERT INTO public.person (id, first_names, paternal_surname, maternal_surname, email, document_type_id, document)
      VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM person), $1, $2, $3, $4, $5, $6)
      RETURNING id;
    `;
    const personResult = await client.query(personQuery, [
      userData.first_names,
      userData.paternal_surname,
      userData.maternal_surname || null,
      userData.email,
      userData.document_type_id || null,
      userData.document || null
    ]);
    
    const personId = personResult.rows[0].id;
    
    const userQuery = `
      INSERT INTO public.user (id, person_id, username, password_hash, active)
      VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM "user"), $1, $2, $3, TRUE)
      RETURNING id;
    `;
    const userResult = await client.query(userQuery, [
      personId,
      userData.username,
      userData.password_hash
    ]);
    
    await client.query('COMMIT');
    return userResult.rows[0];
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const findByEmail = async (email) => {
  const query = `
    SELECT 
      u.id, 
      u.username, 
      u.password_hash, 
      u.active, 
      p.first_names, 
      p.paternal_surname,
      p.email
    FROM public.user u
    JOIN public.person p ON u.person_id = p.id
    WHERE p.email = $1;
  `;
  console.log('SQL findByEmail:', query.trim());
  console.log('SQL findByEmail params:', [email]);
  const { rows } = await db.query(query, [email]);
  return rows[0];
};

const findUserAssociations = async (userId) => {
  const query = `
    SELECT 
      p.id as parish_id, 
      p.name as parish_name
    FROM public.association a
    JOIN public.parish p ON a.parish_id = p.id
    WHERE a.user_id = $1 AND a.active = TRUE AND p.active = TRUE;
  `;
  console.log('SQL findUserAssociations:', query.trim());
  console.log('SQL findUserAssociations params:', [userId]);
  const { rows } = await db.query(query, [userId]);
  console.log('SQL findUserAssociations result:', rows);
  return rows;
};

const isDioceseUser = async (userId) => {
  // Verifica si el usuario tiene el campo is_diocese marcado como TRUE en la tabla user
  const query = `
    SELECT is_diocese
    FROM public.user 
    WHERE id = $1;
  `;
  const { rows } = await db.query(query, [userId]);
  return rows[0]?.is_diocese || false;
};

const findUserRolesInParish = async (userId, parishId) => {
    const query = `
      SELECT 
          r.id, 
          r.name
      FROM public.user_role ur
      JOIN public.role r ON ur.role_id = r.id
      JOIN public.association a ON ur.association_id = a.id
      WHERE a.user_id = $1 
        AND a.parish_id = $2 
        AND a.active = TRUE
        AND r.active = TRUE
        AND ur.revocation_date IS NULL;
  `;
    const { rows } = await db.query(query, [userId, parishId]);
    return rows;
};

const findUserSessionInfo = async (userId) => {
  const query = `
    SELECT 
      u.id,
      u.is_diocese,
      p.first_names,
      p.paternal_surname,
      p.maternal_surname,
      p.profile_photo
    FROM public.user u
    JOIN public.person p ON u.person_id = p.id
    WHERE u.id = $1 AND u.active = TRUE;
  `;
  const { rows } = await db.query(query, [userId]);
  return rows[0];
};

const findParishById = async (parishId) => {
  const query = `
    SELECT id, name
    FROM public.parish
    WHERE id = $1 AND active = TRUE;
  `;
  const { rows } = await db.query(query, [parishId]);
  return rows[0];
};

const findRoleById = async (roleId) => {
  const query = `
    SELECT id, name
    FROM public.role
    WHERE id = $1 AND active = TRUE;
  `;
  const { rows } = await db.query(query, [roleId]);
  return rows[0];
};

const isParishAdmin = async (userId, parishId) => {
  const query = `
    SELECT 1
    FROM public.parish
    WHERE id = $1 AND admin_user_id = $2 AND active = TRUE;
  `;
  const { rows } = await db.query(query, [parishId, userId]);
  return rows.length > 0;
};

const findRolePermissions = async (roleId) => {
  const query = `
    SELECT p.code
    FROM public.role_permission rp
    JOIN public.permission p ON rp.permission_id = p.id
    WHERE rp.role_id = $1 
      AND rp.revocation_date IS NULL
      AND rp.granted = TRUE
    ORDER BY p.code;
  `;
  const { rows } = await db.query(query, [roleId]);
  return rows.map(row => row.code);
};

const findParishionerPermissions = async () => {
  const query = `
    SELECT p.code
    FROM public.permission p
    WHERE p.category = 'PARISHIONER'
    ORDER BY p.code;
  `;
  const { rows } = await db.query(query);
  return rows.map(row => row.code);
};

const checkUserAssociationStatus = async (userId, parishId) => {
  const query = `
    SELECT 
      id,
      active
    FROM public.association
    WHERE user_id = $1 AND parish_id = $2;
  `;
  const { rows } = await db.query(query, [userId, parishId]);
  return rows[0];
};

module.exports = {
  create,
  findByEmail,
  findUserAssociations,
  findUserRolesInParish,
  isDioceseUser,
  findUserSessionInfo,
  findParishById,
  findRoleById,
  isParishAdmin,
  findRolePermissions,
  findParishionerPermissions,
  checkUserAssociationStatus
};