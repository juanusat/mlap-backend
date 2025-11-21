const db = require('../db');

class ReportService {
  async getReservationsByChapel(chapelName) {
    const chapelResult = await db.query(
      'SELECT id, name FROM chapel WHERE name = $1',
      [chapelName]
    );

    if (chapelResult.rows.length === 0) {
      throw new Error(`Capilla "${chapelName}" no encontrada`);
    }

    const chapelId = chapelResult.rows[0].id;

    const result = await db.query(
      `SELECT 
        r.id as reservation_id,
        r.status,
        r.user_id,
        r.beneficiary_full_name,
        e.name as event_base_name,
        ev.name as event_variant_name
      FROM reservation r
      INNER JOIN event_variant ev ON r.event_variant_id = ev.id
      INNER JOIN chapel_event ce ON ev.chapel_event_id = ce.id
      INNER JOIN event e ON ce.event_id = e.id
      WHERE ce.chapel_id = $1
      ORDER BY r.status, e.name`,
      [chapelId]
    );

    // Agrupar por status
    const groupedByStatus = {};
    result.rows.forEach(row => {
      if (!groupedByStatus[row.status]) {
        groupedByStatus[row.status] = {
          status: row.status,
          count: 0,
          reservations: []
        };
      }
      groupedByStatus[row.status].count++;
      groupedByStatus[row.status].reservations.push({
        reservation_id: row.reservation_id,
        user_id: row.user_id,
        beneficiary_full_name: row.beneficiary_full_name,
        event_base_name: row.event_base_name,
        event_variant_name: row.event_variant_name
      });
    });

    return {
      chapel_name: chapelName,
      statistics: Object.values(groupedByStatus)
    };
  }

  async getReservationsByDateRange(startDate, endDate, parishId) {
    // Obtener información de la parroquia
    const parishInfo = await db.query(
      `SELECT id, name FROM parish WHERE id = $1`,
      [parishId]
    );

    const result = await db.query(
      `SELECT 
        r.event_date::TEXT as date,
        EXTRACT(DAY FROM r.event_date) as day_number,
        COUNT(r.id) as count,
        c.name as chapel_name,
        p.name as parish_name
      FROM reservation r
      INNER JOIN event_variant ev ON r.event_variant_id = ev.id
      INNER JOIN chapel_event ce ON ev.chapel_event_id = ce.id
      INNER JOIN chapel c ON ce.chapel_id = c.id
      INNER JOIN parish p ON c.parish_id = p.id
      WHERE c.parish_id = $1
        AND r.event_date >= $2
        AND r.event_date <= $3
      GROUP BY r.event_date, c.name, p.name
      ORDER BY r.event_date`,
      [parishId, startDate, endDate]
    );

    // Agrupar por fecha y sumar todas las reservas de todas las capillas
    const dailyMap = {};
    result.rows.forEach(row => {
      if (!dailyMap[row.date]) {
        dailyMap[row.date] = {
          date: row.date,
          day_number: row.day_number,
          count: 0,
          chapels: []
        };
      }
      dailyMap[row.date].count += parseInt(row.count);
      dailyMap[row.date].chapels.push({
        chapel_name: row.chapel_name,
        count: parseInt(row.count)
      });
    });

    const dailyReservations = Object.values(dailyMap);
    
    // Calcular total
    const totalReservations = dailyReservations.reduce((sum, day) => sum + day.count, 0);
    
    console.log(`\n=== REPORTE DE RESERVAS POR FECHA ===`);
    console.log(`Parroquia: ${parishInfo.rows[0]?.name || 'N/A'}`);
    console.log(`Rango: ${startDate} a ${endDate}`);
    console.log(`Total de reservas: ${totalReservations}`);
    console.log(`\nDetalle por fecha:`);
    dailyReservations.forEach(day => {
      console.log(`\nFecha: ${day.date} (Día ${day.day_number})`);
      console.log(`  Total del día: ${day.count}`);
      day.chapels.forEach(chapel => {
        console.log(`    - ${chapel.chapel_name}: ${chapel.count} reservas`);
      });
    });
    console.log(`\n=====================================\n`);

    return {
      start_date: startDate,
      end_date: endDate,
      parish_name: parishInfo.rows[0]?.name || 'N/A',
      total_reservations: totalReservations,
      daily_reservations: dailyReservations
    };
  }

  async getOccupancyMap(chapelName, year, month) {
    const chapelResult = await db.query(
      'SELECT id, name FROM chapel WHERE name = $1',
      [chapelName]
    );

    if (chapelResult.rows.length === 0) {
      throw new Error(`Capilla "${chapelName}" no encontrada`);
    }

    const chapelId = chapelResult.rows[0].id;

    console.log(`\n=== MAPA DE OCUPACIÓN ===`);
    console.log(`Capilla: ${chapelName} (ID: ${chapelId})`);
    console.log(`Año: ${year}, Mes: ${month}`);

    // Primero obtener TODAS las reservas individuales para mostrar detalle
    const detailResult = await db.query(
      `SELECT 
        r.id as reservation_id,
        r.event_date::TEXT as event_date,
        r.event_time::TEXT as event_time,
        r.status,
        EXTRACT(DOW FROM r.event_date) as day_of_week,
        EXTRACT(DAY FROM r.event_date) as day_number,
        EXTRACT(MONTH FROM r.event_date) as month_number,
        EXTRACT(YEAR FROM r.event_date) as year_number,
        TO_CHAR(r.event_date, 'Day') as day_name
      FROM reservation r
      INNER JOIN event_variant ev ON r.event_variant_id = ev.id
      INNER JOIN chapel_event ce ON ev.chapel_event_id = ce.id
      WHERE ce.chapel_id = $1
        AND EXTRACT(YEAR FROM r.event_date) = $2
        AND EXTRACT(MONTH FROM r.event_date) = $3
        AND r.status IN ('RESERVED', 'IN_PROGRESS')
      ORDER BY r.event_date, r.event_time`,
      [chapelId, year, month]
    );

    console.log(`\nTotal de reservas encontradas: ${detailResult.rows.length}`);
    console.log(`\nDetalle de reservas:`);
    detailResult.rows.forEach((row, index) => {
      console.log(`\n${index + 1}. Reserva ID: ${row.reservation_id}`);
      console.log(`   Fecha: ${row.event_date} (${row.day_name.trim()})`);
      console.log(`   Hora: ${row.event_time}`);
      console.log(`   Estado: ${row.status}`);
      console.log(`   Día del mes: ${row.day_number}`);
      console.log(`   Día de la semana (0=Dom, 6=Sab): ${row.day_of_week}`);
    });

    // Contar todas las reservas del mes agrupadas por hora y día de la semana
    // Solo considera RESERVED e IN_PROGRESS (excluye COMPLETED, CANCELLED, etc.)
    const result = await db.query(
      `SELECT 
        r.event_time::TEXT as time,
        EXTRACT(DOW FROM r.event_date) as day_of_week,
        COUNT(r.id) as count
      FROM reservation r
      INNER JOIN event_variant ev ON r.event_variant_id = ev.id
      INNER JOIN chapel_event ce ON ev.chapel_event_id = ce.id
      WHERE ce.chapel_id = $1
        AND EXTRACT(YEAR FROM r.event_date) = $2
        AND EXTRACT(MONTH FROM r.event_date) = $3
        AND r.status IN ('RESERVED', 'IN_PROGRESS')
      GROUP BY r.event_time, EXTRACT(DOW FROM r.event_date)
      ORDER BY r.event_time, day_of_week`,
      [chapelId, year, month]
    );

    console.log(`\n=== AGRUPACIÓN POR DÍA DE SEMANA Y HORA ===`);
    result.rows.forEach(row => {
      const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      console.log(`${dayNames[row.day_of_week]} a las ${row.time}: ${row.count} reserva(s)`);
    });

    const timeSlots = {};
    
    result.rows.forEach(row => {
      const time = row.time.substring(0, 5);
      
      if (!timeSlots[time]) {
        timeSlots[time] = {
          time,
          monday: 0,
          tuesday: 0,
          wednesday: 0,
          thursday: 0,
          friday: 0,
          saturday: 0,
          sunday: 0
        };
      }

      const dayMap = {
        0: 'sunday',
        1: 'monday',
        2: 'tuesday',
        3: 'wednesday',
        4: 'thursday',
        5: 'friday',
        6: 'saturday'
      };

      const dayName = dayMap[row.day_of_week];
      // Acumula el conteo de todas las semanas del mes
      timeSlots[time][dayName] = parseInt(row.count);
    });

    const occupancyResult = Object.values(timeSlots).sort((a, b) => a.time.localeCompare(b.time));
    
    console.log(`\n=== RESULTADO FINAL ===`);
    console.log(`Total de franjas horarias: ${occupancyResult.length}`);
    console.log(JSON.stringify(occupancyResult, null, 2));
    console.log(`========================\n`);

    return {
      chapel_name: chapelName,
      year,
      month,
      occupancy: occupancyResult
    };
  }

  async getEventsByChapel(chapelName) {
    const chapelResult = await db.query(
      'SELECT id, name FROM chapel WHERE name = $1',
      [chapelName]
    );

    if (chapelResult.rows.length === 0) {
      throw new Error(`Capilla "${chapelName}" no encontrada`);
    }

    const chapelId = chapelResult.rows[0].id;

    const result = await db.query(
      `SELECT 
        e.name as event_name,
        COUNT(r.id) as count
      FROM reservation r
      INNER JOIN event_variant ev ON r.event_variant_id = ev.id
      INNER JOIN chapel_event ce ON ev.chapel_event_id = ce.id
      INNER JOIN event e ON ce.event_id = e.id
      WHERE ce.chapel_id = $1
        AND r.status = 'COMPLETED'
      GROUP BY e.name
      ORDER BY count DESC, e.name`,
      [chapelId]
    );

    return {
      chapel_name: chapelName,
      events: result.rows
    };
  }

  async getParishHierarchy() {
    const result = await db.query(
      `SELECT 
        p.id as parish_id,
        p.name as parish_name,
        c.id as chapel_id,
        c.name as chapel_name
      FROM parish p
      LEFT JOIN chapel c ON c.parish_id = p.id
      WHERE p.active = true
        AND (c.active = true OR c.id IS NULL)
      ORDER BY p.name, c.name`
    );

    const hierarchyMap = {};

    result.rows.forEach(row => {
      if (!hierarchyMap[row.parish_id]) {
        hierarchyMap[row.parish_id] = {
          parish_id: row.parish_id,
          parish_name: row.parish_name,
          chapels: []
        };
      }

      if (row.chapel_id) {
        hierarchyMap[row.parish_id].chapels.push({
          chapel_id: row.chapel_id,
          chapel_name: row.chapel_name
        });
      }
    });

    return Object.values(hierarchyMap);
  }

  async getChapelEvents(parishName, chapelName) {
    const result = await db.query(
      `SELECT 
        p.id as parish_id,
        p.name as parish_name,
        c.id as chapel_id,
        c.name as chapel_name
      FROM parish p
      INNER JOIN chapel c ON c.parish_id = p.id
      WHERE p.name = $1 AND c.name = $2`,
      [parishName, chapelName]
    );

    if (result.rows.length === 0) {
      throw new Error(`Parroquia "${parishName}" o capilla "${chapelName}" no encontrada`);
    }

    const chapelId = result.rows[0].chapel_id;

    const eventsResult = await db.query(
      `SELECT 
        e.name as event_name,
        COUNT(r.id) as count
      FROM reservation r
      INNER JOIN event_variant ev ON r.event_variant_id = ev.id
      INNER JOIN chapel_event ce ON ev.chapel_event_id = ce.id
      INNER JOIN event e ON ce.event_id = e.id
      WHERE ce.chapel_id = $1
        AND r.status = 'COMPLETED'
      GROUP BY e.name
      ORDER BY count DESC, e.name`,
      [chapelId]
    );

    return {
      parish_name: parishName,
      chapel_name: chapelName,
      events: eventsResult.rows
    };
  }

  async getCancelledReservations(userId) {
    const result = await db.query(
      `SELECT 
        r.id,
        e.name as event_name,
        c.name as chapel_name,
        p.name as parish_name,
        r.event_date::TEXT as event_date,
        r.event_time::TEXT as event_time,
        r.status
      FROM reservation r
      INNER JOIN event_variant ev ON r.event_variant_id = ev.id
      INNER JOIN chapel_event ce ON ev.chapel_event_id = ce.id
      INNER JOIN event e ON ce.event_id = e.id
      INNER JOIN chapel c ON ce.chapel_id = c.id
      INNER JOIN parish p ON c.parish_id = p.id
      WHERE r.user_id = $1
        AND r.status = 'CANCELLED'
      ORDER BY r.event_date DESC, r.event_time DESC`,
      [userId]
    );

    return {
      total: result.rows.length,
      reservations: result.rows
    };
  }

  async getCompletedReservations(userId) {
    const result = await db.query(
      `SELECT 
        r.id,
        e.name as event_name,
        c.name as chapel_name,
        p.name as parish_name,
        r.event_date::TEXT as event_date,
        r.event_time::TEXT as event_time,
        r.status
      FROM reservation r
      INNER JOIN event_variant ev ON r.event_variant_id = ev.id
      INNER JOIN chapel_event ce ON ev.chapel_event_id = ce.id
      INNER JOIN event e ON ce.event_id = e.id
      INNER JOIN chapel c ON ce.chapel_id = c.id
      INNER JOIN parish p ON c.parish_id = p.id
      WHERE r.user_id = $1
        AND r.status = 'COMPLETED'
      ORDER BY r.event_date DESC, r.event_time DESC`,
      [userId]
    );

    return {
      total: result.rows.length,
      reservations: result.rows
    };
  }

  async getRoleFrequency(userId) {
    const parishResult = await db.query(
      `SELECT DISTINCT p.id as parish_id
      FROM association a
      INNER JOIN parish p ON a.parish_id = p.id
      WHERE a.user_id = $1 AND a.active = true
      LIMIT 1`,
      [userId]
    );

    if (parishResult.rows.length === 0) {
      throw new Error('Usuario no tiene asociación activa con ninguna parroquia');
    }

    const parishId = parishResult.rows[0].parish_id;

    const result = await db.query(
      `SELECT 
        r.id as role_id,
        r.name as role_name,
        COUNT(DISTINCT ur.id) as worker_count
      FROM role r
      LEFT JOIN user_role ur ON ur.role_id = r.id AND ur.revocation_date IS NULL
      LEFT JOIN association a ON ur.association_id = a.id AND a.active = true
      WHERE r.parish_id = $1 AND r.active = true
      GROUP BY r.id, r.name
      ORDER BY worker_count DESC, r.name`,
      [parishId]
    );

    const totalWorkers = result.rows.reduce((sum, row) => sum + parseInt(row.worker_count), 0);

    return {
      total_workers: totalWorkers,
      roles: result.rows
    };
  }

  async getUserAuditLog(userId) {
    const result = await db.query(
      `SELECT 
        id,
        action_type,
        description,
        created_at
      FROM user_audit_log
      WHERE user_id = $1
      ORDER BY created_at DESC`,
      [userId]
    );

    return {
      total: result.rows.length,
      audit_logs: result.rows
    };
  }
}

module.exports = new ReportService();
