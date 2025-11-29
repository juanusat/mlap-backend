const reservationService = require('../services/reservationService');

class ReservationController {
  async getFormInfo(req, res, next) {
    try {
      const { event_id } = req.params;
      const data = await reservationService.getFormInfo(Number(event_id));

      res.status(200).json({
        message: 'Información del formulario obtenida exitosamente',
        data,
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }

  async checkAvailability(req, res, next) {
    try {
      const { event_variant_id, event_date, event_time } = req.body;

      const result = await reservationService.checkAvailability(
        event_variant_id,
        event_date,
        event_time
      );

      // Usar el reason del servicio que ya incluye el mensaje apropiado
      const message = result.reason || (result.available
        ? 'El horario está disponible'
        : 'El horario no está disponible');

      res.status(200).json({
        message,
        data: result,
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }

  async createReservation(req, res, next) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          message: 'Usuario no autenticado',
          data: {},
          error: 'No se encontró información del usuario',
          traceback: ''
        });
      }

      const data = await reservationService.createReservation(userId, req.body);

      res.status(201).json({
        message: 'Reserva creada exitosamente',
        data,
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }

  async getAvailableSlots(req, res, next) {
    try {
      const { event_variant_id, start_date, end_date } = req.body;

      const data = await reservationService.getAvailableSlots(
        event_variant_id,
        start_date,
        end_date
      );

      res.status(200).json({
        message: 'Horarios disponibles obtenidos exitosamente',
        data,
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }

  async listPendingReservations(req, res, next) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          message: 'Usuario no autenticado',
          data: {},
          error: 'No se encontró información del usuario',
          traceback: ''
        });
      }

      const { page = 1, limit = 10 } = req.body;

      const result = await reservationService.getPendingReservations(
        userId,
        Number(page),
        Number(limit)
      );

      res.status(200).json({
        message: 'Reservas pendientes obtenidas exitosamente',
        data: result.data,
        meta: result.meta,
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }

  async searchPendingReservations(req, res, next) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          message: 'Usuario no autenticado',
          data: {},
          error: 'No se encontró información del usuario',
          traceback: ''
        });
      }

      const { search_event_name, page = 1, limit = 10 } = req.body;

      const result = await reservationService.searchPendingReservations(
        userId,
        search_event_name,
        Number(page),
        Number(limit)
      );

      res.status(200).json({
        message: 'Búsqueda de reservas pendientes completada exitosamente',
        data: result.data,
        meta: result.meta,
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelReservation(req, res, next) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          message: 'Usuario no autenticado',
          data: {},
          error: 'No se encontró información del usuario',
          traceback: ''
        });
      }

      const { id } = req.params;

      const result = await reservationService.cancelReservation(userId, Number(id));

      res.status(200).json({
        message: 'La reserva ha sido cancelada exitosamente',
        data: {
          reservation_id: result.id,
          new_status: result.status
        },
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }

  async listHistoryReservations(req, res, next) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          message: 'Usuario no autenticado',
          data: {},
          error: 'No se encontró información del usuario',
          traceback: ''
        });
      }

      const { page = 1, limit = 10 } = req.body;

      const result = await reservationService.getHistoryReservations(
        userId,
        Number(page),
        Number(limit)
      );

      res.status(200).json({
        message: 'Historial de reservas obtenido exitosamente',
        data: result.data,
        meta: result.meta,
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }

  async searchHistoryReservations(req, res, next) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          message: 'Usuario no autenticado',
          data: {},
          error: 'No se encontró información del usuario',
          traceback: ''
        });
      }

      const { search_event_name, page = 1, limit = 10 } = req.body;

      const result = await reservationService.searchHistoryReservations(
        userId,
        search_event_name,
        Number(page),
        Number(limit)
      );

      res.status(200).json({
        message: 'Búsqueda en historial completada exitosamente',
        data: result.data,
        meta: result.meta,
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }

  async getReservationDetails(req, res, next) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          message: 'Usuario no autenticado',
          data: {},
          error: 'No se encontró información del usuario',
          traceback: ''
        });
      }

      const { id } = req.params;

      const result = await reservationService.getReservationDetails(userId, Number(id));

      res.status(200).json({
        message: 'Detalles de la reserva obtenidos exitosamente',
        data: result,
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }

  // ===== Funciones para Gestión Administrativa de Reservas =====

  async listReservationsForManagement(req, res, next) {
    try {
      const { parishId, context_type } = req.user;
      const { page = 1, limit = 10 } = req.body;

      if (!parishId || context_type !== 'PARISH') {
        return res.status(403).json({
          message: 'Prohibido. No se ha establecido un contexto de parroquia válido para la sesión.',
          data: null,
          error: 'FORBIDDEN',
          traceback: null
        });
      }

      const result = await reservationService.listReservationsForManagement(
        parishId,
        Number(page),
        Number(limit)
      );

      res.status(200).json({
        message: 'Reservas obtenidas exitosamente',
        data: result.data,
        error: '',
        traceback: '',
        meta: {
          total_records: result.total,
          page: result.page,
          limit: result.limit,
          total_pages: result.totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async searchReservationsForManagement(req, res, next) {
    try {
      const { parishId, context_type } = req.user;
      const { search, page = 1, limit = 10 } = req.body;

      if (!parishId || context_type !== 'PARISH') {
        return res.status(403).json({
          message: 'Prohibido. No se ha establecido un contexto de parroquia válido para la sesión.',
          data: null,
          error: 'FORBIDDEN',
          traceback: null
        });
      }

      if (!search || search.trim() === '') {
        return res.status(400).json({
          message: 'El término de búsqueda es requerido',
          data: null,
          error: 'BAD_REQUEST',
          traceback: null
        });
      }

      const result = await reservationService.searchReservationsForManagement(
        parishId,
        search.trim(),
        Number(page),
        Number(limit)
      );

      res.status(200).json({
        message: 'Búsqueda de reservas completada exitosamente',
        data: result.data,
        error: '',
        traceback: '',
        meta: {
          total_records: result.total,
          page: result.page,
          limit: result.limit,
          total_pages: result.totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getReservationDetailsForManagement(req, res, next) {
    try {
      const { parishId, context_type } = req.user;
      const { id } = req.params;

      if (!parishId || context_type !== 'PARISH') {
        return res.status(403).json({
          message: 'Prohibido. No se ha establecido un contexto de parroquia válido para la sesión.',
          data: null,
          error: 'FORBIDDEN',
          traceback: null
        });
      }

      const result = await reservationService.getReservationDetailsForManagement(
        Number(id),
        parishId
      );

      res.status(200).json({
        message: 'Detalles de la reserva obtenidos exitosamente',
        data: result,
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }

  async updateReservationStatus(req, res, next) {
    try {
      const { parishId, context_type } = req.user;
      const { id } = req.params;
      const { new_status } = req.body;

      if (!parishId || context_type !== 'PARISH') {
        return res.status(403).json({
          message: 'Prohibido. No se ha establecido un contexto de parroquia válido para la sesión.',
          data: null,
          error: 'FORBIDDEN',
          traceback: null
        });
      }

      if (!new_status) {
        return res.status(400).json({
          message: 'El nuevo estado es requerido',
          data: null,
          error: 'BAD_REQUEST',
          traceback: null
        });
      }

      const validStatuses = ['RESERVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'FULFILLED', 'CANCELLED'];
      if (!validStatuses.includes(new_status)) {
        return res.status(400).json({
          message: 'Estado inválido',
          data: null,
          error: 'BAD_REQUEST',
          traceback: null
        });
      }

      const result = await reservationService.updateReservationStatus(
        Number(id),
        parishId,
        new_status
      );

      res.status(200).json({
        message: 'Estado de la reserva actualizado exitosamente',
        data: result,
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }

  async rejectReservation(req, res, next) {
    try {
      const { parishId, context_type } = req.user;
      const { id } = req.params;

      if (!parishId || context_type !== 'PARISH') {
        return res.status(403).json({
          message: 'Prohibido. No se ha establecido un contexto de parroquia válido para la sesión.',
          data: null,
          error: 'FORBIDDEN',
          traceback: null
        });
      }

      const result = await reservationService.updateReservationStatus(
        Number(id),
        parishId,
        'REJECTED'
      );

      res.status(200).json({
        message: 'Reserva rechazada exitosamente',
        data: result,
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }

  async updateReservation(req, res, next) {
    try {
      const { parishId, context_type } = req.user;
      const { id } = req.params;
      const updateData = req.body;

      if (!parishId || context_type !== 'PARISH') {
        return res.status(403).json({
          message: 'Prohibido. No se ha establecido un contexto de parroquia válido para la sesión.',
          data: null,
          error: 'FORBIDDEN',
          traceback: null
        });
      }

      const result = await reservationService.updateReservation(
        Number(id),
        parishId,
        updateData
      );

      res.status(200).json({
        message: 'Reserva actualizada exitosamente',
        data: result,
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }

  async getReservationPayments(req, res, next) {
    try {
      const { parishId, context_type } = req.user;
      const { id } = req.params;

      if (!parishId || context_type !== 'PARISH') {
        return res.status(403).json({
          message: 'Prohibido. No se ha establecido un contexto de parroquia válido para la sesión.',
          data: null,
          error: 'FORBIDDEN',
          traceback: null
        });
      }

      const payments = await reservationService.getReservationPayments(Number(id), parishId);

      res.status(200).json({
        message: 'Pagos obtenidos exitosamente',
        data: payments,
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }

  async createPayment(req, res, next) {
    try {
      const { parishId, context_type, userId } = req.user;
      const { id } = req.params;
      const { amount } = req.body;

      if (!parishId || context_type !== 'PARISH') {
        return res.status(403).json({
          message: 'Prohibido. No se ha establecido un contexto de parroquia válido para la sesión.',
          data: null,
          error: 'FORBIDDEN',
          traceback: null
        });
      }

      if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        return res.status(400).json({
          message: 'El monto del pago es requerido y debe ser mayor a 0',
          data: null,
          error: 'BAD_REQUEST',
          traceback: null
        });
      }

      const payment = await reservationService.createPayment(
        Number(id),
        parishId,
        parseFloat(amount),
        userId
      );

      res.status(201).json({
        message: 'Pago registrado exitosamente',
        data: payment,
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }

  async getReservationPaymentsForParishioner(req, res, next) {
    try {
      const { userId } = req.user;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          message: 'Usuario no autenticado',
          data: null,
          error: 'UNAUTHORIZED',
          traceback: null
        });
      }

      const payments = await reservationService.getReservationPaymentsForParishioner(Number(id), userId);

      res.status(200).json({
        message: 'Pagos obtenidos exitosamente',
        data: payments,
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }

  async createPaymentForParishioner(req, res, next) {
    try {
      const { userId } = req.user;
      const { id } = req.params;
      const { amount, card_number, card_holder, expiry_date, cvv } = req.body;

      if (!userId) {
        return res.status(401).json({
          message: 'Usuario no autenticado',
          data: null,
          error: 'UNAUTHORIZED',
          traceback: null
        });
      }

      if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        return res.status(400).json({
          message: 'El monto del pago es requerido y debe ser mayor a 0',
          data: null,
          error: 'BAD_REQUEST',
          traceback: null
        });
      }

      if (!card_number || !card_holder || !expiry_date || !cvv) {
        return res.status(400).json({
          message: 'Todos los datos de la tarjeta son requeridos',
          data: null,
          error: 'BAD_REQUEST',
          traceback: null
        });
      }

      const payment = await reservationService.createPaymentForParishioner(
        Number(id),
        userId,
        parseFloat(amount),
        { card_number, card_holder, expiry_date, cvv }
      );

      res.status(201).json({
        message: 'Pago procesado exitosamente',
        data: payment,
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }
  async getReservationRequirements(req, res, next) {
    try {
      const { parishId, context_type } = req.user;
      const { id } = req.params;

      if (!parishId || context_type !== 'PARISH') {
        return res.status(403).json({
          message: 'Prohibido. No se ha establecido un contexto de parroquia válido para la sesión.',
          data: null,
          error: 'FORBIDDEN',
          traceback: null
        });
      }

      const requirements = await reservationService.getReservationRequirements(Number(id), parishId);

      res.status(200).json({
        message: 'Requisitos obtenidos exitosamente',
        data: requirements,
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }

  async updateReservationRequirements(req, res, next) {
    try {
      const { parishId, context_type } = req.user;
      const { id } = req.params;
      const { requirements } = req.body;

      if (!parishId || context_type !== 'PARISH') {
        return res.status(403).json({
          message: 'Prohibido. No se ha establecido un contexto de parroquia válido para la sesión.',
          data: null,
          error: 'FORBIDDEN',
          traceback: null
        });
      }

      const updatedRequirements = await reservationService.updateReservationRequirements(
        Number(id),
        parishId,
        requirements
      );

      res.status(200).json({
        message: 'Requisitos actualizados exitosamente',
        data: updatedRequirements,
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReservationController();
