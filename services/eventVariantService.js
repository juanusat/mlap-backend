const eventVariantModel = require('../models/eventVariantModel');

class EventVariantService {
  async listEventVariants(parishId, page, limit) {
    if (!parishId) {
      throw new Error('ID de parroquia es requerido');
    }
    
    const result = await eventVariantModel.listEventVariants(parishId, page, limit);
    const totalPages = Math.ceil(result.total / limit);
    
    return {
      data: result.data,
      total: result.total,
      page,
      limit,
      totalPages
    };
  }

  async searchEventVariants(parishId, search, page, limit) {
    if (!parishId) {
      throw new Error('ID de parroquia es requerido');
    }
    
    if (!search || search.trim() === '') {
      throw new Error('El término de búsqueda es requerido');
    }
    
    const result = await eventVariantModel.searchEventVariants(parishId, search, page, limit);
    const totalPages = Math.ceil(result.total / limit);
    
    return {
      data: result.data,
      total: result.total,
      page,
      limit,
      totalPages
    };
  }

  async getEventVariantById(id, parishId) {
    if (!id) {
      throw new Error('ID de variante es requerido');
    }
    
    if (!parishId) {
      throw new Error('ID de parroquia es requerido');
    }
    
    const variant = await eventVariantModel.getEventVariantById(id, parishId);
    
    if (!variant) {
      throw new Error('Variante de evento no encontrada');
    }
    
    return variant;
  }

  async createEventVariant(parishId, variantData) {
    if (!parishId) {
      throw new Error('ID de parroquia es requerido');
    }
    
    if (!variantData.event_id) {
      throw new Error('ID de evento es requerido');
    }
    
    if (!variantData.chapel_id) {
      throw new Error('ID de capilla es requerido');
    }
    
    if (!variantData.name || variantData.name.trim() === '') {
      throw new Error('El nombre es requerido');
    }
    
    if (!variantData.event_type || !['PRIVATE', 'COMUNITY'].includes(variantData.event_type)) {
      throw new Error('El tipo de evento debe ser PRIVATE o COMUNITY');
    }
    
    if (variantData.event_type === 'COMUNITY' && (!variantData.max_capacity || variantData.max_capacity < 2)) {
      throw new Error('La capacidad máxima debe ser mayor a 1 para eventos comunitarios');
    }
    
    const result = await eventVariantModel.createEventVariant(
      parishId,
      variantData.event_id,
      variantData.chapel_id,
      variantData
    );
    
    return result;
  }

  async updateEventVariant(id, parishId, variantData) {
    if (!id) {
      throw new Error('ID de variante es requerido');
    }
    
    if (!parishId) {
      throw new Error('ID de parroquia es requerido');
    }
    
    if (!variantData.event_id) {
      throw new Error('ID de evento es requerido');
    }
    
    if (!variantData.chapel_id) {
      throw new Error('ID de capilla es requerido');
    }
    
    if (!variantData.name || variantData.name.trim() === '') {
      throw new Error('El nombre es requerido');
    }
    
    if (!variantData.event_type || !['PRIVATE', 'COMUNITY'].includes(variantData.event_type)) {
      throw new Error('El tipo de evento debe ser PRIVATE o COMUNITY');
    }
    
    if (variantData.event_type === 'COMUNITY' && (!variantData.max_capacity || variantData.max_capacity < 2)) {
      throw new Error('La capacidad máxima debe ser mayor a 1 para eventos comunitarios');
    }
    
    const result = await eventVariantModel.updateEventVariant(
      id,
      parishId,
      variantData.event_id,
      variantData.chapel_id,
      variantData
    );
    
    return result;
  }

  async partialUpdateEventVariant(id, parishId, updates) {
    if (!id) {
      throw new Error('ID de variante es requerido');
    }
    
    if (!parishId) {
      throw new Error('ID de parroquia es requerido');
    }
    
    const result = await eventVariantModel.partialUpdateEventVariant(id, parishId, updates);
    return result;
  }

  async deleteEventVariant(id, parishId) {
    if (!id) {
      throw new Error('ID de variante es requerido');
    }
    
    if (!parishId) {
      throw new Error('ID de parroquia es requerido');
    }
    
    const result = await eventVariantModel.deleteEventVariant(id, parishId);
    return result;
  }

  async listEventsBase() {
    const result = await eventVariantModel.listEventsBase();
    return result;
  }
}

module.exports = new EventVariantService();
