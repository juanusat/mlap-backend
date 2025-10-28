const baseRequirementService = require('../services/baseRequirementService');

class BaseRequirementController {
  async create(req, res, next) {
    try {
      const { id: eventId } = req.params;
      const data = await baseRequirementService.createRequirement(Number(eventId), req.body);
      res.status(200).json({
        message: 'Requisito creado exitosamente',
        data,
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const { id: eventId } = req.params;
      const { page = 1, limit = 10 } = req.body;
      const result = await baseRequirementService.listRequirements(Number(eventId), Number(page), Number(limit));
      res.status(200).json({
        message: 'Lista de requisitos obtenida exitosamente',
        data: result.data,
        error: '',
        traceback: '',
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

  async search(req, res, next) {
    try {
      const { id: eventId } = req.params;
      const { query, page = 1, limit = 10 } = req.body;
      const result = await baseRequirementService.searchRequirements(Number(eventId), query, Number(page), Number(limit));
      res.status(200).json({
        message: 'Búsqueda completada exitosamente',
        data: result.data,
        error: '',
        traceback: '',
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
      const { event_id: eventId, id } = req.params;
      const data = await baseRequirementService.getRequirementById(Number(eventId), Number(id));
      res.status(200).json({
        message: 'Requisito obtenido exitosamente',
        data,
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { event_id: eventId, id } = req.params;
      const data = await baseRequirementService.updateRequirement(Number(eventId), Number(id), req.body);
      res.status(200).json({
        message: 'Requisito actualizado exitosamente',
        data,
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }

  async partialUpdate(req, res, next) {
    try {
      const { event_id: eventId, id } = req.params;
      const data = await baseRequirementService.partialUpdateRequirement(Number(eventId), Number(id), req.body);
      res.status(200).json({
        message: 'Requisito actualizado exitosamente',
        data,
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { event_id: eventId, id } = req.params;
      const { active } = req.body;
      const data = await baseRequirementService.updateRequirementStatus(Number(eventId), Number(id), active);
      res.status(200).json({
        message: 'Estado actualizado exitosamente',
        data,
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { event_id: eventId, id } = req.params;
      await baseRequirementService.deleteRequirement(Number(eventId), Number(id));
      res.status(200).json({
        message: 'Requisito eliminado exitosamente',
        data: {},
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BaseRequirementController();
