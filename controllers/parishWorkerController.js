const parishWorkerService = require('../services/parishWorkerService');

/**
 * Listar trabajadores de una parroquia con paginación
 */
const listWorkers = async (req, res) => {
  try {
    const { parishId } = req.params;
    const { page = 1, limit = 10 } = req.body;

    const result = await parishWorkerService.listWorkers(
      parseInt(parishId),
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      message: 'Lista de trabajadores obtenida exitosamente',
      data: result,
      error: null
    });
  } catch (error) {
    console.error('Error al listar trabajadores:', error);
    res.status(500).json({
      message: 'Error al obtener la lista de trabajadores',
      data: null,
      error: error.message
    });
  }
};

/**
 * Buscar trabajadores por nombre o email
 */
const searchWorkers = async (req, res) => {
  try {
    const { parishId } = req.params;
    const { page = 1, limit = 10, search = '' } = req.body;

    const result = await parishWorkerService.searchWorkers(
      parseInt(parishId),
      parseInt(page),
      parseInt(limit),
      search
    );

    res.status(200).json({
      message: 'Búsqueda completada exitosamente',
      data: result,
      error: null
    });
  } catch (error) {
    console.error('Error al buscar trabajadores:', error);
    res.status(500).json({
      message: 'Error al buscar trabajadores',
      data: null,
      error: error.message
    });
  }
};

/**
 * Invitar/asociar un usuario a la parroquia
 */
const inviteWorker = async (req, res) => {
  try {
    const { parishId } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'El email es requerido',
        data: null,
        error: 'Parámetro faltante: email'
      });
    }

    const result = await parishWorkerService.inviteWorker(
      parseInt(parishId),
      email
    );

    res.status(200).json({
      message: result.message,
      data: result.data,
      error: null
    });
  } catch (error) {
    console.error('Error al invitar trabajador:', error);
    res.status(500).json({
      message: error.message || 'Error al asociar usuario a la parroquia',
      data: null,
      error: error.message
    });
  }
};

/**
 * Listar roles de un trabajador específico
 */
const listWorkerRoles = async (req, res) => {
  try {
    const { id: associationId } = req.params;
    const { page = 1, limit = 10 } = req.body;

    const result = await parishWorkerService.listWorkerRoles(
      parseInt(associationId),
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      message: 'Roles del trabajador obtenidos exitosamente',
      data: result,
      error: null
    });
  } catch (error) {
    console.error('Error al listar roles del trabajador:', error);
    res.status(500).json({
      message: error.message || 'Error al obtener roles del trabajador',
      data: null,
      error: error.message
    });
  }
};

/**
 * Asignar un rol a un trabajador
 */
const assignRole = async (req, res) => {
  try {
    const { id: associationId } = req.params;
    const { role_id } = req.body;

    if (!role_id) {
      return res.status(400).json({
        message: 'El ID del rol es requerido',
        data: null,
        error: 'Parámetro faltante: role_id'
      });
    }

    await parishWorkerService.assignRole(
      parseInt(associationId),
      parseInt(role_id)
    );

    res.status(200).json({
      message: 'Rol asignado exitosamente',
      data: null,
      error: null
    });
  } catch (error) {
    console.error('Error al asignar rol:', error);
    res.status(500).json({
      message: error.message || 'Error al asignar rol al trabajador',
      data: null,
      error: error.message
    });
  }
};

/**
 * Revocar un rol de un trabajador
 */
const revokeRole = async (req, res) => {
  try {
    const { userRoleId } = req.params;

    await parishWorkerService.revokeRole(parseInt(userRoleId));

    res.status(200).json({
      message: 'Rol revocado exitosamente',
      data: null,
      error: null
    });
  } catch (error) {
    console.error('Error al revocar rol:', error);
    res.status(500).json({
      message: 'Error al revocar el rol del trabajador',
      data: null,
      error: error.message
    });
  }
};

/**
 * Actualizar el estado de una asociación (activar/desactivar)
 */
const updateAssociationStatus = async (req, res) => {
  try {
    const { associationId } = req.params;
    const { active } = req.body;

    if (typeof active !== 'boolean') {
      return res.status(400).json({
        message: 'El campo active es requerido y debe ser booleano',
        data: null,
        error: 'Parámetro inválido: active'
      });
    }

    await parishWorkerService.updateAssociationStatus(
      parseInt(associationId),
      active
    );

    res.status(200).json({
      message: `Asociación ${active ? 'activada' : 'desactivada'} exitosamente`,
      data: null,
      error: null
    });
  } catch (error) {
    console.error('Error al actualizar estado de asociación:', error);
    res.status(500).json({
      message: 'Error al actualizar el estado de la asociación',
      data: null,
      error: error.message
    });
  }
};

/**
 * Eliminar (lógicamente) una asociación
 */
const deleteAssociation = async (req, res) => {
  try {
    const { associationId } = req.params;

    await parishWorkerService.deleteAssociation(parseInt(associationId));

    res.status(200).json({
      message: 'Asociación eliminada exitosamente',
      data: null,
      error: null
    });
  } catch (error) {
    console.error('Error al eliminar asociación:', error);
    res.status(500).json({
      message: 'Error al eliminar la asociación',
      data: null,
      error: error.message
    });
  }
};

module.exports = {
  listWorkers,
  searchWorkers,
  inviteWorker,
  listWorkerRoles,
  assignRole,
  revokeRole,
  updateAssociationStatus,
  deleteAssociation
};
