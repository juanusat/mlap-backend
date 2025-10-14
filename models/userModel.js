const db = require('../db');

const findByEmail = async (email) => {
  const query = `
    SELECT 
      u.id, 
      u.username, 
      u.password_hash, 
      u.active, 
      p.first_names, 
      p.paternal_surname 
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
      p.id, 
      p.name
    FROM public.association a
    JOIN public.parish p ON a.parish_id = p.id
    WHERE a.user_id = $1 AND a.active = TRUE AND p.active = TRUE;
  `;
  const { rows } = await db.query(query, [userId]);
  return rows;
};

const findUserRolesInParish = async (userId, parishId) => {
    const query = `
      SELECT 
          r.id, 
          r.name
      FROM public.user_role ur
      JOIN public.role r ON ur.role_id = r.id
      JOIN public.association a ON ur.association_id = a.id
      WHERE a.user_id = $1 AND a.parish_id = $2 AND r.active = TRUE;
  `;
    const { rows } = await db.query(query, [userId, parishId]);
    return rows;
};


module.exports = {
  findByEmail,
  findUserAssociations,
  findUserRolesInParish
};