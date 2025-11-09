const MentionTypeModel = require('../models/mentionTypeModel');

/**
 * Obtener lista de tipos de mención activos
 * @returns {Array} Lista de tipos de mención
 */
const listMentionTypes = async () => {
  try {
    const mentionTypes = await MentionTypeModel.listMentionTypes();
    return mentionTypes;
  } catch (error) {
    console.error('[mentionTypeService] Error al obtener tipos de mención:', error);
    throw new Error('No se pudieron obtener los tipos de mención');
  }
};

module.exports = {
  listMentionTypes
};
