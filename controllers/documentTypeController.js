const documentTypeService = require('../services/documentTypeService');

class DocumentTypeController {
  async listActive(req, res, next) {
    try {
      const data = await documentTypeService.listActiveDocumentTypes();
      res.status(200).json({
        message: 'Lista de tipos de documentos activos obtenida exitosamente',
        data,
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const data = await documentTypeService.createDocumentType(req.body);
      res.status(200).json({
        message: 'Tipo de documento creado exitosamente',
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
      const result = await documentTypeService.listDocumentTypes(Number(page), Number(limit));
      res.status(200).json({
        message: 'Lista de tipos de documentos obtenida exitosamente',
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

  // Public list endpoint (no auth) to allow frontend registration page to fetch document types
  async publicList(req, res, next) {
    try {
      // default to first page and a generous limit
      const result = await documentTypeService.listDocumentTypes(1, 100);
      const types = result && result.data ? result.data : [];
      res.status(200).json({
        message: 'Lista pública de tipos de documentos obtenida exitosamente',
        data: types,
        error: null,
        traceback: null
      });
    } catch (error) {
      next(error);
    }
  }

  async search(req, res, next) {
    try {
      const { query, page = 1, limit = 10 } = req.body;
      const result = await documentTypeService.searchDocumentTypes(query, Number(page), Number(limit));
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
      const data = await documentTypeService.getDocumentTypeById(Number(id));
      res.status(200).json({
        message: 'Tipo de documento obtenido exitosamente',
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
      const data = await documentTypeService.updateDocumentType(Number(id), req.body);
      res.status(200).json({
        message: 'Tipo de documento actualizado exitosamente',
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
      const data = await documentTypeService.partialUpdateDocumentType(Number(id), req.body);
      res.status(200).json({
        message: 'Tipo de documento actualizado exitosamente',
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
      const data = await documentTypeService.updateDocumentTypeStatus(Number(id), active);
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
      await documentTypeService.deleteDocumentType(Number(id));
      res.status(200).json({
        message: 'Tipo de documento eliminado exitosamente',
        data: {},
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DocumentTypeController();
