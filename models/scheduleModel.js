const db = require('../db');

class ScheduleModel {
  // ====================================================================
  // HORARIOS GENERALES (GENERAL_SCHEDULE)
  // ====================================================================

  static async listGeneralSchedules(chapelId) {
    const query = `
      SELECT 
        id,
        chapel_id,
        day_of_week,
        start_time,
        end_time,
        active
      FROM public.general_schedule
      WHERE chapel_id = $1 AND active = TRUE
      ORDER BY day_of_week, start_time
    `;
    const result = await db.query(query, [chapelId]);
    return result.rows;
  }

  static async bulkUpdateGeneralSchedules(chapelId, schedules) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Eliminar todos los horarios generales existentes de esta capilla
      await client.query(
        'DELETE FROM public.general_schedule WHERE chapel_id = $1',
        [chapelId]
      );

      // Insertar los nuevos horarios
      if (schedules && schedules.length > 0) {
        for (const schedule of schedules) {
          const insertQuery = `
            INSERT INTO public.general_schedule (
              id, chapel_id, day_of_week, start_time, end_time, active, created_at, updated_at
            )
            VALUES (
              (SELECT COALESCE(MAX(id), 0) + 1 FROM public.general_schedule),
              $1, $2, $3, $4, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
          `;
          await client.query(insertQuery, [
            chapelId,
            schedule.day_of_week,
            schedule.start_time,
            schedule.end_time
          ]);
        }
      }

      await client.query('COMMIT');
      return { success: true };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ====================================================================
  // HORARIOS ESPECÍFICOS (SPECIFIC_SCHEDULE) - EXCEPCIONES
  // ====================================================================

  static async listSpecificSchedules(chapelId, page = 1, limit = 4, filters = {}) {
    const offset = (page - 1) * limit;
    let whereConditions = ['chapel_id = $1'];
    const params = [chapelId];
    let paramIndex = 2;

    // Filtro por tipo de excepción
    if (filters.exception_type) {
      whereConditions.push(`exception_type = $${paramIndex}`);
      params.push(filters.exception_type);
      paramIndex++;
    }

    // Filtro por rango de fechas
    if (filters.date_range) {
      if (filters.date_range.start) {
        whereConditions.push(`date >= $${paramIndex}`);
        params.push(filters.date_range.start);
        paramIndex++;
      }
      if (filters.date_range.end) {
        whereConditions.push(`date <= $${paramIndex}`);
        params.push(filters.date_range.end);
        paramIndex++;
      }
    }

    const whereClause = whereConditions.join(' AND ');

    const query = `
      SELECT 
        id,
        chapel_id,
        date,
        start_time,
        end_time,
        exception_type,
        reason,
        active
      FROM public.specific_schedule
      WHERE ${whereClause}
      ORDER BY date DESC, start_time
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM public.specific_schedule
      WHERE ${whereClause}
    `;

    params.push(limit, offset);

    const [dataResult, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, params.slice(0, -2))
    ]);

    return {
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].total),
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].total / limit)
    };
  }

  static async createSpecificSchedule(chapelId, data) {
    const query = `
      INSERT INTO public.specific_schedule (
        id, chapel_id, date, start_time, end_time, exception_type, reason, active, created_at, updated_at
      )
      VALUES (
        (SELECT COALESCE(MAX(id), 0) + 1 FROM public.specific_schedule),
        $1, $2, $3, $4, $5, $6, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING id, chapel_id, date, start_time, end_time, exception_type, reason, active
    `;

    const result = await db.query(query, [
      chapelId,
      data.date,
      data.start_time,
      data.end_time,
      data.exception_type,
      data.reason || ''
    ]);

    return result.rows[0];
  }

  static async updateSpecificSchedule(scheduleId, chapelId, data) {
    const query = `
      UPDATE public.specific_schedule
      SET 
        date = $1,
        start_time = $2,
        end_time = $3,
        exception_type = $4,
        reason = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6 AND chapel_id = $7
      RETURNING id, chapel_id, date, start_time, end_time, exception_type, reason, active
    `;

    const result = await db.query(query, [
      data.date,
      data.start_time,
      data.end_time,
      data.exception_type,
      data.reason || '',
      scheduleId,
      chapelId
    ]);

    if (result.rows.length === 0) {
      throw new Error('Excepción de horario no encontrada');
    }

    return result.rows[0];
  }

  static async deleteSpecificSchedule(scheduleId, chapelId) {
    const query = `
      DELETE FROM public.specific_schedule
      WHERE id = $1 AND chapel_id = $2
      RETURNING id
    `;

    const result = await db.query(query, [scheduleId, chapelId]);

    if (result.rows.length === 0) {
      throw new Error('Excepción de horario no encontrada');
    }

    return result.rows[0];
  }
}

module.exports = ScheduleModel;
