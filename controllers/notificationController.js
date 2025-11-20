const db = require('../db');

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { unread } = req.query;

    let query = `
      SELECT 
        id,
        user_id,
        title,
        body,
        read,
        created_at,
        updated_at
      FROM notification
      WHERE user_id = $1
    `;

    const params = [userId];

    if (unread === 'true') {
      query += ' AND read = false';
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);

    return res.status(200).json({
      message: 'Notificaciones obtenidas exitosamente',
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return res.status(500).json({
      message: 'Error al obtener notificaciones',
      error: error.message
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const result = await db.query(
      `UPDATE notification 
       SET read = true, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND user_id = $2 
       RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Notificación no encontrada',
        error: 'La notificación no existe o no pertenece al usuario'
      });
    }

    return res.status(200).json({
      message: 'Notificación marcada como leída'
    });
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    return res.status(500).json({
      message: 'Error al marcar notificación como leída',
      error: error.message
    });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;

    await db.query(
      `UPDATE notification 
       SET read = true, updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = $1 AND read = false`,
      [userId]
    );

    return res.status(200).json({
      message: 'Todas las notificaciones marcadas como leídas'
    });
  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error);
    return res.status(500).json({
      message: 'Error al marcar todas las notificaciones como leídas',
      error: error.message
    });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const result = await db.query(
      `DELETE FROM notification 
       WHERE id = $1 AND user_id = $2 
       RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Notificación no encontrada',
        error: 'La notificación no existe o no pertenece al usuario'
      });
    }

    return res.status(200).json({
      message: 'Notificación eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    return res.status(500).json({
      message: 'Error al eliminar notificación',
      error: error.message
    });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await db.query(
      `SELECT COUNT(*) as unread_count 
       FROM notification 
       WHERE user_id = $1 AND read = false`,
      [userId]
    );

    return res.status(200).json({
      message: 'Contador de notificaciones no leídas obtenido',
      data: {
        unread_count: parseInt(result.rows[0].unread_count)
      }
    });
  } catch (error) {
    console.error('Error al obtener contador de notificaciones:', error);
    return res.status(500).json({
      message: 'Error al obtener contador de notificaciones',
      error: error.message
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
};
