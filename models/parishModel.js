const db = require('../db');

class ParishModel {
  static async create({ name, email, username, passwordHash }) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const personQuery = `
        INSERT INTO public.person (id, first_names, paternal_surname, maternal_surname, email, document, document_type_id)
        VALUES (
          (SELECT COALESCE(MAX(id), 0) + 1 FROM public.person),
          $1, $2, $3, $4, $5, 1
        )
        RETURNING id
      `;
      const personResult = await client.query(personQuery, ['Admin', 'Parish', '', email, '00000000']);
      const personId = personResult.rows[0].id;

      const userQuery = `
        INSERT INTO public.user (id, person_id, username, password_hash, is_diocese, active)
        VALUES (
          (SELECT COALESCE(MAX(id), 0) + 1 FROM public.user),
          $1, $2, $3, false, true
        )
        RETURNING id
      `;
      const userResult = await client.query(userQuery, [personId, username, passwordHash]);
      const userId = userResult.rows[0].id;

      const parishQuery = `
        INSERT INTO public.parish (id, name, admin_user_id, active, created_at, updated_at)
        VALUES (
          (SELECT COALESCE(MAX(id), 0) + 1 FROM public.parish),
          $1, $2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        RETURNING id, name, primary_color, secondary_color, admin_user_id, active, created_at, updated_at
      `;
      const parishResult = await client.query(parishQuery, [name, userId]);

      await client.query('COMMIT');
      return parishResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT 
        p.id, 
        p.name, 
        p.active,
        pe.email,
        u.username,
        p.created_at, 
        p.updated_at
      FROM public.parish p
      INNER JOIN public.user u ON p.admin_user_id = u.id
      INNER JOIN public.person pe ON u.person_id = pe.id
      ORDER BY p.id 
      LIMIT $1 OFFSET $2
    `;
    const countQuery = `SELECT COUNT(*) FROM public.parish`;
    
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
      SELECT 
        p.id, 
        p.name, 
        p.active,
        pe.email,
        u.username,
        p.created_at, 
        p.updated_at
      FROM public.parish p
      INNER JOIN public.user u ON p.admin_user_id = u.id
      INNER JOIN public.person pe ON u.person_id = pe.id
      WHERE p.name ILIKE $1 OR pe.email ILIKE $1
      ORDER BY p.id 
      LIMIT $2 OFFSET $3
    `;
    const countQuery = `
      SELECT COUNT(*) 
      FROM public.parish p
      INNER JOIN public.user u ON p.admin_user_id = u.id
      INNER JOIN public.person pe ON u.person_id = pe.id
      WHERE p.name ILIKE $1 OR pe.email ILIKE $1
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
      SELECT 
        p.id, 
        p.name, 
        p.active,
        p.primary_color,
        p.secondary_color,
        pe.email,
        u.username,
        p.created_at, 
        p.updated_at
      FROM public.parish p
      INNER JOIN public.user u ON p.admin_user_id = u.id
      INNER JOIN public.person pe ON u.person_id = pe.id
      WHERE p.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, { name, email, username }) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const getAdminQuery = `
        SELECT admin_user_id FROM public.parish WHERE id = $1
      `;
      const adminResult = await client.query(getAdminQuery, [id]);
      const adminUserId = adminResult.rows[0].admin_user_id;

      const getPersonQuery = `
        SELECT person_id FROM public.user WHERE id = $1
      `;
      const personResult = await client.query(getPersonQuery, [adminUserId]);
      const personId = personResult.rows[0].person_id;

      await client.query(
        `UPDATE public.person SET email = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [email, personId]
      );

      await client.query(
        `UPDATE public.user SET username = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [username, adminUserId]
      );

      const parishQuery = `
        UPDATE public.parish
        SET name = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, name, primary_color, secondary_color, admin_user_id, active, created_at, updated_at
      `;
      const parishResult = await client.query(parishQuery, [name, id]);

      await client.query('COMMIT');
      return parishResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async partialUpdate(id, fields) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const getAdminQuery = `
        SELECT admin_user_id FROM public.parish WHERE id = $1
      `;
      const adminResult = await client.query(getAdminQuery, [id]);
      const adminUserId = adminResult.rows[0].admin_user_id;

      const getPersonQuery = `
        SELECT person_id FROM public.user WHERE id = $1
      `;
      const personResult = await client.query(getPersonQuery, [adminUserId]);
      const personId = personResult.rows[0].person_id;

      if (fields.email !== undefined) {
        await client.query(
          `UPDATE public.person SET email = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
          [fields.email, personId]
        );
      }

      if (fields.username !== undefined) {
        await client.query(
          `UPDATE public.user SET username = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
          [fields.username, adminUserId]
        );
      }

      if (fields.name !== undefined) {
        await client.query(
          `UPDATE public.parish SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
          [fields.name, id]
        );
      }

      const parishQuery = `
        SELECT 
          p.id, 
          p.name, 
          p.primary_color,
          p.secondary_color,
          p.admin_user_id, 
          p.active, 
          p.created_at, 
          p.updated_at
        FROM public.parish p
        WHERE p.id = $1
      `;
      const parishResult = await client.query(parishQuery, [id]);

      await client.query('COMMIT');
      return parishResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async updateStatus(id, active) {
    const query = `
      UPDATE public.parish
      SET active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, name, primary_color, secondary_color, admin_user_id, active, created_at, updated_at
    `;
    const result = await db.query(query, [active, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = `DELETE FROM public.parish WHERE id = $1 RETURNING id`;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async findChapelsByParishId(parishId) {
    const query = `
      SELECT id, name, address 
      FROM public.chapel 
      WHERE parish_id = $1 AND active = TRUE;
    `;
    const { rows } = await db.query(query, [parishId]);
    return rows;
  }

  static async findRolesByParishId(parishId) {
    const query = `
      SELECT id, name, description, active
      FROM public.role
      WHERE parish_id = $1 AND active = TRUE
      ORDER BY name ASC;
    `;
    const { rows } = await db.query(query, [parishId]);
    return rows;
  }
}

module.exports = ParishModel;