const db = require('../db');

class ChapelEventRequirementModel {
  // Obtener requisitos base + adicionales para un event_variant
  async getRequirementsByEventVariant(eventVariantId, parishId) {
    const query = `
      SELECT 
        br.id,
        br.name,
        br.description,
        br.active,
        'BASE' as requirement_type,
        false as is_editable
      FROM event_variant ev
      INNER JOIN chapel_event ce ON ev.chapel_event_id = ce.id
      INNER JOIN chapel c ON ce.chapel_id = c.id
      INNER JOIN base_requirement br ON ce.event_id = br.event_id
      WHERE ev.id = $1 AND c.parish_id = $2 AND br.active = true
      
      UNION ALL
      
      SELECT 
        cer.id,
        cer.name,
        cer.description,
        cer.active,
        'ADDITIONAL' as requirement_type,
        true as is_editable
      FROM event_variant ev
      INNER JOIN chapel_event ce ON ev.chapel_event_id = ce.id
      INNER JOIN chapel c ON ce.chapel_id = c.id
      INNER JOIN chapel_event_requirement cer ON ce.id = cer.chapel_event_id
      WHERE ev.id = $1 AND c.parish_id = $2
      
      ORDER BY requirement_type, name
    `;
    
    const result = await db.query(query, [eventVariantId, parishId]);
    return result.rows;
  }

  // Crear requisito adicional
  async createChapelEventRequirement(chapelEventId, parishId, data) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      
      // Verificar que chapel_event pertenece a la parroquia
      const checkQuery = `
        SELECT ce.id 
        FROM chapel_event ce
        INNER JOIN chapel c ON ce.chapel_id = c.id
        WHERE ce.id = $1 AND c.parish_id = $2
      `;
      const checkResult = await client.query(checkQuery, [chapelEventId, parishId]);
      
      if (checkResult.rows.length === 0) {
        throw new Error('Chapel event no encontrado o no pertenece a esta parroquia');
      }
      
      const insertQuery = `
        INSERT INTO chapel_event_requirement (id, chapel_event_id, name, description, active, created_at, updated_at)
        VALUES (
          (SELECT COALESCE(MAX(id), 0) + 1 FROM chapel_event_requirement),
          $1, $2, $3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        RETURNING id, name, description, active
      `;
      
      const result = await client.query(insertQuery, [
        chapelEventId,
        data.name,
        data.description
      ]);
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Obtener requisito adicional por ID
  async getChapelEventRequirementById(id, parishId) {
    const query = `
      SELECT cer.id, cer.chapel_event_id, cer.name, cer.description, cer.active
      FROM chapel_event_requirement cer
      INNER JOIN chapel_event ce ON cer.chapel_event_id = ce.id
      INNER JOIN chapel c ON ce.chapel_id = c.id
      WHERE cer.id = $1 AND c.parish_id = $2
    `;
    
    const result = await db.query(query, [id, parishId]);
    return result.rows[0];
  }

  // Actualizar requisito adicional
  async updateChapelEventRequirement(id, parishId, data) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      
      // Verificar que pertenece a la parroquia
      const checkQuery = `
        SELECT cer.id 
        FROM chapel_event_requirement cer
        INNER JOIN chapel_event ce ON cer.chapel_event_id = ce.id
        INNER JOIN chapel c ON ce.chapel_id = c.id
        WHERE cer.id = $1 AND c.parish_id = $2
      `;
      const checkResult = await client.query(checkQuery, [id, parishId]);
      
      if (checkResult.rows.length === 0) {
        throw new Error('Requisito no encontrado o no pertenece a esta parroquia');
      }
      
      const updateQuery = `
        UPDATE chapel_event_requirement
        SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING id
      `;
      
      await client.query(updateQuery, [data.name, data.description, id]);
      
      await client.query('COMMIT');
      return { id };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Actualizar estado (activo/inactivo)
  async updateChapelEventRequirementStatus(id, parishId, active) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      
      const checkQuery = `
        SELECT cer.id 
        FROM chapel_event_requirement cer
        INNER JOIN chapel_event ce ON cer.chapel_event_id = ce.id
        INNER JOIN chapel c ON ce.chapel_id = c.id
        WHERE cer.id = $1 AND c.parish_id = $2
      `;
      const checkResult = await client.query(checkQuery, [id, parishId]);
      
      if (checkResult.rows.length === 0) {
        throw new Error('Requisito no encontrado o no pertenece a esta parroquia');
      }
      
      const updateQuery = `
        UPDATE chapel_event_requirement
        SET active = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id
      `;
      
      await client.query(updateQuery, [active, id]);
      
      await client.query('COMMIT');
      return { id };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Eliminar requisito adicional
  async deleteChapelEventRequirement(id, parishId) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      
      const checkQuery = `
        SELECT cer.id 
        FROM chapel_event_requirement cer
        INNER JOIN chapel_event ce ON cer.chapel_event_id = ce.id
        INNER JOIN chapel c ON ce.chapel_id = c.id
        WHERE cer.id = $1 AND c.parish_id = $2
      `;
      const checkResult = await client.query(checkQuery, [id, parishId]);
      
      if (checkResult.rows.length === 0) {
        throw new Error('Requisito no encontrado o no pertenece a esta parroquia');
      }
      
      await client.query('DELETE FROM chapel_event_requirement WHERE id = $1', [id]);
      
      await client.query('COMMIT');
      return { id };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new ChapelEventRequirementModel();
