const ReservationModel = require('../models/reservationModel');

class ReservationService {
  /**
   * Obtener información para el formulario de reserva
   * @param {number} eventVariantId - ID de la variante del evento
   * @returns {Object} Información del formulario
   */
  async getFormInfo(eventVariantId) {
    if (!eventVariantId) {
      throw new Error('El ID del evento es requerido');
    }

    const formInfo = await ReservationModel.getFormInfo(eventVariantId);
    
    if (!formInfo) {
      throw new Error('No se encontró información para este evento');
    }

    // Formatear la respuesta según la especificación
    return {
      chapel_parish: formInfo.parish_name,
      event_name: formInfo.event_name,
      event_description: formInfo.event_description,
      current_price: formInfo.current_price,
      chapel_id: formInfo.chapel_id,
      chapel_name: formInfo.chapel_name
    };
  }

  /**
   * Verificar disponibilidad de un horario
   * @param {number} eventVariantId - ID de la variante del evento
   * @param {string} eventDate - Fecha del evento (YYYY-MM-DD)
   * @param {string} eventTime - Hora del evento (HH:MM)
   * @returns {Object} Resultado de la verificación
   */
  async checkAvailability(eventVariantId, eventDate, eventTime) {
    if (!eventVariantId || !eventDate || !eventTime) {
      throw new Error('Todos los campos son requeridos: event_variant_id, event_date, event_time');
    }

    // Validar formato de fecha
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(eventDate)) {
      throw new Error('Formato de fecha inválido. Use YYYY-MM-DD');
    }

    // Validar formato de hora
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(eventTime)) {
      throw new Error('Formato de hora inválido. Use HH:MM');
    }

    // Verificar que la fecha no sea en el pasado
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const requestedDate = new Date(eventDate);
    
    if (requestedDate < today) {
      return {
        available: false,
        event_date: eventDate,
        event_time: eventTime,
        reason: 'No se pueden hacer reservas en fechas pasadas'
      };
    }

    const availability = await ReservationModel.checkAvailability(
      eventVariantId, 
      eventDate, 
      eventTime
    );

    return {
      available: availability.available,
      event_date: eventDate,
      event_time: eventTime,
      reason: availability.reason || null
    };
  }

  /**
   * Crear una nueva reserva
   * @param {number} userId - ID del usuario que reserva
   * @param {Object} reservationData - Datos de la reserva
   * @returns {Object} Reserva creada
   */
  async createReservation(userId, reservationData) {
    const { event_variant_id, event_date, event_time } = reservationData;

    if (!event_variant_id || !event_date || !event_time) {
      throw new Error('Todos los campos son requeridos: event_variant_id, event_date, event_time');
    }

    // Primero verificar disponibilidad
    const availability = await this.checkAvailability(event_variant_id, event_date, event_time);
    
    if (!availability.available) {
      throw new Error(availability.reason || 'El horario seleccionado no está disponible');
    }

    // Crear la reserva
    const reservation = await ReservationModel.create(
      userId,
      event_variant_id,
      event_date,
      event_time
    );

    // Obtener información completa de la reserva
    const reservationInfo = await ReservationModel.findById(reservation.id);

    // Formatear la respuesta
    const dateFormatted = new Date(event_date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const timeFormatted = new Date(`2000-01-01T${event_time}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return {
      reservation_id: reservation.id,
      status: reservation.status,
      confirmation_message: `Su reserva ha sido confirmada para ${reservationInfo.event_name} el día ${dateFormatted} a las ${timeFormatted}`
    };
  }

  /**
   * Obtener horarios disponibles en un rango de fechas
   * @param {number} eventVariantId - ID de la variante del evento
   * @param {string} startDate - Fecha de inicio (YYYY-MM-DD)
   * @param {string} endDate - Fecha de fin (YYYY-MM-DD)
   * @returns {Array} Lista de horarios disponibles
   */
  async getAvailableSlots(eventVariantId, startDate, endDate) {
    if (!eventVariantId || !startDate || !endDate) {
      throw new Error('Todos los campos son requeridos: event_variant_id, start_date, end_date');
    }

    // Validar que la fecha de inicio sea anterior a la fecha de fin
    if (new Date(startDate) > new Date(endDate)) {
      throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    // Limitar el rango a 3 meses máximo
    const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 90) {
      throw new Error('El rango de fechas no puede ser mayor a 90 días');
    }

    const slots = await ReservationModel.getAvailableSlots(eventVariantId, startDate, endDate);

    // Agrupar por fecha
    const groupedSlots = {};
    slots.forEach(slot => {
      if (!groupedSlots[slot.date]) {
        groupedSlots[slot.date] = [];
      }
      groupedSlots[slot.date].push({
        time: slot.time,
        time_display: slot.time_display
      });
    });

    return {
      available_dates: Object.keys(groupedSlots),
      slots_by_date: groupedSlots,
      total_slots: slots.length
    };
  }
}

module.exports = new ReservationService();
