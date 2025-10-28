const DocumentTypeModel = require('../models/documentTypeModel');

class DocumentTypeService {
  async createDocumentType(data) {
    const { name, description, code } = data;

    if (!name || !description || !code) {
      throw new Error('Todos los campos son requeridos');
    }

    return await DocumentTypeModel.create({ name, description, code });
  }

  async listDocumentTypes(page = 1, limit = 10) {
    return await DocumentTypeModel.findAll(page, limit);
  }

  async searchDocumentTypes(query, page = 1, limit = 10) {
    if (!query) {
      throw new Error('El término de búsqueda es requerido');
    }

    return await DocumentTypeModel.search(query, page, limit);
  }

  async getDocumentTypeById(id) {
    const documentType = await DocumentTypeModel.findById(id);
    
    if (!documentType) {
      throw new Error('Tipo de documento no encontrado');
    }

    return documentType;
  }

  async updateDocumentType(id, data) {
    const { name, description, code } = data;

    if (!name || !description || !code) {
      throw new Error('Todos los campos son requeridos');
    }

    const documentType = await DocumentTypeModel.update(id, { name, description, code });
    
    if (!documentType) {
      throw new Error('Tipo de documento no encontrado');
    }

    return documentType;
  }

  async partialUpdateDocumentType(id, data) {
    const documentType = await DocumentTypeModel.partialUpdate(id, data);
    
    if (!documentType) {
      throw new Error('Tipo de documento no encontrado');
    }

    return documentType;
  }

  async updateDocumentTypeStatus(id, active) {
    if (typeof active !== 'boolean') {
      throw new Error('El estado debe ser un valor booleano');
    }

    const documentType = await DocumentTypeModel.updateStatus(id, active);
    
    if (!documentType) {
      throw new Error('Tipo de documento no encontrado');
    }

    return documentType;
  }

  async deleteDocumentType(id) {
    const documentType = await DocumentTypeModel.delete(id);
    
    if (!documentType) {
      throw new Error('Tipo de documento no encontrado');
    }

    return documentType;
  }
}

module.exports = new DocumentTypeService();
