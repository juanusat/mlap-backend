const MentionTypeModel = require('../models/mentionTypeDioceseModel');

class MentionTypeDioceseService {
  async listMentionTypes(page, limit) {
    const offset = (page - 1) * limit;
    const result = await MentionTypeModel.listAll(limit, offset);
    const total = await MentionTypeModel.count();
    
    return {
      data: result,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async searchMentionTypes(searchTerm, page, limit) {
    const offset = (page - 1) * limit;
    const result = await MentionTypeModel.search(searchTerm, limit, offset);
    const total = await MentionTypeModel.countSearch(searchTerm);
    
    return {
      data: result,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async createMentionType(data) {
    // Verificar si el código ya existe
    const existing = await MentionTypeModel.findByCode(data.code);
    if (existing) {
      throw new Error('Ya existe un tipo de mención con ese código');
    }

    return await MentionTypeModel.create(data);
  }

  async updateMentionType(id, data) {
    const existing = await MentionTypeModel.findById(id);
    if (!existing) {
      throw new Error('Tipo de mención no encontrado');
    }

    // Verificar si el código ya existe en otro registro
    const codeExists = await MentionTypeModel.findByCode(data.code);
    if (codeExists && codeExists.id !== id) {
      throw new Error('Ya existe un tipo de mención con ese código');
    }

    return await MentionTypeModel.update(id, data);
  }

  async deleteMentionType(id) {
    const existing = await MentionTypeModel.findById(id);
    if (!existing) {
      throw new Error('Tipo de mención no encontrado');
    }

    // Verificar si tiene menciones asociadas
    const hasReservations = await MentionTypeModel.hasReservationMentions(id);
    if (hasReservations) {
      throw new Error('No se puede eliminar porque tiene menciones asociadas a reservas');
    }

    return await MentionTypeModel.delete(id);
  }

  async updateMentionTypeStatus(id, active) {
    const existing = await MentionTypeModel.findById(id);
    if (!existing) {
      throw new Error('Tipo de mención no encontrado');
    }

    return await MentionTypeModel.updateStatus(id, active);
  }
}

module.exports = new MentionTypeDioceseService();
