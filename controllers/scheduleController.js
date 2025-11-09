const ScheduleModel = require('../models/scheduleModel');

// ====================================================================
// HORARIOS GENERALES
// ====================================================================

const listGeneralSchedules = async (req, res, next) => {
  try {
    const { parishId, context_type } = req.user;
    const { chapelId } = req.params;

    // Permitir acceso a feligreses (PARISHIONER) y usuarios de parroquia (PARISH)
    if (!context_type || (context_type !== 'PARISH' && context_type !== 'PARISHIONER')) {
      return res.status(403).json({
        message: 'Prohibido. Debe estar autenticado para ver los horarios.',
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
};

const bulkUpdateGeneralSchedules = async (req, res, next) => {
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
};

// ====================================================================
// HORARIOS ESPECÍFICOS (EXCEPCIONES)
// ====================================================================

const listSpecificSchedules = async (req, res, next) => {
  try {
    const { parishId, context_type } = req.user;
    const { chapelId } = req.params;
    const { page = 1, limit = 4, filters = {} } = req.body;

    // Permitir acceso a feligreses (PARISHIONER) y usuarios de parroquia (PARISH)
    if (!context_type || (context_type !== 'PARISH' && context_type !== 'PARISHIONER')) {
      return res.status(403).json({
        message: 'Prohibido. Debe estar autenticado para ver los horarios.',
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
};

const createSpecificSchedule = async (req, res, next) => {
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
};

const updateSpecificSchedule = async (req, res, next) => {
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
};

const deleteSpecificSchedule = async (req, res, next) => {
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
};

module.exports = {
  listGeneralSchedules,
  bulkUpdateGeneralSchedules,
  listSpecificSchedules,
  createSpecificSchedule,
  updateSpecificSchedule,
  deleteSpecificSchedule
};

