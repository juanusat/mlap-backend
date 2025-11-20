const reportService = require('../services/reportService');

const getReservationsByChapel = async (req, res) => {
  try {
    const { chapel_name } = req.query;

    if (!chapel_name) {
      return res.status(400).json({
        message: 'Parámetro faltante',
        error: 'chapel_name es requerido'
      });
    }

    const data = await reportService.getReservationsByChapel(chapel_name);

    return res.status(200).json({
      message: 'Datos obtenidos exitosamente',
      data
    });
  } catch (error) {
    console.error('Error en getReservationsByChapel:', error);
    
    if (error.message.includes('no encontrada')) {
      return res.status(404).json({
        message: 'Capilla no encontrada',
        error: error.message
      });
    }

    return res.status(500).json({
      message: 'Error al obtener datos de reservas',
      error: error.message
    });
  }
};

const getReservationsByDateRange = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        message: 'Parámetros faltantes',
        error: 'start_date y end_date son requeridos'
      });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(start_date) || !dateRegex.test(end_date)) {
      return res.status(400).json({
        message: 'Formato de fecha inválido',
        error: 'Las fechas deben tener formato YYYY-MM-DD'
      });
    }

    if (new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({
        message: 'Rango de fechas inválido',
        error: 'La fecha de inicio debe ser anterior a la fecha de fin'
      });
    }

    const data = await reportService.getReservationsByDateRange(start_date, end_date);

    return res.status(200).json({
      message: 'Datos obtenidos exitosamente',
      data
    });
  } catch (error) {
    console.error('Error en getReservationsByDateRange:', error);

    return res.status(500).json({
      message: 'Error al obtener datos de reservas por fecha',
      error: error.message
    });
  }
};

const getOccupancyMap = async (req, res) => {
  try {
    const { chapel_name, year, month } = req.query;

    if (!chapel_name || !year || !month) {
      return res.status(400).json({
        message: 'Parámetros faltantes',
        error: 'chapel_name, year y month son requeridos'
      });
    }

    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        message: 'Parámetros inválidos',
        error: 'year debe ser un número válido y month debe estar entre 1 y 12'
      });
    }

    const data = await reportService.getOccupancyMap(chapel_name, yearNum, monthNum);

    return res.status(200).json({
      message: 'Datos obtenidos exitosamente',
      data
    });
  } catch (error) {
    console.error('Error en getOccupancyMap:', error);
    
    if (error.message.includes('no encontrada')) {
      return res.status(404).json({
        message: 'Capilla no encontrada',
        error: error.message
      });
    }

    return res.status(500).json({
      message: 'Error al obtener mapa de ocupación',
      error: error.message
    });
  }
};

const getEventsByChapel = async (req, res) => {
  try {
    const { chapel_name } = req.query;

    if (!chapel_name) {
      return res.status(400).json({
        message: 'Parámetro faltante',
        error: 'chapel_name es requerido'
      });
    }

    const data = await reportService.getEventsByChapel(chapel_name);

    return res.status(200).json({
      message: 'Datos obtenidos exitosamente',
      data
    });
  } catch (error) {
    console.error('Error en getEventsByChapel:', error);
    
    if (error.message.includes('no encontrada')) {
      return res.status(404).json({
        message: 'Capilla no encontrada',
        error: error.message
      });
    }

    return res.status(500).json({
      message: 'Error al obtener datos de eventos',
      error: error.message
    });
  }
};

const getParishHierarchy = async (req, res) => {
  try {
    const data = await reportService.getParishHierarchy();

    return res.status(200).json({
      message: 'Datos obtenidos exitosamente',
      data
    });
  } catch (error) {
    console.error('Error en getParishHierarchy:', error);

    return res.status(500).json({
      message: 'Error al obtener estructura de parroquias',
      error: error.message
    });
  }
};

const getChapelEvents = async (req, res) => {
  try {
    const { parish_name, chapel_name } = req.query;

    if (!parish_name || !chapel_name) {
      return res.status(400).json({
        message: 'Parámetros faltantes',
        error: 'parish_name y chapel_name son requeridos'
      });
    }

    const data = await reportService.getChapelEvents(parish_name, chapel_name);

    return res.status(200).json({
      message: 'Datos obtenidos exitosamente',
      data
    });
  } catch (error) {
    console.error('Error en getChapelEvents:', error);
    
    if (error.message.includes('no encontrada')) {
      return res.status(404).json({
        message: 'Parroquia o capilla no encontrada',
        error: error.message
      });
    }

    return res.status(500).json({
      message: 'Error al obtener datos de eventos',
      error: error.message
    });
  }
};

const getCancelledReservations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const data = await reportService.getCancelledReservations(userId);

    return res.status(200).json({
      message: 'Datos obtenidos exitosamente',
      data
    });
  } catch (error) {
    console.error('Error en getCancelledReservations:', error);

    return res.status(500).json({
      message: 'Error al obtener reservas canceladas',
      error: error.message
    });
  }
};

const getCompletedReservations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const data = await reportService.getCompletedReservations(userId);

    return res.status(200).json({
      message: 'Datos obtenidos exitosamente',
      data
    });
  } catch (error) {
    console.error('Error en getCompletedReservations:', error);

    return res.status(500).json({
      message: 'Error al obtener reservas completadas',
      error: error.message
    });
  }
};

const getRoleFrequency = async (req, res) => {
  try {
    const userId = req.user.userId;
    const data = await reportService.getRoleFrequency(userId);

    return res.status(200).json({
      message: 'Datos obtenidos exitosamente',
      data
    });
  } catch (error) {
    console.error('Error en getRoleFrequency:', error);

    return res.status(500).json({
      message: 'Error al obtener frecuencia de roles',
      error: error.message
    });
  }
};

const getUserAuditLog = async (req, res) => {
  try {
    const userId = req.user.userId;
    const data = await reportService.getUserAuditLog(userId);

    return res.status(200).json({
      message: 'Datos obtenidos exitosamente',
      data
    });
  } catch (error) {
    console.error('Error en getUserAuditLog:', error);

    return res.status(500).json({
      message: 'Error al obtener bitácora de usuario',
      error: error.message
    });
  }
};

module.exports = {
  getReservationsByChapel,
  getReservationsByDateRange,
  getOccupancyMap,
  getEventsByChapel,
  getParishHierarchy,
  getChapelEvents,
  getCancelledReservations,
  getCompletedReservations,
  getRoleFrequency,
  getUserAuditLog
};
