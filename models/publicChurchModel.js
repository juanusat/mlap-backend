const db = require('../db');

class PublicChurchModel {
  static async searchChurchLocations(query = '', page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    let searchQuery = `
      SELECT 
        c.id,
        c.name,
        c.address,
        c.coordinates,
        CASE 
          WHEN c.chapel_base = true THEN 'PARROQUIA'
          ELSE 'CAPILLA'
        END as type
      FROM public.chapel c
      WHERE c.active = true
    `;
    
    const params = [];
    
    if (query && query.trim() !== '') {
      searchQuery += ` AND (c.name ILIKE $1 OR c.address ILIKE $1)`;
      params.push(`%${query}%`);
    }
    
    searchQuery += ` ORDER BY c.chapel_base DESC, c.id LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM public.chapel c
      WHERE c.active = true
      ${query && query.trim() !== '' ? 'AND (c.name ILIKE $1 OR c.address ILIKE $1)' : ''}
    `;
    
    const countParams = query && query.trim() !== '' ? [`%${query}%`] : [];
    
    const [results, countResult] = await Promise.all([
      db.query(searchQuery, params),
      db.query(countQuery, countParams)
    ]);
    
    return {
      locations: results.rows,
      total: parseInt(countResult.rows[0].total)
    };
  }

  static async getParishWithChapels(parishId) {
    const parishQuery = `
      SELECT 
        c.id,
        c.name,
        c.address,
        c.coordinates,
        'PARROQUIA' as type
      FROM public.chapel c
      WHERE c.parish_id = $1 AND c.chapel_base = true AND c.active = true
    `;
    
    const chapelsQuery = `
      SELECT 
        c.id,
        c.name,
        c.address,
        c.coordinates,
        'CAPILLA' as type
      FROM public.chapel c
      WHERE c.parish_id = $1 AND c.chapel_base = false AND c.active = true
      ORDER BY c.id
    `;
    
    const [parishResult, chapelsResult] = await Promise.all([
      db.query(parishQuery, [parishId]),
      db.query(chapelsQuery, [parishId])
    ]);
    
    return {
      selected_parish: parishResult.rows[0] || null,
      chapels: chapelsResult.rows
    };
  }

  static async getChapelInfo(chapelId) {
    const query = `
      SELECT 
        c.id,
        c.name,
        c.address,
        c.phone,
        c.email,
        c.coordinates,
        c.chapel_base,
        c.parish_id,
        p.name as parish_name
      FROM public.chapel c
      INNER JOIN public.parish p ON c.parish_id = p.id
      WHERE c.id = $1 AND c.active = true
    `;
    
    const result = await db.query(query, [chapelId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const chapel = result.rows[0];
    
    const response = {
      name: chapel.name,
      type: chapel.chapel_base ? 'Parroquia' : 'Capilla',
      address: chapel.address,
      phone: chapel.phone,
      description: '',
      parroco: chapel.chapel_base ? 'Administrador de Parroquia' : null,
      encargado: !chapel.chapel_base ? 'Encargado de Capilla' : null,
      parroquia_padre_name: !chapel.chapel_base ? chapel.parish_name : null
    };
    
    return response;
  }

  static async getChapelActs(chapelId) {
    const query = `
      SELECT 
        e.id,
        e.name
      FROM public.event e
      INNER JOIN public.chapel_event ce ON e.id = ce.event_id
      WHERE ce.chapel_id = $1 AND ce.active = true AND e.active = true
      ORDER BY e.id
    `;
    
    const result = await db.query(query, [chapelId]);
    return result.rows;
  }

  static async getChapelProfile(chapelId) {
    const chapelQuery = `
      SELECT 
        c.id,
        c.name as chapel_name,
        c.address,
        c.email,
        c.phone,
        c.coordinates,
        c.profile_photo,
        c.cover_photo,
        c.active,
        c.chapel_base,
        p.name as parish_name
      FROM public.chapel c
      INNER JOIN public.parish p ON c.parish_id = p.id
      WHERE c.id = $1 AND c.active = true
    `;
    
    const eventsQuery = `
      SELECT 
        ev.id as event_variant_id,
        e.name as event_name,
        ev.name as variant_name,
        CASE 
          WHEN ev.max_capacity = 1 THEN 'Privado'
          ELSE 'Comunitario'
        END as variant_type,
        ev.description as variant_description
      FROM public.event_variant ev
      INNER JOIN public.chapel_event ce ON ev.chapel_event_id = ce.id
      INNER JOIN public.event e ON ce.event_id = e.id
      WHERE ce.chapel_id = $1 AND ev.active = true AND ce.active = true AND e.active = true
      ORDER BY e.id, ev.id
    `;
    
    const [chapelResult, eventsResult] = await Promise.all([
      db.query(chapelQuery, [chapelId]),
      db.query(eventsQuery, [chapelId])
    ]);
    
    if (chapelResult.rows.length === 0) {
      return null;
    }
    
    const chapel = chapelResult.rows[0];
    
    return {
      parish_name: chapel.parish_name,
      chapel_name: chapel.chapel_name,
      cover_photo: chapel.cover_photo || '',
      profile_photo: chapel.profile_photo || '',
      address: chapel.address,
      email: chapel.email,
      phone: chapel.phone,
      coordinates: chapel.coordinates,
      active: chapel.active,
      events: eventsResult.rows
    };
  }
}

module.exports = PublicChurchModel;
