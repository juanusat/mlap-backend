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
    
    const personQuery2 = `SELECT first_names, paternal_surname, maternal_surname FROM public.person WHERE id = $1`;
    const personRes = await db.query(personQuery2, [personId]);
    const personRow = personRes.rows[0] || {};
    const beneficiaryFullName = `${personRow.first_names || ''} ${personRow.paternal_surname || ''}${personRow.maternal_surname ? ' ' + personRow.maternal_surname : ''}`.trim();

    const query = `
      INSERT INTO public.reservation (
        id, user_id, person_id, event_variant_id, event_date, event_time, 
        status, registration_date, created_at, updated_at, beneficiary_full_name
      )
      VALUES (
        (SELECT COALESCE(MAX(id), 0) + 1 FROM public.reservation),
        $1, $2, $3, $4, $5, 'RESERVED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $6
      )
      RETURNING id, user_id, person_id, event_variant_id, event_date, event_time, status, created_at, beneficiary_full_name
    `;
    const values = [userId, personId, eventVariantId, eventDate, eventTime, beneficiaryFullName];
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
        r.beneficiary_full_name,
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
    const row = result.rows[0];
    if (!row) return null;
    // Preferir beneficiary_full_name si está presente, sino construir desde person
    const beneficiary = row.beneficiary_full_name && row.beneficiary_full_name.trim().length > 0
      ? row.beneficiary_full_name
      : `${row.first_names || ''} ${row.paternal_surname || ''}${row.maternal_surname ? ' ' + row.maternal_surname : ''}`.trim();

    return {
      reservation_id: row.reservation_id,
      status: row.status,
      event_date: row.event_date,
      event_time: row.event_time,
      event_name: row.event_name,
      event_description: row.event_description,
      chapel_name: row.chapel_name,
      parish_name: row.parish_name,
      beneficiary_full_name: beneficiary
    };
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

  /**
   * Obtener reservas pendientes del usuario (paginado)
   * @param {number} userId - ID del usuario
   * @param {number} page - Número de página
   * @param {number} limit - Límite de registros por página
   * @returns {Object} Reservas y metadatos de paginación
   */
  static async getPendingReservations(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM public.reservation r
      WHERE r.user_id = $1 
        AND r.status IN ('RESERVED', 'IN_PROGRESS')
    `;
    const countResult = await db.query(countQuery, [userId]);
    const totalRecords = parseInt(countResult.rows[0].total);

    const query = `
      SELECT 
        r.id,
        r.beneficiary_full_name,
        ev.name as event_name,
        r.event_date,
        COALESCE(r.paid_amount, 0) as paid_amount,
        r.status,
        c.name as chapel_name,
        p.name as parish_name
      FROM public.reservation r
      INNER JOIN public.event_variant ev ON r.event_variant_id = ev.id
      INNER JOIN public.chapel_event ce ON ev.chapel_event_id = ce.id
      INNER JOIN public.chapel c ON ce.chapel_id = c.id
      INNER JOIN public.parish p ON c.parish_id = p.id
      WHERE r.user_id = $1 
        AND r.status IN ('RESERVED', 'IN_PROGRESS')
      ORDER BY r.event_date ASC, r.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await db.query(query, [userId, limit, offset]);

    return {
      data: result.rows,
      meta: {
        total_records: totalRecords,
        total_pages: Math.ceil(totalRecords / limit),
        current_page: page,
        per_page: limit
      }
    };
  }

  /**
   * Buscar reservas pendientes del usuario por nombre de evento (paginado)
   * @param {number} userId - ID del usuario
   * @param {string} searchTerm - Término de búsqueda
   * @param {number} page - Número de página
   * @param {number} limit - Límite de registros por página
   * @returns {Object} Reservas y metadatos de paginación
   */
  static async searchPendingReservations(userId, searchTerm, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const searchPattern = `%${searchTerm}%`;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM public.reservation r
      INNER JOIN public.event_variant ev ON r.event_variant_id = ev.id
      WHERE r.user_id = $1 
        AND r.status IN ('RESERVED', 'IN_PROGRESS')
        AND LOWER(ev.name) LIKE LOWER($2)
    `;
    const countResult = await db.query(countQuery, [userId, searchPattern]);
    const totalRecords = parseInt(countResult.rows[0].total);

    const query = `
      SELECT 
        r.id,
        r.beneficiary_full_name,
        ev.name as event_name,
        r.event_date,
        COALESCE(r.paid_amount, 0) as paid_amount,
        r.status,
        c.name as chapel_name,
        p.name as parish_name
      FROM public.reservation r
      INNER JOIN public.event_variant ev ON r.event_variant_id = ev.id
      INNER JOIN public.chapel_event ce ON ev.chapel_event_id = ce.id
      INNER JOIN public.chapel c ON ce.chapel_id = c.id
      INNER JOIN public.parish p ON c.parish_id = p.id
      WHERE r.user_id = $1 
        AND r.status IN ('RESERVED', 'IN_PROGRESS')
        AND LOWER(ev.name) LIKE LOWER($2)
      ORDER BY r.event_date ASC, r.created_at DESC
      LIMIT $3 OFFSET $4
    `;
    const result = await db.query(query, [userId, searchPattern, limit, offset]);

    return {
      data: result.rows,
      meta: {
        total_records: totalRecords,
        total_pages: Math.ceil(totalRecords / limit),
        current_page: page,
        per_page: limit
      }
    };
  }

  /**
   * Cancelar una reserva
   * @param {number} reservationId - ID de la reserva
   * @param {number} userId - ID del usuario (para verificar pertenencia)
   * @returns {Object} Información de la reserva cancelada
   */
  static async cancelReservation(reservationId, userId) {
    // Verificar que la reserva pertenece al usuario y está en estado cancelable
    const checkQuery = `
      SELECT id, status
      FROM public.reservation
      WHERE id = $1 AND user_id = $2
    `;
    const checkResult = await db.query(checkQuery, [reservationId, userId]);
    
    if (!checkResult.rows.length) {
      throw new Error('Reserva no encontrada o no pertenece al usuario');
    }

    const reservation = checkResult.rows[0];
    if (!['RESERVED', 'IN_PROGRESS'].includes(reservation.status)) {
      throw new Error('La reserva no puede ser cancelada en su estado actual');
    }

    // Actualizar el estado a CANCELLED
    const updateQuery = `
      UPDATE public.reservation
      SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, status
    `;
    const result = await db.query(updateQuery, [reservationId]);
    return result.rows[0];
  }

  /**
   * Obtener historial de reservas del usuario (completadas, finalizadas, canceladas, rechazadas)
   * @param {number} userId - ID del usuario
   * @param {number} page - Número de página
   * @param {number} limit - Límite de registros por página
   * @returns {Object} Lista paginada de reservas del historial
   */
  static async getHistoryReservations(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM public.reservation r
      WHERE r.user_id = $1
        AND r.status IN ('COMPLETED', 'FULFILLED', 'CANCELLED', 'REJECTED')
    `;
    const countResult = await db.query(countQuery, [userId]);
    const totalRecords = parseInt(countResult.rows[0].total);

    const query = `
      SELECT 
        r.id,
        r.beneficiary_full_name,
        ev.name as event_name,
        r.event_date,
        r.paid_amount,
        r.status
      FROM public.reservation r
      INNER JOIN public.event_variant ev ON r.event_variant_id = ev.id
      WHERE r.user_id = $1
        AND r.status IN ('COMPLETED', 'FULFILLED', 'CANCELLED', 'REJECTED')
      ORDER BY r.event_date DESC, r.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await db.query(query, [userId, limit, offset]);

    return {
      data: result.rows,
      meta: {
        total_records: totalRecords,
        total_pages: Math.ceil(totalRecords / limit),
        current_page: page,
        per_page: limit
      }
    };
  }

  /**
   * Buscar en el historial de reservas por nombre de evento
   * @param {number} userId - ID del usuario
   * @param {string} searchTerm - Término de búsqueda
   * @param {number} page - Número de página
   * @param {number} limit - Límite de registros por página
   * @returns {Object} Lista paginada de reservas del historial filtradas
   */
  static async searchHistoryReservations(userId, searchTerm, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const searchPattern = `%${searchTerm}%`;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM public.reservation r
      INNER JOIN public.event_variant ev ON r.event_variant_id = ev.id
      WHERE r.user_id = $1
        AND r.status IN ('COMPLETED', 'FULFILLED', 'CANCELLED', 'REJECTED')
        AND LOWER(ev.name) LIKE LOWER($2)
    `;
    const countResult = await db.query(countQuery, [userId, searchPattern]);
    const totalRecords = parseInt(countResult.rows[0].total);

    const query = `
      SELECT 
        r.id,
        ev.name as event_name,
        r.event_date,
        r.paid_amount,
        r.status
      FROM public.reservation r
      INNER JOIN public.event_variant ev ON r.event_variant_id = ev.id
      WHERE r.user_id = $1
        AND r.status IN ('COMPLETED', 'FULFILLED', 'CANCELLED', 'REJECTED')
        AND LOWER(ev.name) LIKE LOWER($2)
      ORDER BY r.event_date DESC, r.created_at DESC
      LIMIT $3 OFFSET $4
    `;
    const result = await db.query(query, [userId, searchPattern, limit, offset]);

    return {
      data: result.rows,
      meta: {
        total_records: totalRecords,
        total_pages: Math.ceil(totalRecords / limit),
        current_page: page,
        per_page: limit
      }
    };
  }

  /**
   * Obtener detalles completos de una reserva incluyendo requisitos
   * @param {number} reservationId - ID de la reserva
   * @param {number} userId - ID del usuario (para verificar pertenencia)
   * @returns {Object} Detalles completos de la reserva
   */
  static async getReservationDetails(reservationId, userId) {
    const query = `
      SELECT 
        r.id,
        r.beneficiary_full_name,
        ev.name as event_variant_name,
        r.event_date,
        r.status,
        r.paid_amount,
        CASE 
          WHEN r.paid_amount >= ev.current_price THEN 'PAGADO'
          WHEN r.paid_amount > 0 THEN 'PENDIENTE'
          ELSE 'PENDIENTE'
        END as payment_status,
        c.name as chapel_name,
        p.name as parish_name
      FROM public.reservation r
      INNER JOIN public.event_variant ev ON r.event_variant_id = ev.id
      INNER JOIN public.chapel_event ce ON ev.chapel_event_id = ce.id
      INNER JOIN public.chapel c ON ce.chapel_id = c.id
      INNER JOIN public.parish p ON c.parish_id = p.id
      WHERE r.id = $1 AND r.user_id = $2
    `;
    const result = await db.query(query, [reservationId, userId]);
    
    if (!result.rows.length) {
      throw new Error('Reserva no encontrada o no pertenece al usuario');
    }

    const reservation = result.rows[0];

    const requirementsQuery = `
      SELECT 
        rr.name,
        rr.completed
      FROM public.reservation_requirement rr
      WHERE rr.reservation_id = $1
      ORDER BY rr.name
    `;
    const requirementsResult = await db.query(requirementsQuery, [reservationId]);

    return {
      id: reservation.id,
      beneficiary_full_name: reservation.beneficiary_full_name,
      event_variant_name: reservation.event_variant_name,
      event_date: reservation.event_date,
      status: reservation.status,
      paid_amount: reservation.paid_amount,
      payment_status: reservation.payment_status,
      chapel: {
        name: reservation.chapel_name,
        parish_name: reservation.parish_name
      },
      requirements: requirementsResult.rows
    };
  }
}

module.exports = ReservationModel;
