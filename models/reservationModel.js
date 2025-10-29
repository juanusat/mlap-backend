const db = require('../db');

class ReservationModel {
  /**
   * Obtener información del formulario de reserva
   * @param {number} eventVariantId - ID de la variante del evento
   * @returns {Object} Información de capilla/parroquia y evento
   */
  static async getFormInfo(eventVariantId) {
    const query = `
      SELECT 
        ev.id as event_variant_id,
        ev.name as event_name,
        ev.description as event_description,
        ev.current_price,
        c.id as chapel_id,
        c.name as chapel_name,
        p.name as parish_name,
        p.primary_color,
        p.secondary_color
      FROM public.event_variant ev
      INNER JOIN public.chapel_event ce ON ev.chapel_event_id = ce.id
      INNER JOIN public.chapel c ON ce.chapel_id = c.id
      INNER JOIN public.parish p ON c.parish_id = p.id
      WHERE ev.id = $1 AND ev.active = true AND ce.active = true AND c.active = true
    `;
    const result = await db.query(query, [eventVariantId]);
    return result.rows[0];
  }

  /**
   * Verificar disponibilidad de un horario específico
   * @param {number} eventVariantId - ID de la variante del evento
   * @param {string} eventDate - Fecha del evento (YYYY-MM-DD)
   * @param {string} eventTime - Hora del evento (HH:MM)
   * @returns {Object} Información de disponibilidad
   */
  static async checkAvailability(eventVariantId, eventDate, eventTime) {
    const query = `
      WITH event_info AS (
        SELECT ev.id, ce.chapel_id, ev.duration_minutes
        FROM public.event_variant ev
        INNER JOIN public.chapel_event ce ON ev.chapel_event_id = ce.id
        WHERE ev.id = $1 AND ev.active = true
      ),
      day_info AS (
        SELECT EXTRACT(DOW FROM $2::date) as day_of_week
      ),
      general_availability AS (
        SELECT gs.id
        FROM public.general_schedule gs
        INNER JOIN event_info ei ON gs.chapel_id = ei.chapel_id
        INNER JOIN day_info di ON gs.day_of_week = di.day_of_week
        WHERE $3::time >= gs.start_time 
          AND ($3::time + (ei.duration_minutes || ' minutes')::interval)::time <= gs.end_time
      ),
      specific_exception AS (
        SELECT ss.exception_type, ss.start_time, ss.end_time
        FROM public.specific_schedule ss
        INNER JOIN event_info ei ON ss.chapel_id = ei.chapel_id
        WHERE ss.date = $2::date
      ),
      existing_reservation AS (
        SELECT r.id
        FROM public.reservation r
        INNER JOIN event_info ei ON r.event_variant_id = ei.id
        WHERE r.event_date = $2::date
          AND r.event_time = $3::time
          AND r.status NOT IN ('CANCELLED', 'REJECTED')
      )
      SELECT 
        CASE 
          WHEN EXISTS (SELECT 1 FROM existing_reservation) THEN false
          WHEN EXISTS (SELECT 1 FROM specific_exception WHERE exception_type = 'CLOSED') THEN false
          WHEN EXISTS (SELECT 1 FROM specific_exception WHERE exception_type = 'OPEN') THEN
            EXISTS (
              SELECT 1 FROM specific_exception se
              INNER JOIN event_info ei ON true
              WHERE $3::time >= se.start_time 
                AND ($3::time + (ei.duration_minutes || ' minutes')::interval)::time <= se.end_time
            )
          WHEN EXISTS (SELECT 1 FROM general_availability) THEN true
          ELSE false
        END as available,
        CASE
          WHEN EXISTS (SELECT 1 FROM existing_reservation) THEN 'Ya existe una reserva para este horario'
          WHEN EXISTS (SELECT 1 FROM specific_exception WHERE exception_type = 'CLOSED') THEN 'La capilla está cerrada en esta fecha'
          WHEN NOT EXISTS (SELECT 1 FROM general_availability) 
            AND NOT EXISTS (SELECT 1 FROM specific_exception WHERE exception_type = 'OPEN') 
          THEN 'Horario fuera del rango de atención de la capilla'
          ELSE NULL
        END as reason
    `;
    
    const result = await db.query(query, [eventVariantId, eventDate, eventTime]);
    return result.rows[0];
  }

  /**
   * Crear una nueva reserva
   * @param {number} userId - ID del usuario que reserva
   * @param {number} eventVariantId - ID de la variante del evento
   * @param {string} eventDate - Fecha del evento (YYYY-MM-DD)
   * @param {string} eventTime - Hora del evento (HH:MM)
   * @returns {Object} Reserva creada
   */
  static async create(userId, eventVariantId, eventDate, eventTime) {
    // Primero obtenemos el person_id del usuario
    const userQuery = `SELECT person_id FROM public.user WHERE id = $1`;
    const userResult = await db.query(userQuery, [userId]);
    
    if (!userResult.rows.length) {
      throw new Error('Usuario no encontrado');
    }
    
    const personId = userResult.rows[0].person_id;
    
    const query = `
      INSERT INTO public.reservation (
        id, user_id, person_id, event_variant_id, event_date, event_time, 
        status, registration_date, created_at, updated_at
      )
      VALUES (
        (SELECT COALESCE(MAX(id), 0) + 1 FROM public.reservation),
        $1, $2, $3, $4, $5, 'RESERVED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING id, user_id, person_id, event_variant_id, event_date, event_time, status, created_at
    `;
    const values = [userId, personId, eventVariantId, eventDate, eventTime];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Obtener información completa de una reserva
   * @param {number} reservationId - ID de la reserva
   * @returns {Object} Información de la reserva
   */
  static async findById(reservationId) {
    const query = `
      SELECT 
        r.id as reservation_id,
        r.status,
        r.event_date,
        r.event_time,
        ev.name as event_name,
        ev.description as event_description,
        c.name as chapel_name,
        p.name as parish_name,
        pe.first_names,
        pe.paternal_surname,
        pe.maternal_surname
      FROM public.reservation r
      INNER JOIN public.event_variant ev ON r.event_variant_id = ev.id
      INNER JOIN public.chapel_event ce ON ev.chapel_event_id = ce.id
      INNER JOIN public.chapel c ON ce.chapel_id = c.id
      INNER JOIN public.parish p ON c.parish_id = p.id
      INNER JOIN public.user u ON r.user_id = u.id
      INNER JOIN public.person pe ON u.person_id = pe.id
      WHERE r.id = $1
    `;
    const result = await db.query(query, [reservationId]);
    return result.rows[0];
  }

  /**
   * Obtener horarios disponibles para un evento en un rango de fechas
   * @param {number} eventVariantId - ID de la variante del evento
   * @param {string} startDate - Fecha de inicio (YYYY-MM-DD)
   * @param {string} endDate - Fecha de fin (YYYY-MM-DD)
   * @returns {Array} Lista de fechas y horarios disponibles
   */
  static async getAvailableSlots(eventVariantId, startDate, endDate) {
    const query = `
      WITH RECURSIVE 
      event_info AS (
        SELECT ev.id, ce.chapel_id, ev.duration_minutes
        FROM public.event_variant ev
        INNER JOIN public.chapel_event ce ON ev.chapel_event_id = ce.id
        WHERE ev.id = $1 AND ev.active = true
      ),
      date_range AS (
        SELECT $2::date as date
        UNION ALL
        SELECT date + 1
        FROM date_range
        WHERE date < $3::date
      ),
      time_slots AS (
        SELECT generate_series(
          '06:00'::time,
          '21:00'::time,
          '1 hour'::interval
        )::time as time_slot
      ),
      all_slots AS (
        SELECT 
          dr.date,
          ts.time_slot,
          EXTRACT(DOW FROM dr.date) as day_of_week
        FROM date_range dr
        CROSS JOIN time_slots ts
      ),
      general_slots AS (
        SELECT als.date, als.time_slot
        FROM all_slots als
        INNER JOIN event_info ei ON true
        INNER JOIN public.general_schedule gs 
          ON gs.chapel_id = ei.chapel_id 
          AND gs.day_of_week = als.day_of_week
        WHERE als.time_slot >= gs.start_time 
          AND (als.time_slot + (ei.duration_minutes || ' minutes')::interval)::time <= gs.end_time
      ),
      slots_with_exceptions AS (
        SELECT 
          gs.date,
          gs.time_slot,
          COALESCE(ss.exception_type, 'NORMAL') as exception_type,
          ss.start_time as exception_start,
          ss.end_time as exception_end
        FROM general_slots gs
        LEFT JOIN public.specific_schedule ss 
          ON ss.chapel_id = (SELECT chapel_id FROM event_info)
          AND ss.date = gs.date
      ),
      valid_slots AS (
        SELECT swe.date, swe.time_slot
        FROM slots_with_exceptions swe
        INNER JOIN event_info ei ON true
        WHERE 
          (swe.exception_type = 'NORMAL') OR
          (swe.exception_type = 'OPEN' 
            AND swe.time_slot >= swe.exception_start 
            AND (swe.time_slot + (ei.duration_minutes || ' minutes')::interval)::time <= swe.exception_end)
      ),
      available_slots AS (
        SELECT vs.date, vs.time_slot
        FROM valid_slots vs
        WHERE NOT EXISTS (
          SELECT 1 
          FROM public.reservation r
          WHERE r.event_variant_id = $1
            AND r.event_date = vs.date
            AND r.event_time = vs.time_slot
            AND r.status NOT IN ('CANCELLED', 'REJECTED')
        )
      )
      SELECT 
        date,
        time_slot::text as time,
        TO_CHAR(time_slot, 'HH12:MI AM') as time_display
      FROM available_slots
      ORDER BY date, time_slot
    `;
    
    const result = await db.query(query, [eventVariantId, startDate, endDate]);
    return result.rows;
  }
}

module.exports = ReservationModel;
