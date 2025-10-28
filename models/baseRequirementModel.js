const db = require('../db');

class BaseRequirementModel {
  static async create(eventId, { name, description }) {
    const query = `
      INSERT INTO public.base_requirement (id, event_id, name, description, active, created_at, updated_at)
      VALUES (
        (SELECT COALESCE(MAX(id), 0) + 1 FROM public.base_requirement),
        $1, $2, $3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING id, event_id, name, description, active, created_at, updated_at
    `;
    const values = [eventId, name, description || ''];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findAll(eventId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT id, event_id, name, description, active, created_at, updated_at
      FROM public.base_requirement
      WHERE event_id = $1
      ORDER BY id 
      LIMIT $2 OFFSET $3
    `;
    const countQuery = `SELECT COUNT(*) FROM public.base_requirement WHERE event_id = $1`;
    
    const [result, countResult] = await Promise.all([
      db.query(query, [eventId, limit, offset]),
      db.query(countQuery, [eventId])
    ]);
    
    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    };
  }

  static async search(eventId, searchQuery, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT id, event_id, name, description, active, created_at, updated_at
      FROM public.base_requirement
      WHERE event_id = $1 AND (name ILIKE $2 OR description ILIKE $2)
      ORDER BY id 
      LIMIT $3 OFFSET $4
    `;
    const countQuery = `
      SELECT COUNT(*) FROM public.base_requirement
      WHERE event_id = $1 AND (name ILIKE $2 OR description ILIKE $2)
    `;
    const searchPattern = `%${searchQuery}%`;
    
    const [result, countResult] = await Promise.all([
      db.query(query, [eventId, searchPattern, limit, offset]),
      db.query(countQuery, [eventId, searchPattern])
    ]);
    
    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    };
  }

  static async findById(eventId, id) {
    const query = `
      SELECT id, event_id, name, description, active, created_at, updated_at
      FROM public.base_requirement
      WHERE event_id = $1 AND id = $2
    `;
    const result = await db.query(query, [eventId, id]);
    return result.rows[0];
  }

  static async update(eventId, id, { name, description }) {
    const query = `
      UPDATE public.base_requirement
      SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
      WHERE event_id = $3 AND id = $4
      RETURNING id, event_id, name, description, active, created_at, updated_at
    `;
    const values = [name, description || '', eventId, id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async partialUpdate(eventId, id, fields) {
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (fields.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(fields.name);
    }
    if (fields.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(fields.description);
    }

    if (updates.length === 0) {
      return null;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(eventId, id);

    const query = `
      UPDATE public.base_requirement
      SET ${updates.join(', ')}
      WHERE event_id = $${paramIndex} AND id = $${paramIndex + 1}
      RETURNING id, event_id, name, description, active, created_at, updated_at
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async updateStatus(eventId, id, active) {
    const query = `
      UPDATE public.base_requirement
      SET active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE event_id = $2 AND id = $3
      RETURNING id, event_id, name, description, active, created_at, updated_at
    `;
    const result = await db.query(query, [active, eventId, id]);
    return result.rows[0];
  }

  static async delete(eventId, id) {
    const query = `DELETE FROM public.base_requirement WHERE event_id = $1 AND id = $2 RETURNING id`;
    const result = await db.query(query, [eventId, id]);
    return result.rows[0];
  }
}

module.exports = BaseRequirementModel;
