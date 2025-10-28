const parishService = require('../services/parishService');

class DioceseParishController {
  async create(req, res, next) {
    try {
      const data = await parishService.createParish(req.body);
      res.status(200).json({
        message: 'Parroquia creada exitosamente',
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
      const result = await parishService.listParishes(Number(page), Number(limit));
      res.status(200).json({
        message: 'Lista de parroquias obtenida exitosamente',
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
      const result = await parishService.searchParishes(query, Number(page), Number(limit));
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
      const data = await parishService.getParishById(Number(id));
      res.status(200).json({
        message: 'Parroquia obtenida exitosamente',
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
      const data = await parishService.updateParish(Number(id), req.body);
      res.status(200).json({
        message: 'Parroquia actualizada exitosamente',
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
      const data = await parishService.partialUpdateParish(Number(id), req.body);
      res.status(200).json({
        message: 'Parroquia actualizada exitosamente',
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
      const data = await parishService.updateParishStatus(Number(id), active);
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
      await parishService.deleteParish(Number(id));
      res.status(200).json({
        message: 'Parroquia eliminada exitosamente',
        data: {},
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DioceseParishController();
