const db = require('../db');

const findChapelsByParishId = async (parishId) => {
  const query = `
    SELECT id, name, address 
    FROM public.chapel 
    WHERE parish_id = $1 AND active = TRUE;
  `;
  const { rows } = await db.query(query, [parishId]);
  return rows;
};

module.exports = {
  findChapelsByParishId,
};