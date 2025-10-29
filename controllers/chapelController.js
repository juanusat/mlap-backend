const ChapelModel = require('../models/chapelModel');

class ChapelController {
  async create(req, res, next) {
    try {
      const { parishId, context_type } = req.user;
      
      if (!parishId || context_type !== 'PARISH') {
        return res.status(403).json({
          message: 'Prohibido. No se ha establecido un contexto de parroquia válido para la sesión.'
        });
      }

      const chapel = await ChapelModel.create(parishId, req.body);

      res.status(200).json({
        message: 'Capilla creada exitosamente',
        data: chapel
      });
    } catch (error) {
      next(error);
    }
  }

  async search(req, res, next) {
    try {
      const { parishId, context_type } = req.user;
      
      if (!parishId || context_type !== 'PARISH') {
        return res.status(403).json({
          message: 'Prohibido. No se ha establecido un contexto de parroquia válido para la sesión.'
        });
      }

      const { page = 1, limit = 10, query = '' } = req.body;

      const result = await ChapelModel.findByParishId(parishId, Number(page), Number(limit), query);

      res.status(200).json({
        message: 'Lista de capillas obtenida exitosamente',
        data: result.data,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { parishId, context_type } = req.user;
      const { id } = req.params;
      
      if (!parishId || context_type !== 'PARISH') {
        return res.status(403).json({
          message: 'Prohibido. No se ha establecido un contexto de parroquia válido para la sesión.'
        });
      }

      const chapel = await ChapelModel.findById(Number(id), parishId);

      if (!chapel) {
        return res.status(404).json({
          message: 'Capilla no encontrada'
        });
      }

      res.status(200).json({
        message: 'Capilla obtenida exitosamente',
        data: chapel
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { parishId, context_type } = req.user;
      const { id } = req.params;
      
      if (!parishId || context_type !== 'PARISH') {
        return res.status(403).json({
          message: 'Prohibido. No se ha establecido un contexto de parroquia válido para la sesión.'
        });
      }

      const chapel = await ChapelModel.update(Number(id), parishId, req.body);

      if (!chapel) {
        return res.status(404).json({
          message: 'Capilla no encontrada'
        });
      }

      res.status(200).json({
        message: 'Capilla actualizada exitosamente',
        data: chapel
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { parishId, context_type } = req.user;
      const { id } = req.params;
      const { active } = req.body;
      
      if (!parishId || context_type !== 'PARISH') {
        return res.status(403).json({
          message: 'Prohibido. No se ha establecido un contexto de parroquia válido para la sesión.'
        });
      }

      const chapel = await ChapelModel.updateStatus(Number(id), parishId, active);

      if (!chapel) {
        return res.status(404).json({
          message: 'Capilla no encontrada'
        });
      }

      res.status(200).json({
        message: 'Estado actualizado exitosamente',
        data: chapel
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { parishId, context_type } = req.user;
      const { id } = req.params;
      
      if (!parishId || context_type !== 'PARISH') {
        return res.status(403).json({
          message: 'Prohibido. No se ha establecido un contexto de parroquia válido para la sesión.'
        });
      }

      await ChapelModel.delete(Number(id), parishId);

      res.status(200).json({
        message: 'Capilla eliminada exitosamente',
        data: {}
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ChapelController();
