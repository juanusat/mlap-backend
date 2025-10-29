const chapelEventRequirementModel = require('../models/chapelEventRequirementModel');

class ChapelEventRequirementService {
  async getRequirementsByEventVariant(eventVariantId, parishId) {
    if (!eventVariantId) {
      throw new Error('ID de variante de evento es requerido');
    }
    
    if (!parishId) {
      throw new Error('ID de parroquia es requerido');
    }
    
    return await chapelEventRequirementModel.getRequirementsByEventVariant(eventVariantId, parishId);
  }

  async createChapelEventRequirement(chapelEventId, parishId, data) {
    if (!chapelEventId) {
      throw new Error('ID de chapel event es requerido');
    }
    
    if (!parishId) {
      throw new Error('ID de parroquia es requerido');
    }
    
    if (!data.name || data.name.trim() === '') {
      throw new Error('El nombre del requisito es requerido');
    }
    
    if (!data.description || data.description.trim() === '') {
      throw new Error('La descripción del requisito es requerida');
    }
    
    return await chapelEventRequirementModel.createChapelEventRequirement(chapelEventId, parishId, data);
  }

  async getChapelEventRequirementById(id, parishId) {
    if (!id) {
      throw new Error('ID de requisito es requerido');
    }
    
    if (!parishId) {
      throw new Error('ID de parroquia es requerido');
    }
    
    const requirement = await chapelEventRequirementModel.getChapelEventRequirementById(id, parishId);
    
    if (!requirement) {
      throw new Error('Requisito no encontrado');
    }
    
    return requirement;
  }

  async updateChapelEventRequirement(id, parishId, data) {
    if (!id) {
      throw new Error('ID de requisito es requerido');
    }
    
    if (!parishId) {
      throw new Error('ID de parroquia es requerido');
    }
    
    if (!data.name || data.name.trim() === '') {
      throw new Error('El nombre del requisito es requerido');
    }
    
    if (!data.description || data.description.trim() === '') {
      throw new Error('La descripción del requisito es requerida');
    }
    
    return await chapelEventRequirementModel.updateChapelEventRequirement(id, parishId, data);
  }

  async updateChapelEventRequirementStatus(id, parishId, active) {
    if (!id) {
      throw new Error('ID de requisito es requerido');
    }
    
    if (!parishId) {
      throw new Error('ID de parroquia es requerido');
    }
    
    if (typeof active !== 'boolean') {
      throw new Error('El estado debe ser un valor booleano');
    }
    
    return await chapelEventRequirementModel.updateChapelEventRequirementStatus(id, parishId, active);
  }

  async deleteChapelEventRequirement(id, parishId) {
    if (!id) {
      throw new Error('ID de requisito es requerido');
    }
    
    if (!parishId) {
      throw new Error('ID de parroquia es requerido');
    }
    
    return await chapelEventRequirementModel.deleteChapelEventRequirement(id, parishId);
  }
}

module.exports = new ChapelEventRequirementService();
