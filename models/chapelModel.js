const db = require('../db');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises;

class ChapelModel {
  static async create(parishId, data) {
    const { name, address, coordinates, phone, email, profile_photo, profile_photo_name, cover_photo, cover_photo_name } = data;
    
    let profilePhotoFilename = null;
    let coverPhotoFilename = null;
    
    // Procesar foto de perfil
    if (profile_photo) {
      const extension = path.extname(profile_photo_name || profile_photo.originalname);
      profilePhotoFilename = crypto.randomBytes(6).toString('hex') + extension;
      
      const uploadDir = path.join(__dirname, '..', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(path.join(uploadDir, profilePhotoFilename), profile_photo.buffer);
    }
    
    // Procesar foto de portada
    if (cover_photo) {
      const extension = path.extname(cover_photo_name || cover_photo.originalname);
      coverPhotoFilename = crypto.randomBytes(6).toString('hex') + extension;
      
      const uploadDir = path.join(__dirname, '..', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(path.join(uploadDir, coverPhotoFilename), cover_photo.buffer);
    }
    
    const query = `
      INSERT INTO public.chapel (
        id, parish_id, name, coordinates, address, email, phone, 
        profile_photo, cover_photo, chapel_base, active, created_at, updated_at
      )
      VALUES (
        (SELECT COALESCE(MAX(id), 0) + 1 FROM public.chapel),
        $1, $2, $3, $4, $5, $6, $7, $8, false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING id, parish_id, name, coordinates, address, email, phone, profile_photo, cover_photo, active
    `;
    
    const result = await db.query(query, [
      parishId, name, coordinates || '', address, email || '', phone, 
      profilePhotoFilename, coverPhotoFilename
    ]);
    
    return result.rows[0];
  }

  static async findByParishId(parishId, page = 1, limit = 10, searchQuery = '') {
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT id, name, coordinates, address, email, phone, profile_photo, cover_photo, active, chapel_base
      FROM public.chapel
      WHERE parish_id = $1
    `;
    
    const params = [parishId];
    
    if (searchQuery) {
      query += ` AND (name ILIKE $2 OR address ILIKE $2)`;
      params.push(`%${searchQuery}%`);
    }
    
    query += ` ORDER BY chapel_base, id LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const countQuery = `
      SELECT COUNT(*) 
      FROM public.chapel 
      WHERE parish_id = $1
      ${searchQuery ? 'AND (name ILIKE $2 OR address ILIKE $2)' : ''}
    `;
    
    const [dataResult, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, searchQuery ? [parishId, `%${searchQuery}%`] : [parishId])
    ]);
    
    return {
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    };
  }

  static async findById(id, parishId) {
    const query = `
      SELECT id, parish_id, name, coordinates, address, email, phone, profile_photo, cover_photo, active, chapel_base
      FROM public.chapel
      WHERE id = $1 AND parish_id = $2
    `;
    
    const result = await db.query(query, [id, parishId]);
    return result.rows[0];
  }

  static async update(id, parishId, data) {
    const { profile_photo, profile_photo_name, cover_photo, cover_photo_name } = data;
    
    const fields = [];
    const values = [];
    let index = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${index++}`);
      values.push(data.name);
    }
    if (data.address !== undefined) {
      fields.push(`address = $${index++}`);
      values.push(data.address);
    }
    if (data.coordinates !== undefined) {
      fields.push(`coordinates = $${index++}`);
      values.push(data.coordinates);
    }
    if (data.phone !== undefined) {
      fields.push(`phone = $${index++}`);
      values.push(data.phone);
    }
    if (data.email !== undefined) {
      fields.push(`email = $${index++}`);
      values.push(data.email);
    }
    
    // Procesar foto de perfil
    if (profile_photo) {
      const extension = path.extname(profile_photo_name || profile_photo.originalname);
      const profilePhotoFilename = crypto.randomBytes(6).toString('hex') + extension;
      
      const uploadDir = path.join(__dirname, '..', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(path.join(uploadDir, profilePhotoFilename), profile_photo.buffer);
      
      fields.push(`profile_photo = $${index++}`);
      values.push(profilePhotoFilename);
    }
    
    // Procesar foto de portada
    if (cover_photo) {
      const extension = path.extname(cover_photo_name || cover_photo.originalname);
      const coverPhotoFilename = crypto.randomBytes(6).toString('hex') + extension;
      
      const uploadDir = path.join(__dirname, '..', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(path.join(uploadDir, coverPhotoFilename), cover_photo.buffer);
      
      fields.push(`cover_photo = $${index++}`);
      values.push(coverPhotoFilename);
    }

    if (fields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    values.push(id, parishId);

    const query = `
      UPDATE public.chapel
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${index++} AND parish_id = $${index++}
      RETURNING id, parish_id, name, coordinates, address, email, phone, profile_photo, cover_photo, active
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async updateStatus(id, parishId, active) {
    const query = `
      UPDATE public.chapel
      SET active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND parish_id = $3
      RETURNING id, parish_id, name, address, email, phone, profile_photo, cover_photo, active
    `;

    const result = await db.query(query, [active, id, parishId]);
    return result.rows[0];
  }

  static async delete(id, parishId) {
    const checkQuery = `
      SELECT chapel_base FROM public.chapel WHERE id = $1 AND parish_id = $2
    `;
    const checkResult = await db.query(checkQuery, [id, parishId]);
    
    if (!checkResult.rows[0]) {
      throw new Error('Capilla no encontrada');
    }
    
    if (checkResult.rows[0].chapel_base) {
      throw new Error('No se puede eliminar la capilla base de la parroquia');
    }

    const reservationCheckQuery = `
      SELECT COUNT(*) as count
      FROM public.reservation r
      INNER JOIN public.event_variant ev ON r.event_variant_id = ev.id
      INNER JOIN public.chapel_event ce ON ev.chapel_event_id = ce.id
      WHERE ce.chapel_id = $1 
        AND r.status IN ('RESERVED', 'IN_PROGRESS')
    `;
    const reservationResult = await db.query(reservationCheckQuery, [id]);
    const reservationCount = parseInt(reservationResult.rows[0].count);

    if (reservationCount > 0) {
      throw new Error('No se puede eliminar la capilla porque tiene reservas activas (reservadas o en progreso)');
    }

    const query = `DELETE FROM public.chapel WHERE id = $1 AND parish_id = $2 RETURNING id`;
    const result = await db.query(query, [id, parishId]);
    return result.rows[0];
  }
}

module.exports = ChapelModel;
