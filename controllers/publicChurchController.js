const PublicChurchModel = require('../models/publicChurchModel');

class PublicChurchController {
  static async searchChurches(req, res) {
    try {
      const { query = '', page = 1, limit = 10 } = req.body;

      const { locations, total } = await PublicChurchModel.searchChurchLocations(query, page, limit);

      res.status(200).json({
        message: 'Búsqueda exitosa',
        data: locations,
        error: null,
        traceback: null,
        meta: {
          total_records: total
        }
      });
    } catch (error) {
      console.error('Error en searchChurches:', error);
      res.status(500).json({
        message: 'Error al buscar ubicaciones',
        data: [],
        error: error.message,
        traceback: error.stack,
        meta: {
          total_records: 0
        }
      });
    }
  }

  static async selectParish(req, res) {
    try {
      const { parish_id } = req.body;

      if (!parish_id) {
        return res.status(400).json({
          message: 'El parish_id es requerido',
          data: null,
          error: 'parish_id es requerido',
          traceback: null
        });
      }

      const data = await PublicChurchModel.getParishWithChapels(parish_id);

      if (!data.selected_parish) {
        return res.status(404).json({
          message: 'Parroquia no encontrada',
          data: null,
          error: 'Parroquia no encontrada',
          traceback: null
        });
      }

      res.status(200).json({
        message: 'Parroquia seleccionada exitosamente',
        data,
        error: null,
        traceback: null
      });
    } catch (error) {
      console.error('Error en selectParish:', error);
      res.status(500).json({
        message: 'Error al seleccionar parroquia',
        data: null,
        error: error.message,
        traceback: error.stack
      });
    }
  }

  static async getChapelInfo(req, res) {
    try {
      const { chapel_id } = req.params;

      if (!chapel_id) {
        return res.status(400).json({
          message: 'El chapel_id es requerido',
          data: null,
          error: 'chapel_id es requerido',
          traceback: null
        });
      }

      const data = await PublicChurchModel.getChapelInfo(parseInt(chapel_id));

      if (!data) {
        return res.status(404).json({
          message: 'Capilla no encontrada',
          data: null,
          error: 'Capilla no encontrada',
          traceback: null
        });
      }

      res.status(200).json({
        message: 'Información obtenida exitosamente',
        data,
        error: null,
        traceback: null
      });
    } catch (error) {
      console.error('Error en getChapelInfo:', error);
      res.status(500).json({
        message: 'Error al obtener información de la capilla',
        data: null,
        error: error.message,
        traceback: error.stack
      });
    }
  }

  static async getChapelActs(req, res) {
    try {
      const { chapel_id } = req.params;

      if (!chapel_id) {
        return res.status(400).json({
          message: 'El chapel_id es requerido',
          data: [],
          error: 'chapel_id es requerido',
          traceback: null
        });
      }

      const data = await PublicChurchModel.getChapelActs(parseInt(chapel_id));

      res.status(200).json({
        message: 'Actos litúrgicos obtenidos exitosamente',
        data,
        error: null,
        traceback: null
      });
    } catch (error) {
      console.error('Error en getChapelActs:', error);
      res.status(500).json({
        message: 'Error al obtener actos litúrgicos',
        data: [],
        error: error.message,
        traceback: error.stack
      });
    }
  }

  static async getChapelProfile(req, res) {
    try {
      const { chapel_id } = req.params;

      if (!chapel_id) {
        return res.status(400).json({
          message: 'El chapel_id es requerido',
          data: null,
          error: 'chapel_id es requerido',
          traceback: null
        });
      }

      const data = await PublicChurchModel.getChapelProfile(parseInt(chapel_id));

      if (!data) {
        return res.status(404).json({
          message: 'Capilla no encontrada',
          data: null,
          error: 'Capilla no encontrada',
          traceback: null
        });
      }

      res.status(200).json({
        message: 'Perfil obtenido exitosamente',
        data,
        error: null,
        traceback: null
      });
    } catch (error) {
      console.error('Error en getChapelProfile:', error);
      res.status(500).json({
        message: 'Error al obtener perfil de la capilla',
        data: null,
        error: error.message,
        traceback: error.stack
      });
    }
  }
}

module.exports = PublicChurchController;
