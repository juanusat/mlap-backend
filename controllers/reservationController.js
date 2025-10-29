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

      const message = result.available 
        ? 'El horario está disponible' 
        : 'El horario no está disponible';

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
}

module.exports = new ReservationController();
