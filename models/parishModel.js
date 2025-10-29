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
      const parishId = parishResult.rows[0].id;

      const chapelQuery = `
        INSERT INTO public.chapel (id, parish_id, name, coordinates, address, email, phone, chapel_base, active, created_at, updated_at)
        VALUES (
          (SELECT COALESCE(MAX(id), 0) + 1 FROM public.chapel),
          $1, $2, '', '', '', '', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        RETURNING id
      `;
      await client.query(chapelQuery, [parishId, name]);

      const associationQuery = `
        INSERT INTO public.association (id, user_id, parish_id, start_date, active)
        VALUES (
          (SELECT COALESCE(MAX(id), 0) + 1 FROM public.association),
          $1, $2, CURRENT_DATE, true
        )
        RETURNING id
      `;
      await client.query(associationQuery, [userId, parishId]);

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
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const chapelCountQuery = `
        SELECT COUNT(*) as count FROM public.chapel WHERE parish_id = $1
      `;
      const chapelCountResult = await client.query(chapelCountQuery, [id]);
      const chapelCount = parseInt(chapelCountResult.rows[0].count);

      if (chapelCount !== 1) {
        throw new Error('La parroquia debe tener exactamente una capilla base para ser eliminada');
      }

      const chapelIdQuery = `
        SELECT id FROM public.chapel WHERE parish_id = $1 LIMIT 1
      `;
      const chapelIdResult = await client.query(chapelIdQuery, [id]);
      const chapelId = chapelIdResult.rows[0].id;

      const chapelEventQuery = `
        SELECT COUNT(*) as count FROM public.chapel_event WHERE chapel_id = $1
      `;
      const chapelEventResult = await client.query(chapelEventQuery, [chapelId]);
      const eventCount = parseInt(chapelEventResult.rows[0].count);

      if (eventCount > 0) {
        throw new Error('No se puede eliminar la parroquia porque la capilla tiene eventos asociados');
      }

      const reservationQuery = `
        SELECT COUNT(*) as count 
        FROM public.reservation r
        INNER JOIN public.event_variant ev ON r.event_variant_id = ev.id
        INNER JOIN public.chapel_event ce ON ev.chapel_event_id = ce.id
        WHERE ce.chapel_id = $1
      `;
      const reservationResult = await client.query(reservationQuery, [chapelId]);
      const reservationCount = parseInt(reservationResult.rows[0].count);

      if (reservationCount > 0) {
        throw new Error('No se puede eliminar la parroquia porque la capilla tiene reservas asociadas');
      }

      const adminUserQuery = `
        SELECT admin_user_id FROM public.parish WHERE id = $1
      `;
      const adminUserResult = await client.query(adminUserQuery, [id]);
      const adminUserId = adminUserResult.rows[0].admin_user_id;

      const personIdQuery = `
        SELECT person_id FROM public.user WHERE id = $1
      `;
      const personIdResult = await client.query(personIdQuery, [adminUserId]);
      const personId = personIdResult.rows[0].person_id;

      await client.query(`DELETE FROM public.association WHERE chapel_id = $1`, [chapelId]);

      await client.query(`DELETE FROM public.chapel WHERE id = $1`, [chapelId]);

      await client.query(`DELETE FROM public.parish WHERE id = $1`, [id]);

      await client.query(`DELETE FROM public.user WHERE id = $1`, [adminUserId]);

      await client.query(`DELETE FROM public.person WHERE id = $1`, [personId]);

      await client.query('COMMIT');
      return { id };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
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

  static async getParishAccountInfo(parishId) {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.primary_color,
        p.secondary_color,
        c.address,
        c.coordinates,
        c.phone,
        c.profile_photo,
        c.cover_photo
      FROM public.parish p
      LEFT JOIN public.chapel c ON c.parish_id = p.id AND c.chapel_base = true
      WHERE p.id = $1
    `;
    const result = await db.query(query, [parishId]);
    return result.rows[0];
  }

  static async getParishCredentials(parishId) {
    const query = `
      SELECT 
        u.id as user_id,
        u.username,
        pe.email
      FROM public.parish p
      INNER JOIN public.user u ON p.admin_user_id = u.id
      INNER JOIN public.person pe ON u.person_id = pe.id
      WHERE p.id = $1
    `;
    const result = await db.query(query, [parishId]);
    return result.rows[0];
  }

  static async updateParishAccountInfo(parishId, data) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const parishFields = [];
      const parishValues = [];
      let parishIndex = 1;

      if (data.name !== undefined) {
        parishFields.push(`name = $${parishIndex++}`);
        parishValues.push(data.name);
      }
      if (data.primary_color !== undefined) {
        parishFields.push(`primary_color = $${parishIndex++}`);
        parishValues.push(data.primary_color);
      }
      if (data.secondary_color !== undefined) {
        parishFields.push(`secondary_color = $${parishIndex++}`);
        parishValues.push(data.secondary_color);
      }

      if (parishFields.length > 0) {
        parishValues.push(parishId);
        const parishQuery = `
          UPDATE public.parish
          SET ${parishFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
          WHERE id = $${parishIndex}
        `;
        await client.query(parishQuery, parishValues);
      }

      const chapelFields = [];
      const chapelValues = [];
      let chapelIndex = 1;

      if (data.address !== undefined) {
        chapelFields.push(`address = $${chapelIndex++}`);
        chapelValues.push(data.address);
      }
      if (data.coordinates !== undefined) {
        chapelFields.push(`coordinates = $${chapelIndex++}`);
        chapelValues.push(data.coordinates);
      }
      if (data.phone !== undefined) {
        chapelFields.push(`phone = $${chapelIndex++}`);
        chapelValues.push(data.phone);
      }
      if (data.profile_photo !== undefined) {
        chapelFields.push(`profile_photo = $${chapelIndex++}`);
        chapelValues.push(data.profile_photo);
      }
      if (data.cover_photo !== undefined) {
        chapelFields.push(`cover_photo = $${chapelIndex++}`);
        chapelValues.push(data.cover_photo);
      }

      if (chapelFields.length > 0) {
        chapelValues.push(parishId);
        const chapelQuery = `
          UPDATE public.chapel
          SET ${chapelFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
          WHERE parish_id = $${chapelIndex} AND chapel_base = true
        `;
        await client.query(chapelQuery, chapelValues);
      }

      await client.query('COMMIT');
      return await this.getParishAccountInfo(parishId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async updateParishCredentials(parishId, data, currentPassword) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const adminQuery = `
        SELECT u.id as user_id, u.password_hash, u.person_id
        FROM public.parish p
        INNER JOIN public.user u ON p.admin_user_id = u.id
        WHERE p.id = $1
      `;
      const adminResult = await client.query(adminQuery, [parishId]);
      const admin = adminResult.rows[0];

      const crypto = require('crypto');
      const currentPasswordHash = crypto.createHash('sha256').update(currentPassword).digest('hex');

      if (currentPasswordHash !== admin.password_hash) {
        throw new Error('Contraseña actual incorrecta');
      }

      if (data.email !== undefined) {
        await client.query(
          `UPDATE public.person SET email = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
          [data.email, admin.person_id]
        );
      }

      if (data.username !== undefined) {
        await client.query(
          `UPDATE public.user SET username = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
          [data.username, admin.user_id]
        );
      }

      if (data.new_password !== undefined) {
        const newPasswordHash = crypto.createHash('sha256').update(data.new_password).digest('hex');
        await client.query(
          `UPDATE public.user SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
          [newPasswordHash, admin.user_id]
        );
      }

      await client.query('COMMIT');
      return await this.getParishCredentials(parishId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = ParishModel;