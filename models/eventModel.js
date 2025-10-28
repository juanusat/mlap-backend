const db = require('../db');

class EventModel {
  static async create({ name, description }) {
    const query = `
      INSERT INTO public.event (id, name, description, active, created_at, updated_at)
      VALUES (
        (SELECT COALESCE(MAX(id), 0) + 1 FROM public.event),
        $1, $2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING id, name, description, active, created_at, updated_at
    `;
    const values = [name, description || ''];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findAllForSelect() {
    const query = `
      SELECT id, name
      FROM public.event
      WHERE active = true
      ORDER BY id
    `;
    const result = await db.query(query);
    return result.rows;
  }

  static async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT id, name, description, active, created_at, updated_at
      FROM public.event
      ORDER BY id 
      LIMIT $1 OFFSET $2
    `;
    const countQuery = `SELECT COUNT(*) FROM public.event`;
    
    const [result, countResult] = await Promise.all([
      db.query(query, [limit, offset]),
      db.query(countQuery)
    ]);
    
    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    };
  }

  static async search(searchQuery, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT id, name, description, active, created_at, updated_at
      FROM public.event
      WHERE name ILIKE $1 OR description ILIKE $1
      ORDER BY id 
      LIMIT $2 OFFSET $3
    `;
    const countQuery = `
      SELECT COUNT(*) FROM public.event
      WHERE name ILIKE $1 OR description ILIKE $1
    `;
    const searchPattern = `%${searchQuery}%`;
    
    const [result, countResult] = await Promise.all([
      db.query(query, [searchPattern, limit, offset]),
      db.query(countQuery, [searchPattern])
    ]);
    
    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    };
  }

  static async findById(id) {
    const query = `
      SELECT id, name, description, active, created_at, updated_at
      FROM public.event
      WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, { name, description }) {
    const query = `
      UPDATE public.event
      SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, name, description, active, created_at, updated_at
    `;
    const values = [name, description || '', id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async partialUpdate(id, fields) {
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
    values.push(id);

    const query = `
      UPDATE public.event
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, description, active, created_at, updated_at
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async updateStatus(id, active) {
    const query = `
      UPDATE public.event
      SET active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, name, description, active, created_at, updated_at
    `;
    const result = await db.query(query, [active, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = `DELETE FROM public.event WHERE id = $1 RETURNING id`;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = EventModel;
