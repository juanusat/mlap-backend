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

module.exports = {
  getReservationsByChapel,
  getOccupancyMap,
  getEventsByChapel,
  getParishHierarchy,
  getChapelEvents
};
