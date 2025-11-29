const ReservationModel = require('../models/reservationModel');

class ReservationService {
  async getFormInfo(eventVariantId) {
    if (!eventVariantId) {
      throw new Error('El ID del evento es requerido');
    }

    const formInfo = await ReservationModel.getFormInfo(eventVariantId);

    if (!formInfo) {
      throw new Error('No se encontró información para este evento');
    }

    return {
      chapel_parish: formInfo.parish_name,
      event_name: formInfo.event_name,
      event_description: formInfo.event_description,
      current_price: formInfo.current_price,
      duration_minutes: formInfo.duration_minutes,
      chapel_id: formInfo.chapel_id,
      chapel_name: formInfo.chapel_name,
      parish_id: formInfo.parish_id
    };
  }

  async checkAvailability(eventVariantId, eventDate, eventTime) {
    if (!eventVariantId || !eventDate || !eventTime) {
      throw new Error('Todos los campos son requeridos: event_variant_id, event_date, event_time');
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(eventDate)) {
      throw new Error('Formato de fecha inválido. Use YYYY-MM-DD');
    }

    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(eventTime)) {
      throw new Error('Formato de hora inválido. Use HH:MM');
    }

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

    // Retornar con reason siempre presente
    return {
      available: availability.available,
      event_date: eventDate,
      event_time: eventTime,
      reason: availability.available
        ? 'Horario disponible'
        : (availability.reason || 'El horario no está disponible')
    };
  }

  async createReservation(userId, reservationData) {
    const { event_variant_id, event_date, event_time, beneficiary_full_name, mentions } = reservationData;

    if (!event_variant_id || !event_date || !event_time) {
      throw new Error('Todos los campos son requeridos: event_variant_id, event_date, event_time');
    }

    // Validar menciones si existen
    if (mentions && Array.isArray(mentions)) {
      for (const mention of mentions) {
        if (!mention.mention_type_id || !mention.mention_name || mention.mention_name.trim() === '') {
          throw new Error('Cada mención debe tener un tipo y un nombre válido');
        }
      }
    }

    // La validación de disponibilidad ahora se hace dentro de la transacción en el modelo
    // para evitar race conditions
    const reservation = await ReservationModel.create(
      userId,
      event_variant_id,
      event_date,
      event_time,
      beneficiary_full_name,
      mentions || []
    );

    const reservationInfo = await ReservationModel.findById(reservation.id);

    const [year, month, day] = event_date.split('-');
    const dateFormatted = `${day}/${month}/${year}`;

    const timeFormatted = new Date(`2000-01-01T${event_time}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return {
      reservation_id: reservation.id,
      status: reservation.status,
      beneficiary_full_name: reservation.beneficiary_full_name || reservationInfo.beneficiary_full_name || null,
      confirmation_message: `Su reserva ha sido confirmada para ${reservationInfo.event_name} el día ${dateFormatted} a las ${timeFormatted}`
    };
  }

  async getAvailableSlots(eventVariantId, startDate, endDate) {
    if (!eventVariantId || !startDate || !endDate) {
      throw new Error('Todos los campos son requeridos: event_variant_id, start_date, end_date');
    }

    if (new Date(startDate) > new Date(endDate)) {
      throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 90) {
      throw new Error('El rango de fechas no puede ser mayor a 90 días');
    }

    const slots = await ReservationModel.getAvailableSlots(eventVariantId, startDate, endDate);

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

  async getPendingReservations(userId, page, limit) {
    if (!userId) {
      throw new Error('El ID del usuario es requerido');
    }

    return await ReservationModel.getPendingReservations(userId, page, limit);
  }

  async searchPendingReservations(userId, searchTerm, page, limit) {
    if (!userId) {
      throw new Error('El ID del usuario es requerido');
    }

    if (!searchTerm || searchTerm.trim() === '') {
      throw new Error('El término de búsqueda es requerido');
    }

    return await ReservationModel.searchPendingReservations(userId, searchTerm, page, limit);
  }

  async cancelReservation(userId, reservationId) {
    if (!userId || !reservationId) {
      throw new Error('El ID del usuario y el ID de la reserva son requeridos');
    }

    return await ReservationModel.cancelReservation(reservationId, userId);
  }

  async getHistoryReservations(userId, page, limit) {
    if (!userId) {
      throw new Error('El ID del usuario es requerido');
    }

    return await ReservationModel.getHistoryReservations(userId, page, limit);
  }

  async searchHistoryReservations(userId, searchTerm, page, limit) {
    if (!userId) {
      throw new Error('El ID del usuario es requerido');
    }

    if (!searchTerm || searchTerm.trim() === '') {
      throw new Error('El término de búsqueda es requerido');
    }

    return await ReservationModel.searchHistoryReservations(userId, searchTerm, page, limit);
  }

  async getReservationDetails(userId, reservationId) {
    if (!userId || !reservationId) {
      throw new Error('El ID del usuario y el ID de la reserva son requeridos');
    }

    return await ReservationModel.getReservationDetails(reservationId, userId);
  }

  // ===== Servicios para Gestión Administrativa =====

  async listReservationsForManagement(parishId, page, limit) {
    if (!parishId) {
      throw new Error('El ID de la parroquia es requerido');
    }

    return await ReservationModel.listReservationsForManagement(parishId, page, limit);
  }

  async searchReservationsForManagement(parishId, searchTerm, page, limit) {
    if (!parishId) {
      throw new Error('El ID de la parroquia es requerido');
    }

    if (!searchTerm || searchTerm.trim() === '') {
      throw new Error('El término de búsqueda es requerido');
    }

    return await ReservationModel.searchReservationsForManagement(parishId, searchTerm, page, limit);
  }

  async getReservationDetailsForManagement(reservationId, parishId) {
    if (!reservationId || !parishId) {
      throw new Error('El ID de la reserva y el ID de la parroquia son requeridos');
    }

    return await ReservationModel.getReservationDetailsForManagement(reservationId, parishId);
  }

  async updateReservationStatus(reservationId, parishId, newStatus) {
    if (!reservationId || !parishId || !newStatus) {
      throw new Error('Todos los campos son requeridos');
    }

    return await ReservationModel.updateReservationStatus(reservationId, parishId, newStatus);
  }

  async updateReservation(reservationId, parishId, updateData) {
    if (!reservationId || !parishId) {
      throw new Error('El ID de la reserva y el ID de la parroquia son requeridos');
    }

    return await ReservationModel.updateReservation(reservationId, parishId, updateData);
  }

  async getReservationPayments(reservationId, parishId) {
    if (!reservationId || !parishId) {
      throw new Error('El ID de la reserva y el ID de la parroquia son requeridos');
    }

    const reservation = await ReservationModel.getReservationDetailsForManagement(reservationId, parishId);
    if (!reservation) {
      throw new Error('Reserva no encontrada o no pertenece a esta parroquia');
    }

    return await ReservationModel.getReservationPayments(reservationId);
  }

  async createPayment(reservationId, parishId, amount, workerId) {
    if (!reservationId || !parishId || !amount) {
      throw new Error('Todos los campos son requeridos');
    }

    const reservation = await ReservationModel.getReservationDetailsForManagement(reservationId, parishId);
    if (!reservation) {
      throw new Error('Reserva no encontrada o no pertenece a esta parroquia');
    }

    const currentPrice = parseFloat(reservation.current_price || 0);
    const paidAmount = parseFloat(reservation.paid_amount || 0);
    const remaining = currentPrice - paidAmount;

    if (amount > remaining) {
      throw new Error(`El monto del pago (${amount}) excede el saldo pendiente (${remaining.toFixed(2)})`);
    }

    return await ReservationModel.createPayment(reservationId, amount, workerId);
  }

  async getReservationPaymentsForParishioner(reservationId, userId) {
    if (!reservationId || !userId) {
      throw new Error('El ID de la reserva y el ID del usuario son requeridos');
    }

    const reservation = await ReservationModel.getReservationDetails(reservationId, userId);
    if (!reservation) {
      throw new Error('Reserva no encontrada o no pertenece a este usuario');
    }

    return await ReservationModel.getReservationPayments(reservationId);
  }

  async createPaymentForParishioner(reservationId, userId, amount, cardData) {
    if (!reservationId || !userId || !amount || !cardData) {
      throw new Error('Todos los campos son requeridos');
    }

    const reservation = await ReservationModel.getReservationDetails(reservationId, userId);
    if (!reservation) {
      throw new Error('Reserva no encontrada o no pertenece a este usuario');
    }

    const currentPrice = parseFloat(reservation.current_price || 0);
    const paidAmount = parseFloat(reservation.paid_amount || 0);
    const remaining = currentPrice - paidAmount;

    if (amount > remaining) {
      throw new Error(`El monto del pago (${amount}) excede el saldo pendiente (${remaining.toFixed(2)})`);
    }

    return await ReservationModel.createPayment(reservationId, amount, null);
  }
  async getReservationRequirements(reservationId, parishId) {
    if (!reservationId || !parishId) {
      throw new Error('El ID de la reserva y el ID de la parroquia son requeridos');
    }

    const reservation = await ReservationModel.getReservationDetailsForManagement(reservationId, parishId);
    if (!reservation) {
      throw new Error('Reserva no encontrada o no pertenece a esta parroquia');
    }

    return await ReservationModel.getRequirements(reservationId);
  }

  async updateReservationRequirements(reservationId, parishId, requirements) {
    if (!reservationId || !parishId || !requirements) {
      throw new Error('Todos los campos son requeridos');
    }

    const reservation = await ReservationModel.getReservationDetailsForManagement(reservationId, parishId);
    if (!reservation) {
      throw new Error('Reserva no encontrada o no pertenece a esta parroquia');
    }

    if (!Array.isArray(requirements)) {
      throw new Error('Los requisitos deben ser una lista');
    }

    return await ReservationModel.updateRequirements(reservationId, requirements);
  }
}

module.exports = new ReservationService();
