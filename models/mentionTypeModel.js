const db = require('../db');

class MentionTypeModel {
  /**
   * Obtener todos los tipos de mención activos
   * @returns {Array} Lista de tipos de mención
   */
  static async listMentionTypes() {
    const query = `
      SELECT 
        id,
        code,
        name,
        description
      FROM public.mention_type
      WHERE active = true
      ORDER BY name
    `;
    const result = await db.query(query);
    return result.rows;
  }
}

module.exports = MentionTypeModel;
