const eventService = require('../services/eventService');

class EventController {
  async create(req, res, next) {
    try {
      const data = await eventService.createEvent(req.body);
      res.status(200).json({
        message: 'Evento creado exitosamente',
        data,
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }

  async listForSelect(req, res, next) {
    try {
      const data = await eventService.listEventsForSelect();
      res.status(200).json({
        message: 'Lista de eventos obtenida exitosamente',
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
      const { page = 1, limit = 10 } = req.body;
      const result = await eventService.listEvents(Number(page), Number(limit));
      res.status(200).json({
        message: 'Lista de eventos obtenida exitosamente',
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
      const { query, page = 1, limit = 10 } = req.body;
      const result = await eventService.searchEvents(query, Number(page), Number(limit));
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
      const { id } = req.params;
      const data = await eventService.getEventById(Number(id));
      res.status(200).json({
        message: 'Evento obtenido exitosamente',
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
      const { id } = req.params;
      const data = await eventService.updateEvent(Number(id), req.body);
      res.status(200).json({
        message: 'Evento actualizado exitosamente',
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
      const { id } = req.params;
      const data = await eventService.partialUpdateEvent(Number(id), req.body);
      res.status(200).json({
        message: 'Evento actualizado exitosamente',
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
      const { id } = req.params;
      const { active } = req.body;
      const data = await eventService.updateEventStatus(Number(id), active);
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
      const { id } = req.params;
      await eventService.deleteEvent(Number(id));
      res.status(200).json({
        message: 'Evento eliminado exitosamente',
        data: {},
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EventController();
