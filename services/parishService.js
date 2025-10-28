const ParishModel = require('../models/parishModel');
const crypto = require('crypto');

class ParishService {
  async createParish(data) {
    const { name, email, username, password } = data;

    if (!name || !email || !username || !password) {
      throw new Error('Todos los campos son requeridos');
    }

    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    return await ParishModel.create({ name, email, username, passwordHash });
  }

  async listParishes(page = 1, limit = 10) {
    return await ParishModel.findAll(page, limit);
  }

  async searchParishes(query, page = 1, limit = 10) {
    if (!query) {
      throw new Error('El término de búsqueda es requerido');
    }

    return await ParishModel.search(query, page, limit);
  }

  async getParishById(id) {
    const parish = await ParishModel.findById(id);
    
    if (!parish) {
      throw new Error('Parroquia no encontrada');
    }

    return parish;
  }

  async updateParish(id, data) {
    const { name, email, username } = data;

    if (!name || !email || !username) {
      throw new Error('Todos los campos son requeridos');
    }

    const parish = await ParishModel.update(id, { name, email, username });
    
    if (!parish) {
      throw new Error('Parroquia no encontrada');
    }

    return parish;
  }

  async partialUpdateParish(id, data) {
    const parish = await ParishModel.partialUpdate(id, data);
    
    if (!parish) {
      throw new Error('Parroquia no encontrada');
    }

    return parish;
  }

  async updateParishStatus(id, active) {
    if (typeof active !== 'boolean') {
      throw new Error('El estado debe ser un valor booleano');
    }

    const parish = await ParishModel.updateStatus(id, active);
    
    if (!parish) {
      throw new Error('Parroquia no encontrada');
    }

    return parish;
  }

  async deleteParish(id) {
    const parish = await ParishModel.delete(id);
    
    if (!parish) {
      throw new Error('Parroquia no encontrada');
    }

    return parish;
  }
}

module.exports = new ParishService();
