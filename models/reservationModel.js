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
        ev.duration_minutes,
        c.id as chapel_id,
        c.name as chapel_name,
        p.id as parish_id,
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
   * Obtener horarios de una capilla (general y excepciones)
   * @param {number} chapelId - ID de la capilla
   * @param {string} startDate - Fecha de inicio (YYYY-MM-DD)
   * @param {string} endDate - Fecha de fin (YYYY-MM-DD)
   * @returns {Object} Horarios generales y excepciones
   */
  static async getChapelSchedules(chapelId, startDate, endDate) {
    // Obtener horarios generales
    const generalQuery = `
      SELECT 
        day_of_week,
        start_time,
        end_time
      FROM public.general_schedule
      WHERE chapel_id = $1
      ORDER BY day_of_week, start_time
    `;
    
    // Obtener excepciones específicas
    const specificQuery = `
      SELECT 
        date,
        start_time,
        end_time,
        exception_type,
        reason
      FROM public.specific_schedule
      WHERE chapel_id = $1
        AND date BETWEEN $2 AND $3
      ORDER BY date, start_time
    `;
    
    const [generalResult, specificResult] = await Promise.all([
      db.query(generalQuery, [chapelId]),
      db.query(specificQuery, [chapelId, startDate, endDate])
    ]);
    
    return {
      general_schedules: generalResult.rows,
      specific_schedules: specificResult.rows
    };
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
      -- Verificar si hay cobertura del horario para el evento completo
      general_availability AS (
        SELECT 
          gs.start_time,
          gs.end_time,
          ei.duration_minutes,
          $3::time as selected_time,
          ($3::time + (ei.duration_minutes || ' minutes')::interval)::time as event_end_time
        FROM public.general_schedule gs
        INNER JOIN event_info ei ON gs.chapel_id = ei.chapel_id
        INNER JOIN day_info di ON gs.day_of_week = di.day_of_week
        WHERE 
          -- El horario debe cubrir al menos el inicio del evento
          $3::time >= gs.start_time 
          AND $3::time < gs.end_time
      ),
      -- Verificar si hay excepción en esta fecha
      specific_exception AS (
        SELECT ss.exception_type, ss.start_time, ss.end_time
        FROM public.specific_schedule ss
        INNER JOIN event_info ei ON ss.chapel_id = ei.chapel_id
        WHERE ss.date = $2::date
      ),
      -- Verificar si una excepción OPEN cubre completamente el evento
      specific_open_valid AS (
        SELECT 1 as valid
        FROM specific_exception se
        INNER JOIN event_info ei ON true
        WHERE se.exception_type = 'OPEN'
          AND $3::time >= se.start_time 
          AND ($3::time + (ei.duration_minutes || ' minutes')::interval)::time <= se.end_time
      ),
      -- Verificar si hay reservas que se solapan con este horario
      existing_reservation AS (
        SELECT r.id
        FROM public.reservation r
        INNER JOIN public.event_variant ev_existing ON r.event_variant_id = ev_existing.id
        INNER JOIN public.chapel_event ce ON ev_existing.chapel_event_id = ce.id
        INNER JOIN event_info ei ON ce.chapel_id = ei.chapel_id
        WHERE r.event_date = $2::date
          AND r.status NOT IN ('CANCELLED', 'REJECTED')
          AND (
            -- Caso 1: El nuevo evento empieza durante una reserva existente
            ($3::time >= r.event_time 
             AND $3::time < (r.event_time + (ev_existing.duration_minutes || ' minutes')::interval)::time)
            OR
            -- Caso 2: El nuevo evento termina durante una reserva existente
            (($3::time + (ei.duration_minutes || ' minutes')::interval)::time > r.event_time 
             AND ($3::time + (ei.duration_minutes || ' minutes')::interval)::time <= (r.event_time + (ev_existing.duration_minutes || ' minutes')::interval)::time)
            OR
            -- Caso 3: El nuevo evento cubre completamente una reserva existente
            ($3::time <= r.event_time 
             AND ($3::time + (ei.duration_minutes || ' minutes')::interval)::time >= (r.event_time + (ev_existing.duration_minutes || ' minutes')::interval)::time)
          )
      )
      SELECT 
        CASE 
          -- Primero verificar si hay conflicto con reservas existentes
          WHEN EXISTS (SELECT 1 FROM existing_reservation) THEN false
          -- Verificar si la capilla está cerrada en esta fecha
          WHEN EXISTS (SELECT 1 FROM specific_exception WHERE exception_type = 'CLOSED') THEN false
          -- Si hay excepción OPEN y el horario está dentro, es válido
          WHEN EXISTS (SELECT 1 FROM specific_open_valid) THEN true
          -- Si no hay excepciones o la excepción OPEN no cubre, verificar horario general
          WHEN EXISTS (SELECT 1 FROM general_availability) THEN true
          -- No hay horario disponible
          ELSE false
        END as available,
        CASE
          WHEN EXISTS (SELECT 1 FROM existing_reservation) THEN 'Ya existe una reserva en este horario'
          WHEN EXISTS (SELECT 1 FROM specific_exception WHERE exception_type = 'CLOSED') THEN 'La capilla está cerrada en esta fecha'
          WHEN NOT EXISTS (SELECT 1 FROM general_availability) 
            AND NOT EXISTS (SELECT 1 FROM specific_open_valid) 
          THEN 'El horario seleccionado no tiene disponibilidad suficiente para la duración del evento'
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
  /**
   * Crear una nueva reserva
   * @param {number} userId - ID del usuario que hace la reserva
   * @param {number} eventVariantId - ID de la variante del evento
   * @param {string} eventDate - Fecha del evento (YYYY-MM-DD)
   * @param {string} eventTime - Hora del evento (HH:MM)
   * @param {string} beneficiaryFullName - Nombre completo del beneficiario (opcional, si no se proporciona se usa el del usuario)
   * @param {Array} mentions - Array de menciones [{mention_type_id, mention_name}] (opcional)
   * @returns {Object} Reserva creada
   */
  static async create(userId, eventVariantId, eventDate, eventTime, beneficiaryFullName = null, mentions = []) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Verificar disponibilidad dentro de la transacción para evitar race conditions
      const availabilityCheck = await this.checkAvailability(eventVariantId, eventDate, eventTime);
      if (!availabilityCheck.available) {
        throw new Error(availabilityCheck.reason || 'El horario seleccionado no está disponible');
      }
      
      // Si no se proporciona beneficiaryFullName, obtenerlo del usuario
      let finalBeneficiaryName = beneficiaryFullName;
      if (!finalBeneficiaryName || finalBeneficiaryName.trim() === '') {
        const userQuery = `
          SELECT p.first_names, p.paternal_surname, p.maternal_surname 
          FROM public.user u
          INNER JOIN public.person p ON u.person_id = p.id
          WHERE u.id = $1
        `;
        const userResult = await client.query(userQuery, [userId]);
        
        if (!userResult.rows.length) {
          throw new Error('Usuario no encontrado');
        }
        
        const personRow = userResult.rows[0];
        finalBeneficiaryName = `${personRow.first_names || ''} ${personRow.paternal_surname || ''}${personRow.maternal_surname ? ' ' + personRow.maternal_surname : ''}`.trim();
      }

      // Crear la reserva
      const reservationQuery = `
        INSERT INTO public.reservation (
          id, user_id, event_variant_id, event_date, event_time, 
          status, registration_date, created_at, updated_at, beneficiary_full_name
        )
        VALUES (
          (SELECT COALESCE(MAX(id), 0) + 1 FROM public.reservation),
          $1, $2, $3, $4, 'RESERVED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $5
        )
        RETURNING id, user_id, event_variant_id, event_date, event_time, status, created_at, beneficiary_full_name
      `;
      const reservationValues = [userId, eventVariantId, eventDate, eventTime, finalBeneficiaryName];
      const reservationResult = await client.query(reservationQuery, reservationValues);
      const reservation = reservationResult.rows[0];

      // Insertar menciones si existen
      if (mentions && mentions.length > 0) {
        for (const mention of mentions) {
          const mentionQuery = `
            INSERT INTO public.reservation_mention (
              reservation_id, mention_type_id, mention_name, created_at, updated_at
            )
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `;
          await client.query(mentionQuery, [
            reservation.id,
            mention.mention_type_id,
            mention.mention_name
          ]);
        }
      }

      // Copiar requisitos base del evento
      const baseRequirementsQuery = `
        INSERT INTO public.reservation_requirement (
          id, reservation_id, base_requirement_id, chapel_requirement_id, name, description, completed, created_at, updated_at
        )
        SELECT 
          (SELECT COALESCE(MAX(id), 0) FROM public.reservation_requirement) + ROW_NUMBER() OVER (),
          $1,
          br.id,
          NULL,
          br.name,
          br.description,
          false,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        FROM public.base_requirement br
        INNER JOIN public.event_variant ev ON br.event_id = (
          SELECT e.id FROM public.event e
          INNER JOIN public.chapel_event ce ON e.id = ce.event_id
          WHERE ce.id = ev.chapel_event_id
        )
        WHERE ev.id = $2 AND br.active = true
      `;
      await client.query(baseRequirementsQuery, [reservation.id, eventVariantId]);

      // Copiar requisitos adicionales de la capilla
      const chapelRequirementsQuery = `
        INSERT INTO public.reservation_requirement (
          id, reservation_id, base_requirement_id, chapel_requirement_id, name, description, completed, created_at, updated_at
        )
        SELECT 
          (SELECT COALESCE(MAX(id), 0) FROM public.reservation_requirement) + ROW_NUMBER() OVER (),
          $1,
          NULL,
          cer.id,
          cer.name,
          cer.description,
          false,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        FROM public.chapel_event_requirement cer
        INNER JOIN public.event_variant ev ON cer.chapel_event_id = ev.chapel_event_id
        WHERE ev.id = $2 AND cer.active = true
      `;
      await client.query(chapelRequirementsQuery, [reservation.id, eventVariantId]);

      await client.query('COMMIT');
      return reservation;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
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
        r.event_time,
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
      ORDER BY r.event_date, r.created_at 
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
        r.event_time,
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
      ORDER BY r.event_date, r.created_at
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
        r.event_time,
        r.paid_amount,
        r.status
      FROM public.reservation r
      INNER JOIN public.event_variant ev ON r.event_variant_id = ev.id
      WHERE r.user_id = $1
        AND r.status IN ('COMPLETED', 'FULFILLED', 'CANCELLED', 'REJECTED')
      ORDER BY r.event_date, r.created_at 
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
        r.beneficiary_full_name,
        ev.name as event_name,
        r.event_date,
        r.event_time,
        r.paid_amount,
        r.status
      FROM public.reservation r
      INNER JOIN public.event_variant ev ON r.event_variant_id = ev.id
      WHERE r.user_id = $1
        AND r.status IN ('COMPLETED', 'FULFILLED', 'CANCELLED', 'REJECTED')
        AND LOWER(ev.name) LIKE LOWER($2)
      ORDER BY r.event_date, r.created_at
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
        r.event_time,
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
      event_time: reservation.event_time,
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

  /**
   * Listar reservas para gestión administrativa (por parroquia)
   * @param {number} parishId - ID de la parroquia
   * @param {number} page - Número de página
   * @param {number} limit - Límite de registros
   * @returns {Object} Listado paginado de reservas
   */
  static async listReservationsForManagement(parishId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT 
        r.id,
        r.event_date,
        r.event_time,
        r.status,
        r.paid_amount,
        r.beneficiary_full_name,
        ev.name as event_variant_name,
        ev.current_price,
        c.id as chapel_id,
        c.name as chapel_name,
        per.id as person_id,
        CONCAT(per.first_names, ' ', per.paternal_surname, ' ', COALESCE(per.maternal_surname, '')) as user_full_name
      FROM public.reservation r
      INNER JOIN public.event_variant ev ON r.event_variant_id = ev.id
      INNER JOIN public.chapel_event ce ON ev.chapel_event_id = ce.id
      INNER JOIN public.chapel c ON ce.chapel_id = c.id
      INNER JOIN public."user" u ON r.user_id = u.id
      INNER JOIN public.person per ON u.person_id = per.id
      WHERE c.parish_id = $1
      ORDER BY r.event_date DESC, r.event_time DESC
      LIMIT $2 OFFSET $3
    `;
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM public.reservation r
      INNER JOIN public.event_variant ev ON r.event_variant_id = ev.id
      INNER JOIN public.chapel_event ce ON ev.chapel_event_id = ce.id
      INNER JOIN public.chapel c ON ce.chapel_id = c.id
      WHERE c.parish_id = $1
    `;
    
    const [dataResult, countResult] = await Promise.all([
      db.query(query, [parishId, limit, offset]),
      db.query(countQuery, [parishId])
    ]);
    
    return {
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].total),
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].total / limit)
    };
  }

  /**
   * Buscar reservas por nombre de usuario (gestión administrativa)
   * @param {number} parishId - ID de la parroquia
   * @param {string} searchTerm - Término de búsqueda
   * @param {number} page - Número de página
   * @param {number} limit - Límite de registros
   * @returns {Object} Resultados de búsqueda paginados
   */
  static async searchReservationsForManagement(parishId, searchTerm, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT 
        r.id,
        r.event_date,
        r.event_time,
        r.status,
        r.paid_amount,
        r.beneficiary_full_name,
        ev.name as event_variant_name,
        ev.current_price,
        c.id as chapel_id,
        c.name as chapel_name,
        per.id as person_id,
        CONCAT(per.first_names, ' ', per.paternal_surname, ' ', COALESCE(per.maternal_surname, '')) as user_full_name
      FROM public.reservation r
      INNER JOIN public.event_variant ev ON r.event_variant_id = ev.id
      INNER JOIN public.chapel_event ce ON ev.chapel_event_id = ce.id
      INNER JOIN public.chapel c ON ce.chapel_id = c.id
      INNER JOIN public."user" u ON r.user_id = u.id
      INNER JOIN public.person per ON u.person_id = per.id
      WHERE c.parish_id = $1
        AND (
          LOWER(per.first_names) LIKE LOWER($2)
          OR LOWER(per.paternal_surname) LIKE LOWER($2)
          OR LOWER(per.maternal_surname) LIKE LOWER($2)
          OR LOWER(CONCAT(per.first_names, ' ', per.paternal_surname)) LIKE LOWER($2)
        )
      ORDER BY r.event_date DESC, r.event_time DESC
      LIMIT $3 OFFSET $4
    `;
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM public.reservation r
      INNER JOIN public.event_variant ev ON r.event_variant_id = ev.id
      INNER JOIN public.chapel_event ce ON ev.chapel_event_id = ce.id
      INNER JOIN public.chapel c ON ce.chapel_id = c.id
      INNER JOIN public."user" u ON r.user_id = u.id
      INNER JOIN public.person per ON u.person_id = per.id
      WHERE c.parish_id = $1
        AND (
          LOWER(per.first_names) LIKE LOWER($2)
          OR LOWER(per.paternal_surname) LIKE LOWER($2)
          OR LOWER(per.maternal_surname) LIKE LOWER($2)
          OR LOWER(CONCAT(per.first_names, ' ', per.paternal_surname)) LIKE LOWER($2)
        )
    `;
    
    const searchPattern = `%${searchTerm}%`;
    
    const [dataResult, countResult] = await Promise.all([
      db.query(query, [parishId, searchPattern, limit, offset]),
      db.query(countQuery, [parishId, searchPattern])
    ]);
    
    return {
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].total),
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].total / limit)
    };
  }

  /**
   * Obtener detalles de una reserva para gestión administrativa
   * @param {number} reservationId - ID de la reserva
   * @param {number} parishId - ID de la parroquia
   * @returns {Object} Detalles completos de la reserva
   */
  static async getReservationDetailsForManagement(reservationId, parishId) {
    const query = `
      SELECT 
        r.id,
        r.event_date,
        r.event_time,
        r.registration_date,
        r.reschedule_date,
        r.status,
        r.paid_amount,
        r.beneficiary_full_name,
        ev.id as event_variant_id,
        ev.name as event_variant_name,
        ev.current_price,
        c.id as chapel_id,
        c.name as chapel_name,
        per.id as person_id,
        CONCAT(per.first_names, ' ', per.paternal_surname, ' ', COALESCE(per.maternal_surname, '')) as user_full_name,
        per.email,
        per.document
      FROM public.reservation r
      INNER JOIN public.event_variant ev ON r.event_variant_id = ev.id
      INNER JOIN public.chapel_event ce ON ev.chapel_event_id = ce.id
      INNER JOIN public.chapel c ON ce.chapel_id = c.id
      INNER JOIN public."user" u ON r.user_id = u.id
      INNER JOIN public.person per ON u.person_id = per.id
      WHERE r.id = $1 AND c.parish_id = $2
    `;
    
    const result = await db.query(query, [reservationId, parishId]);
    
    if (!result.rows.length) {
      throw new Error('Reserva no encontrada');
    }
    
    const reservation = result.rows[0];
    
    // Obtener menciones de la reserva
    const mentionsQuery = `
      SELECT 
        rm.id,
        rm.mention_type_id,
        rm.mention_name,
        mt.code as mention_type_code,
        mt.name as mention_type_name
      FROM public.reservation_mention rm
      INNER JOIN public.mention_type mt ON rm.mention_type_id = mt.id
      WHERE rm.reservation_id = $1
      ORDER BY rm.id
    `;
    
    const mentionsResult = await db.query(mentionsQuery, [reservationId]);
    reservation.mentions = mentionsResult.rows || [];
    
    return reservation;
  }

  /**
   * Actualizar el estado de una reserva
   * @param {number} reservationId - ID de la reserva
   * @param {number} parishId - ID de la parroquia
   * @param {string} newStatus - Nuevo estado
   * @returns {Object} Reserva actualizada
   */
  static async updateReservationStatus(reservationId, parishId, newStatus) {
    // Primero verificar que la reserva pertenece a la parroquia
    const checkQuery = `
      SELECT r.id
      FROM public.reservation r
      INNER JOIN public.event_variant ev ON r.event_variant_id = ev.id
      INNER JOIN public.chapel_event ce ON ev.chapel_event_id = ce.id
      INNER JOIN public.chapel c ON ce.chapel_id = c.id
      WHERE r.id = $1 AND c.parish_id = $2
    `;
    
    const checkResult = await db.query(checkQuery, [reservationId, parishId]);
    
    if (!checkResult.rows.length) {
      throw new Error('Reserva no encontrada');
    }
    
    const updateQuery = `
      UPDATE public.reservation
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, status
    `;
    
    const result = await db.query(updateQuery, [newStatus, reservationId]);
    return result.rows[0];
  }

  /**
   * Actualizar datos de una reserva (reprogramación)
   * @param {number} reservationId - ID de la reserva
   * @param {number} parishId - ID de la parroquia
   * @param {Object} updateData - Datos a actualizar
   * @returns {Object} Reserva actualizada
   */
  static async updateReservation(reservationId, parishId, updateData) {
    // Verificar que la reserva pertenece a la parroquia
    const checkQuery = `
      SELECT r.id
      FROM public.reservation r
      INNER JOIN public.event_variant ev ON r.event_variant_id = ev.id
      INNER JOIN public.chapel_event ce ON ev.chapel_event_id = ce.id
      INNER JOIN public.chapel c ON ce.chapel_id = c.id
      WHERE r.id = $1 AND c.parish_id = $2
    `;
    
    const checkResult = await db.query(checkQuery, [reservationId, parishId]);
    
    if (!checkResult.rows.length) {
      throw new Error('Reserva no encontrada');
    }
    
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    if (updateData.event_date) {
      updates.push(`event_date = $${paramIndex++}`);
      values.push(updateData.event_date);
    }
    
    if (updateData.event_time) {
      updates.push(`event_time = $${paramIndex++}`);
      values.push(updateData.event_time);
    }
    
    if (updateData.paid_amount !== undefined) {
      updates.push(`paid_amount = $${paramIndex++}`);
      values.push(updateData.paid_amount);
    }
    
    if (updateData.reschedule_date !== undefined) {
      updates.push(`reschedule_date = $${paramIndex++}`);
      values.push(updateData.reschedule_date);
    }
    
    if (updates.length === 0) {
      throw new Error('No hay datos para actualizar');
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(reservationId);
    
    const updateQuery = `
      UPDATE public.reservation
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await db.query(updateQuery, values);
    return result.rows[0];
  }
}

module.exports = ReservationModel;
