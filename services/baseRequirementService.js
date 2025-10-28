const BaseRequirementModel = require('../models/baseRequirementModel');

class BaseRequirementService {
  async createRequirement(eventId, data) {
    const { name, description } = data;

    if (!name) {
      throw new Error('El nombre del requisito es requerido');
    }

    return await BaseRequirementModel.create(eventId, { name, description });
  }

  async listRequirements(eventId, page = 1, limit = 10) {
    return await BaseRequirementModel.findAll(eventId, page, limit);
  }

  async searchRequirements(eventId, query, page = 1, limit = 10) {
    if (!query) {
      throw new Error('El término de búsqueda es requerido');
    }

    return await BaseRequirementModel.search(eventId, query, page, limit);
  }

  async getRequirementById(eventId, id) {
    const requirement = await BaseRequirementModel.findById(eventId, id);
    
    if (!requirement) {
      throw new Error('Requisito no encontrado');
    }

    return requirement;
  }

  async updateRequirement(eventId, id, data) {
    const { name, description } = data;

    if (!name) {
      throw new Error('El nombre del requisito es requerido');
    }

    const requirement = await BaseRequirementModel.update(eventId, id, { name, description });
    
    if (!requirement) {
      throw new Error('Requisito no encontrado');
    }

    return requirement;
  }

  async partialUpdateRequirement(eventId, id, data) {
    const requirement = await BaseRequirementModel.partialUpdate(eventId, id, data);
    
    if (!requirement) {
      throw new Error('Requisito no encontrado');
    }

    return requirement;
  }

  async updateRequirementStatus(eventId, id, active) {
    if (typeof active !== 'boolean') {
      throw new Error('El estado debe ser un valor booleano');
    }

    const requirement = await BaseRequirementModel.updateStatus(eventId, id, active);
    
    if (!requirement) {
      throw new Error('Requisito no encontrado');
    }

    return requirement;
  }

  async deleteRequirement(eventId, id) {
    const requirement = await BaseRequirementModel.delete(eventId, id);
    
    if (!requirement) {
      throw new Error('Requisito no encontrado');
    }

    return requirement;
  }
}

module.exports = new BaseRequirementService();
