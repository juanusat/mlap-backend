const mentionTypeService = require('../services/mentionTypeDioceseService');

/**
 * Listar tipos de mención con paginación
 */
async function listMentionTypes(req, res, next) {
  try {
    const { page = 1, limit = 100 } = req.body;
    
    const result = await mentionTypeService.listMentionTypes(Number(page), Number(limit));
    
    res.status(200).json({
      success: true,
      message: 'Tipos de mención obtenidos exitosamente',
      data: result.data,
      meta: result.meta
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Buscar tipos de mención
 */
async function searchMentionTypes(req, res, next) {
  try {
    const { search, page = 1, limit = 100 } = req.body;
    
    if (!search || search.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El término de búsqueda es requerido',
        data: null
      });
    }
    
    const result = await mentionTypeService.searchMentionTypes(search, Number(page), Number(limit));
    
    res.status(200).json({
      success: true,
      message: 'Búsqueda completada exitosamente',
      data: result.data,
      meta: result.meta
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Crear un nuevo tipo de mención
 */
async function createMentionType(req, res, next) {
  try {
    const { name, code, description } = req.body;
    
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'El nombre y código son requeridos',
        data: null
      });
    }
    
    const mentionType = await mentionTypeService.createMentionType({
      name,
      code,
      description: description || null
    });
    
    res.status(201).json({
      success: true,
      message: 'Tipo de mención creado exitosamente',
      data: mentionType
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Actualizar un tipo de mención
 */
async function updateMentionType(req, res, next) {
  try {
    const { id } = req.params;
    const { name, code, description } = req.body;
    
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'El nombre y código son requeridos',
        data: null
      });
    }
    
    const mentionType = await mentionTypeService.updateMentionType(Number(id), {
      name,
      code,
      description: description || null
    });
    
    res.status(200).json({
      success: true,
      message: 'Tipo de mención actualizado exitosamente',
      data: mentionType
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Eliminar un tipo de mención
 */
async function deleteMentionType(req, res, next) {
  try {
    const { id } = req.params;
    
    await mentionTypeService.deleteMentionType(Number(id));
    
    res.status(200).json({
      success: true,
      message: 'Tipo de mención eliminado exitosamente',
      data: null
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Actualizar estado de un tipo de mención
 */
async function updateMentionTypeStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { active } = req.body;
    
    if (typeof active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'El estado activo debe ser un valor booleano',
        data: null
      });
    }
    
    const mentionType = await mentionTypeService.updateMentionTypeStatus(Number(id), active);
    
    res.status(200).json({
      success: true,
      message: `Tipo de mención ${active ? 'activado' : 'desactivado'} exitosamente`,
      data: mentionType
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listMentionTypes,
  searchMentionTypes,
  createMentionType,
  updateMentionType,
  deleteMentionType,
  updateMentionTypeStatus
};
