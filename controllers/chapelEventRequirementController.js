const chapelEventRequirementService = require('../services/chapelEventRequirementService');

class ChapelEventRequirementController {
  async getRequirementsByEventVariant(req, res, next) {
    try {
      const { eventVariantId } = req.params;
      const parishId = req.user.parishId;
      
      const requirements = await chapelEventRequirementService.getRequirementsByEventVariant(
        eventVariantId,
        parishId
      );
      
      res.status(200).json({
        message: 'Requisitos obtenidos exitosamente',
        data: requirements,
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
      const { chapel_event_id, name, description } = req.body;
      
      const result = await chapelEventRequirementService.createChapelEventRequirement(
        chapel_event_id,
        parishId,
        { name, description }
      );
      
      res.status(201).json({
        message: 'Requisito adicional creado exitosamente',
        data: result,
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const parishId = req.user.parishId;
      
      const requirement = await chapelEventRequirementService.getChapelEventRequirementById(id, parishId);
      
      res.status(200).json({
        message: 'Requisito obtenido exitosamente',
        data: requirement,
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
      const { name, description } = req.body;
      
      const result = await chapelEventRequirementService.updateChapelEventRequirement(
        id,
        parishId,
        { name, description }
      );
      
      res.status(200).json({
        message: 'Requisito actualizado exitosamente',
        data: result,
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
      const parishId = req.user.parishId;
      const { active } = req.body;
      
      const result = await chapelEventRequirementService.updateChapelEventRequirementStatus(
        id,
        parishId,
        active
      );
      
      res.status(200).json({
        message: 'Estado del requisito actualizado exitosamente',
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
      
      const result = await chapelEventRequirementService.deleteChapelEventRequirement(id, parishId);
      
      res.status(200).json({
        message: 'Requisito eliminado exitosamente',
        data: result,
        error: '',
        traceback: ''
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ChapelEventRequirementController();
