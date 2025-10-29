const reservationService = require('../services/reservationService');

class ReservationController {
  /**
   * Obtener información para el formulario de reserva
   * GET /api/client/reservation/form/:event_id
   */
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

  /**
   * Verificar disponibilidad de horario
   * POST /api/client/reservation/check-availability
   */
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

  /**
   * Crear nueva reserva
   * POST /api/client/reservation/create
   */
  async createReservation(req, res, next) {
    try {
      // El userId viene del token JWT decodificado por el authMiddleware
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

  /**
   * Obtener horarios disponibles en un rango de fechas
   * POST /api/client/reservation/available-slots
   */
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
}

module.exports = new ReservationController();
