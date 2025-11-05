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
      chapel_id: formInfo.chapel_id,
      chapel_name: formInfo.chapel_name
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

    return {
      available: availability.available,
      event_date: eventDate,
      event_time: eventTime,
      reason: availability.reason || null
    };
  }

  async createReservation(userId, reservationData) {
    const { event_variant_id, event_date, event_time, beneficiary_full_name } = reservationData;

    if (!event_variant_id || !event_date || !event_time) {
      throw new Error('Todos los campos son requeridos: event_variant_id, event_date, event_time');
    }

    const availability = await this.checkAvailability(event_variant_id, event_date, event_time);
    
    if (!availability.available) {
      throw new Error(availability.reason || 'El horario seleccionado no está disponible');
    }

    const reservation = await ReservationModel.create(
      userId,
      event_variant_id,
      event_date,
      event_time,
      beneficiary_full_name
    );

    const reservationInfo = await ReservationModel.findById(reservation.id);

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
}

module.exports = new ReservationService();
