const mentionTypeService = require('../services/mentionTypeService');

/**
 * Obtener lista de tipos de mención activos
 */
async function listMentionTypes(req, res, next) {
  try {
    const mentionTypes = await mentionTypeService.listMentionTypes();
    
    res.status(200).json({
      success: true,
      message: 'Tipos de mención obtenidos exitosamente',
      data: mentionTypes
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listMentionTypes
};
