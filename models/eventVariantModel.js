const db = require('../db');

class EventVariantModel {
  async listEventVariants(parishId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT 
        ev.id,
        ev.name,
        ev.description,
        ev.current_price,
        ev.max_capacity,
        ev.duration_minutes,
        ev.active,
        json_build_object('id', c.id, 'name', c.name) as chapel,
        json_build_object('id', e.id, 'name', e.name) as event_base,
        CASE 
          WHEN ev.max_capacity = 1 THEN 'PRIVATE'
          ELSE 'COMUNITY'
        END as variant_type
      FROM event_variant ev
      INNER JOIN chapel_event ce ON ev.chapel_event_id = ce.id
      INNER JOIN chapel c ON ce.chapel_id = c.id
      INNER JOIN event e ON ce.event_id = e.id
      WHERE c.parish_id = $1
      ORDER BY ev.id DESC
      LIMIT $2 OFFSET $3
    `;
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM event_variant ev
      INNER JOIN chapel_event ce ON ev.chapel_event_id = ce.id
      INNER JOIN chapel c ON ce.chapel_id = c.id
      WHERE c.parish_id = $1
    `;
    
    const [dataResult, countResult] = await Promise.all([
      db.query(query, [parishId, limit, offset]),
      db.query(countQuery, [parishId])
    ]);
    
    return {
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].total)
    };
  }

  async searchEventVariants(parishId, search, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const searchPattern = `%${search}%`;
    
    const query = `
      SELECT 
        ev.id,
        ev.name,
        ev.description,
        ev.current_price,
        ev.max_capacity,
        ev.duration_minutes,
        ev.active,
        json_build_object('id', c.id, 'name', c.name) as chapel,
        json_build_object('id', e.id, 'name', e.name) as event_base,
        CASE 
          WHEN ev.max_capacity = 1 THEN 'PRIVATE'
          ELSE 'COMUNITY'
        END as variant_type
      FROM event_variant ev
      INNER JOIN chapel_event ce ON ev.chapel_event_id = ce.id
      INNER JOIN chapel c ON ce.chapel_id = c.id
      INNER JOIN event e ON ce.event_id = e.id
      WHERE c.parish_id = $1 
        AND (ev.name ILIKE $2 OR ev.description ILIKE $2 OR e.name ILIKE $2 OR c.name ILIKE $2)
      ORDER BY ev.id DESC
      LIMIT $3 OFFSET $4
    `;
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM event_variant ev
      INNER JOIN chapel_event ce ON ev.chapel_event_id = ce.id
      INNER JOIN chapel c ON ce.chapel_id = c.id
      INNER JOIN event e ON ce.event_id = e.id
      WHERE c.parish_id = $1 
        AND (ev.name ILIKE $2 OR ev.description ILIKE $2 OR e.name ILIKE $2 OR c.name ILIKE $2)
    `;
    
    const [dataResult, countResult] = await Promise.all([
      db.query(query, [parishId, searchPattern, limit, offset]),
      db.query(countQuery, [parishId, searchPattern])
    ]);
    
    return {
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].total)
    };
  }

  async getEventVariantById(id, parishId) {
    const query = `
      SELECT 
        ev.id,
        ev.name,
        ev.description,
        ev.current_price,
        ev.max_capacity,
        ev.duration_minutes,
        ev.active,
        ev.chapel_event_id,
        ce.chapel_id,
        ce.event_id,
        CASE 
          WHEN ev.max_capacity = 1 THEN 'PRIVATE'
          ELSE 'COMUNITY'
        END as event_type
      FROM event_variant ev
      INNER JOIN chapel_event ce ON ev.chapel_event_id = ce.id
      INNER JOIN chapel c ON ce.chapel_id = c.id
      WHERE ev.id = $1 AND c.parish_id = $2
    `;
    
    const result = await db.query(query, [id, parishId]);
    return result.rows[0];
  }

  async createEventVariant(parishId, eventId, chapelId, variantData) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      
      // Verificar que la capilla pertenece a la parroquia
      const chapelCheck = await client.query(
        'SELECT id FROM chapel WHERE id = $1 AND parish_id = $2',
        [chapelId, parishId]
      );
      
      if (chapelCheck.rows.length === 0) {
        throw new Error('La capilla no pertenece a esta parroquia');
      }
      
      // Obtener o crear chapel_event
      let chapelEventResult = await client.query(
        'SELECT id FROM chapel_event WHERE chapel_id = $1 AND event_id = $2',
        [chapelId, eventId]
      );
      
      let chapelEventId;
      if (chapelEventResult.rows.length === 0) {
        // Crear chapel_event con ID auto-generado
        const insertChapelEvent = await client.query(
          `INSERT INTO chapel_event (id, chapel_id, event_id, active, created_at, updated_at) 
           VALUES (
             (SELECT COALESCE(MAX(id), 0) + 1 FROM chapel_event),
             $1, $2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
           ) RETURNING id`,
          [chapelId, eventId]
        );
        chapelEventId = insertChapelEvent.rows[0].id;
      } else {
        chapelEventId = chapelEventResult.rows[0].id;
      }
      
      // Crear event_variant
      const maxCapacity = variantData.event_type === 'PRIVATE' ? 1 : variantData.max_capacity;
      
      const insertVariant = await client.query(
        `INSERT INTO event_variant 
          (id, chapel_event_id, name, description, current_price, max_capacity, duration_minutes, active, created_at, updated_at)
         VALUES (
           (SELECT COALESCE(MAX(id), 0) + 1 FROM event_variant),
           $1, $2, $3, $4, $5, $6, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
         )
         RETURNING id`,
        [
          chapelEventId,
          variantData.name,
          variantData.description,
          variantData.current_price || 0,
          maxCapacity,
          variantData.duration_minutes || 60
        ]
      );
      
      await client.query('COMMIT');
      return insertVariant.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateEventVariant(id, parishId, eventId, chapelId, variantData) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      
      // Verificar que la variante pertenece a la parroquia
      const variantCheck = await client.query(
        `SELECT ev.id FROM event_variant ev
         INNER JOIN chapel_event ce ON ev.chapel_event_id = ce.id
         INNER JOIN chapel c ON ce.chapel_id = c.id
         WHERE ev.id = $1 AND c.parish_id = $2`,
        [id, parishId]
      );
      
      if (variantCheck.rows.length === 0) {
        throw new Error('Variante no encontrada o no pertenece a esta parroquia');
      }
      
      // Verificar que la capilla pertenece a la parroquia
      const chapelCheck = await client.query(
        'SELECT id FROM chapel WHERE id = $1 AND parish_id = $2',
        [chapelId, parishId]
      );
      
      if (chapelCheck.rows.length === 0) {
        throw new Error('La capilla no pertenece a esta parroquia');
      }
      
      // Obtener o crear chapel_event
      let chapelEventResult = await client.query(
        'SELECT id FROM chapel_event WHERE chapel_id = $1 AND event_id = $2',
        [chapelId, eventId]
      );
      
      let chapelEventId;
      if (chapelEventResult.rows.length === 0) {
        // Crear chapel_event con ID auto-generado
        const insertChapelEvent = await client.query(
          `INSERT INTO chapel_event (id, chapel_id, event_id, active, created_at, updated_at) 
           VALUES (
             (SELECT COALESCE(MAX(id), 0) + 1 FROM chapel_event),
             $1, $2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
           ) RETURNING id`,
          [chapelId, eventId]
        );
        chapelEventId = insertChapelEvent.rows[0].id;
      } else {
        chapelEventId = chapelEventResult.rows[0].id;
      }
      
      // Actualizar event_variant
      const maxCapacity = variantData.event_type === 'PRIVATE' ? 1 : variantData.max_capacity;
      
      await client.query(
        `UPDATE event_variant 
         SET chapel_event_id = $1,
             name = $2,
             description = $3,
             current_price = $4,
             max_capacity = $5,
             duration_minutes = $6,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $7`,
        [
          chapelEventId,
          variantData.name,
          variantData.description,
          variantData.current_price || 0,
          maxCapacity,
          variantData.duration_minutes || 60,
          id
        ]
      );
      
      await client.query('COMMIT');
      return { id };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async partialUpdateEventVariant(id, parishId, updates) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      
      // Verificar que la variante pertenece a la parroquia
      const variantCheck = await client.query(
        `SELECT ev.id FROM event_variant ev
         INNER JOIN chapel_event ce ON ev.chapel_event_id = ce.id
         INNER JOIN chapel c ON ce.chapel_id = c.id
         WHERE ev.id = $1 AND c.parish_id = $2`,
        [id, parishId]
      );
      
      if (variantCheck.rows.length === 0) {
        throw new Error('Variante no encontrada o no pertenece a esta parroquia');
      }
      
      const fields = [];
      const values = [];
      let paramCount = 1;
      
      if (updates.active !== undefined) {
        fields.push(`active = $${paramCount}`);
        values.push(updates.active);
        paramCount++;
      }
      
      if (fields.length === 0) {
        throw new Error('No hay campos para actualizar');
      }
      
      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);
      
      const query = `UPDATE event_variant SET ${fields.join(', ')} WHERE id = $${paramCount}`;
      await client.query(query, values);
      
      await client.query('COMMIT');
      return { id };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteEventVariant(id, parishId) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      
      // Verificar que la variante pertenece a la parroquia
      const variantCheck = await client.query(
        `SELECT ev.id FROM event_variant ev
         INNER JOIN chapel_event ce ON ev.chapel_event_id = ce.id
         INNER JOIN chapel c ON ce.chapel_id = c.id
         WHERE ev.id = $1 AND c.parish_id = $2`,
        [id, parishId]
      );
      
      if (variantCheck.rows.length === 0) {
        throw new Error('Variante no encontrada o no pertenece a esta parroquia');
      }
      
      await client.query('DELETE FROM event_variant WHERE id = $1', [id]);
      
      await client.query('COMMIT');
      return { id };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async listEventsBase() {
    const query = `
      SELECT id, name, description
      FROM public.event
      WHERE active = true
      ORDER BY name
    `;
    const result = await db.query(query);
    return result.rows;
  }
}

module.exports = new EventVariantModel();
