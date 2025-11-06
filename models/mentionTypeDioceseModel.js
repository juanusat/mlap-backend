const db = require('../db');

class MentionTypeDioceseModel {
  /**
   * Listar todos los tipos de mención con paginación
   */
  static async listAll(limit, offset) {
    const query = `
      SELECT 
        id,
        code,
        name,
        description,
        active,
        created_at
      FROM public.mention_type
      ORDER BY name ASC
      LIMIT $1 OFFSET $2
    `;
    const result = await db.query(query, [limit, offset]);
    return result.rows;
  }

  /**
   * Contar total de tipos de mención
   */
  static async count() {
    const query = 'SELECT COUNT(*) as total FROM public.mention_type';
    const result = await db.query(query);
    return parseInt(result.rows[0].total);
  }

  /**
   * Buscar tipos de mención
   */
  static async search(searchTerm, limit, offset) {
    const query = `
      SELECT 
        id,
        code,
        name,
        description,
        active,
        created_at
      FROM public.mention_type
      WHERE 
        name ILIKE $1 OR 
        code ILIKE $1 OR 
        description ILIKE $1
      ORDER BY name ASC
      LIMIT $2 OFFSET $3
    `;
    const result = await db.query(query, [`%${searchTerm}%`, limit, offset]);
    return result.rows;
  }

  /**
   * Contar resultados de búsqueda
   */
  static async countSearch(searchTerm) {
    const query = `
      SELECT COUNT(*) as total 
      FROM public.mention_type
      WHERE 
        name ILIKE $1 OR 
        code ILIKE $1 OR 
        description ILIKE $1
    `;
    const result = await db.query(query, [`%${searchTerm}%`]);
    return parseInt(result.rows[0].total);
  }

  /**
   * Buscar tipo de mención por ID
   */
  static async findById(id) {
    const query = `
      SELECT 
        id,
        code,
        name,
        description,
        active,
        created_at
      FROM public.mention_type
      WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Buscar tipo de mención por código
   */
  static async findByCode(code) {
    const query = `
      SELECT 
        id,
        code,
        name,
        description,
        active
      FROM public.mention_type
      WHERE UPPER(code) = UPPER($1)
    `;
    const result = await db.query(query, [code]);
    return result.rows[0];
  }

  /**
   * Crear un nuevo tipo de mención
   */
  static async create(data) {
    const query = `
      INSERT INTO public.mention_type (
        id,
        code,
        name,
        description,
        active,
        created_at
      ) VALUES (
        (SELECT COALESCE(MAX(id), 0) + 1 FROM public.mention_type),
        $1,
        $2,
        $3,
        TRUE,
        CURRENT_TIMESTAMP
      )
      RETURNING id, code, name, description, active, created_at
    `;
    const result = await db.query(query, [
      data.code,
      data.name,
      data.description
    ]);
    return result.rows[0];
  }

  /**
   * Actualizar un tipo de mención
   */
  static async update(id, data) {
    const query = `
      UPDATE public.mention_type
      SET 
        code = $1,
        name = $2,
        description = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, code, name, description, active, created_at
    `;
    const result = await db.query(query, [
      data.code,
      data.name,
      data.description,
      id
    ]);
    return result.rows[0];
  }

  /**
   * Eliminar un tipo de mención
   */
  static async delete(id) {
    const query = 'DELETE FROM public.mention_type WHERE id = $1';
    await db.query(query, [id]);
    return true;
  }

  /**
   * Actualizar el estado de un tipo de mención
   */
  static async updateStatus(id, active) {
    const query = `
      UPDATE public.mention_type
      SET 
        active = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, code, name, description, active, created_at
    `;
    const result = await db.query(query, [active, id]);
    return result.rows[0];
  }

  /**
   * Verificar si tiene menciones asociadas a reservas
   */
  static async hasReservationMentions(id) {
    const query = `
      SELECT EXISTS(
        SELECT 1 
        FROM public.reservation_mention 
        WHERE mention_type_id = $1
      ) as has_mentions
    `;
    const result = await db.query(query, [id]);
    return result.rows[0].has_mentions;
  }
}

module.exports = MentionTypeDioceseModel;
