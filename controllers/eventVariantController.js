const eventVariantService = require('../services/eventVariantService');

class EventVariantController {
  async list(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.body;
      const parishId = req.user.parishId;
      
      const result = await eventVariantService.listEventVariants(
        parishId,
        Number(page),
        Number(limit)
      );
      
      res.status(200).json({
        message: 'Lista de variantes obtenida exitosamente',
        data: result.data,
        error: '',
        traceback: '',
        meta: {
          total_records: result.total,
          total_pages: result.totalPages,
          current_page: result.page,
          per_page: result.limit
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async search(req, res, next) {
    try {
      const { search, page = 1, limit = 10 } = req.body;
      const parishId = req.user.parishId;
      
      const result = await eventVariantService.searchEventVariants(
        parishId,
        search,
        Number(page),
        Number(limit)
      );
      
      res.status(200).json({
        message: 'Búsqueda completada exitosamente',
        data: result.data,
        error: '',
        traceback: '',
        meta: {
          total_records: result.total,
          total_pages: result.totalPages,
          current_page: result.page,
          per_page: result.limit
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const parishId = req.user.parishId;
      
      const variant = await eventVariantService.getEventVariantById(id, parishId);
      
      res.status(200).json({
        message: 'Variante obtenida exitosamente',
        data: variant,
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const parishId = req.user.parishId;
      const variantData = req.body;
      
      const result = await eventVariantService.createEventVariant(parishId, variantData);
      
      res.status(201).json({
        message: 'Variante de evento creada exitosamente',
        data: result,
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const parishId = req.user.parishId;
      const variantData = req.body;
      
      const result = await eventVariantService.updateEventVariant(id, parishId, variantData);
      
      res.status(200).json({
        message: 'Variante de evento actualizada exitosamente',
        data: result,
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }

  async partialUpdate(req, res, next) {
    try {
      const { id } = req.params;
      const parishId = req.user.parishId;
      const updates = req.body;
      
      const result = await eventVariantService.partialUpdateEventVariant(id, parishId, updates);
      
      res.status(200).json({
        message: 'Variante de evento actualizada exitosamente',
        data: result,
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const parishId = req.user.parishId;
      
      const result = await eventVariantService.deleteEventVariant(id, parishId);
      
      res.status(200).json({
        message: 'Variante de evento eliminada exitosamente',
        data: result,
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }

  async listEventsBase(req, res, next) {
    try {
      const result = await eventVariantService.listEventsBase();
      
      res.status(200).json({
        message: 'Catálogo de eventos base obtenido exitosamente',
        data: result,
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EventVariantController();
