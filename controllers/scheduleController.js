const ScheduleModel = require('../models/scheduleModel');

class ScheduleController {
  // ====================================================================
  // HORARIOS GENERALES
  // ====================================================================

  async listGeneralSchedules(req, res, next) {
    try {
      const { parishId, context_type } = req.user;
      const { chapelId } = req.params;

      if (!parishId || context_type !== 'PARISH') {
        return res.status(403).json({
          message: 'Prohibido. No se ha establecido un contexto de parroquia válido para la sesión.',
          data: null,
          error: 'FORBIDDEN',
          traceback: null
        });
      }

      const schedules = await ScheduleModel.listGeneralSchedules(Number(chapelId));

      res.status(200).json({
        message: 'Horario general obtenido con éxito.',
        data: schedules,
        error: '',
        traceback: null,
        meta: {
          total_records: schedules.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async bulkUpdateGeneralSchedules(req, res, next) {
    try {
      const { parishId, context_type } = req.user;
      const { chapelId } = req.params;
      const { schedules } = req.body;

      if (!parishId || context_type !== 'PARISH') {
        return res.status(403).json({
          message: 'Prohibido. No se ha establecido un contexto de parroquia válido para la sesión.',
          data: null,
          error: 'FORBIDDEN',
          traceback: null
        });
      }

      if (!Array.isArray(schedules)) {
        return res.status(400).json({
          message: 'El campo schedules debe ser un array',
          data: null,
          error: 'BAD_REQUEST',
          traceback: null
        });
      }

      await ScheduleModel.bulkUpdateGeneralSchedules(Number(chapelId), schedules);

      res.status(200).json({
        message: 'Horario general actualizado correctamente.',
        data: { success: true },
        error: '',
        traceback: null
      });
    } catch (error) {
      next(error);
    }
  }

  // ====================================================================
  // HORARIOS ESPECÍFICOS (EXCEPCIONES)
  // ====================================================================

  async listSpecificSchedules(req, res, next) {
    try {
      const { parishId, context_type } = req.user;
      const { chapelId } = req.params;
      const { page = 1, limit = 4, filters = {} } = req.body;

      if (!parishId || context_type !== 'PARISH') {
        return res.status(403).json({
          message: 'Prohibido. No se ha establecido un contexto de parroquia válido para la sesión.',
          data: null,
          error: 'FORBIDDEN',
          traceback: null
        });
      }

      const result = await ScheduleModel.listSpecificSchedules(
        Number(chapelId),
        Number(page),
        Number(limit),
        filters
      );

      res.status(200).json({
        message: 'Excepciones obtenidas con éxito.',
        data: result.data,
        error: '',
        traceback: null,
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

  async createSpecificSchedule(req, res, next) {
    try {
      const { parishId, context_type } = req.user;
      const { chapelId } = req.params;
      const { date, start_time, end_time, exception_type, reason } = req.body;

      if (!parishId || context_type !== 'PARISH') {
        return res.status(403).json({
          message: 'Prohibido. No se ha establecido un contexto de parroquia válido para la sesión.',
          data: null,
          error: 'FORBIDDEN',
          traceback: null
        });
      }

      if (!date || !start_time || !end_time || !exception_type) {
        return res.status(400).json({
          message: 'Los campos date, start_time, end_time y exception_type son requeridos',
          data: null,
          error: 'BAD_REQUEST',
          traceback: null
        });
      }

      const schedule = await ScheduleModel.createSpecificSchedule(Number(chapelId), {
        date,
        start_time,
        end_time,
        exception_type,
        reason
      });

      res.status(201).json({
        message: 'Excepción creada correctamente.',
        data: schedule,
        error: '',
        traceback: null
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSpecificSchedule(req, res, next) {
    try {
      const { parishId, context_type } = req.user;
      const { chapelId, scheduleId } = req.params;
      const { date, start_time, end_time, exception_type, reason } = req.body;

      if (!parishId || context_type !== 'PARISH') {
        return res.status(403).json({
          message: 'Prohibido. No se ha establecido un contexto de parroquia válido para la sesión.',
          data: null,
          error: 'FORBIDDEN',
          traceback: null
        });
      }

      if (!date || !start_time || !end_time || !exception_type) {
        return res.status(400).json({
          message: 'Los campos date, start_time, end_time y exception_type son requeridos',
          data: null,
          error: 'BAD_REQUEST',
          traceback: null
        });
      }

      const schedule = await ScheduleModel.updateSpecificSchedule(
        Number(scheduleId),
        Number(chapelId),
        { date, start_time, end_time, exception_type, reason }
      );

      res.status(200).json({
        message: 'Excepción actualizada correctamente.',
        data: schedule,
        error: '',
        traceback: null
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteSpecificSchedule(req, res, next) {
    try {
      const { parishId, context_type } = req.user;
      const { chapelId, scheduleId } = req.params;

      if (!parishId || context_type !== 'PARISH') {
        return res.status(403).json({
          message: 'Prohibido. No se ha establecido un contexto de parroquia válido para la sesión.',
          data: null,
          error: 'FORBIDDEN',
          traceback: null
        });
      }

      await ScheduleModel.deleteSpecificSchedule(Number(scheduleId), Number(chapelId));

      res.status(200).json({
        message: 'Excepción eliminada con éxito.',
        data: {},
        error: '',
        traceback: null
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ScheduleController();
