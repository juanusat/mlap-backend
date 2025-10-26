const roleService = require('../services/roleService');

const listRoles = async (req, res) => {
  try {
    const { parishId } = req.params;
    const { page = 1, limit = 10 } = req.body;

    const result = await roleService.listRoles(
      parseInt(parishId),
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      message: 'Roles obtenidos exitosamente',
      data: result,
      error: null
    });
  } catch (error) {
    console.error('Error al listar roles:', error);
    res.status(500).json({
      message: 'Error al obtener la lista de roles',
      data: null,
      error: error.message
    });
  }
};

const searchRoles = async (req, res) => {
  try {
    const { parishId } = req.params;
    const { page = 1, limit = 10, search = '' } = req.body;

    const result = await roleService.searchRoles(
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
    console.error('Error al buscar roles:', error);
    res.status(500).json({
      message: 'Error al buscar roles',
      data: null,
      error: error.message
    });
  }
};

const createRole = async (req, res) => {
  try {
    const { parishId } = req.params;
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        message: 'Nombre y descripción son requeridos',
        data: null,
        error: 'Parámetros faltantes'
      });
    }

    const result = await roleService.createRole(
      parseInt(parishId),
      name,
      description
    );

    res.status(201).json({
      message: 'Rol creado exitosamente.',
      data: result,
      error: null
    });
  } catch (error) {
    console.error('Error al crear rol:', error);
    res.status(500).json({
      message: 'Error al crear el rol',
      data: null,
      error: error.message
    });
  }
};

const getRoleById = async (req, res) => {
  try {
    const { roleId } = req.params;

    const result = await roleService.getRoleById(parseInt(roleId));

    res.status(200).json({
      message: 'Detalles del rol obtenidos exitosamente',
      data: result,
      error: null
    });
  } catch (error) {
    console.error('Error al obtener rol:', error);
    res.status(error.message === 'Rol no encontrado' ? 404 : 500).json({
      message: error.message || 'Error al obtener el rol',
      data: null,
      error: error.message
    });
  }
};

const updateRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        message: 'Nombre y descripción son requeridos',
        data: null,
        error: 'Parámetros faltantes'
      });
    }

    await roleService.updateRole(parseInt(roleId), name, description);

    res.status(200).json({
      message: 'Rol actualizado exitosamente.',
      data: { role_id: parseInt(roleId) },
      error: null
    });
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    res.status(500).json({
      message: 'Error al actualizar el rol',
      data: null,
      error: error.message
    });
  }
};

const updateRoleStatus = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { active } = req.body;

    if (typeof active !== 'boolean') {
      return res.status(400).json({
        message: 'El campo active es requerido y debe ser booleano',
        data: null,
        error: 'Parámetro inválido'
      });
    }

    await roleService.updateRoleStatus(parseInt(roleId), active);

    res.status(200).json({
      message: `Estado del rol actualizado exitosamente (${active ? 'Activado' : 'Desactivado'}).`,
      data: { role_id: parseInt(roleId), active },
      error: null
    });
  } catch (error) {
    console.error('Error al actualizar estado del rol:', error);
    res.status(500).json({
      message: 'Error al actualizar el estado del rol',
      data: null,
      error: error.message
    });
  }
};

const deleteRole = async (req, res) => {
  try {
    const { roleId } = req.params;

    await roleService.deleteRole(parseInt(roleId));

    res.status(200).json({
      message: 'Rol desactivado/eliminado lógicamente exitosamente.',
      data: { role_id: parseInt(roleId) },
      error: null
    });
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    res.status(500).json({
      message: 'Error al eliminar el rol',
      data: null,
      error: error.message
    });
  }
};

const getRolePermissions = async (req, res) => {
  try {
    const { roleId } = req.params;

    const permissions = await roleService.getRolePermissions(parseInt(roleId));

    res.status(200).json({
      message: 'Permisos del rol obtenidos exitosamente',
      data: permissions,
      error: null
    });
  } catch (error) {
    console.error('Error al obtener permisos del rol:', error);
    res.status(500).json({
      message: 'Error al obtener permisos del rol',
      data: null,
      error: error.message
    });
  }
};

const updateRolePermissions = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return res.status(400).json({
        message: 'El campo permissions es requerido y debe ser un array',
        data: null,
        error: 'Parámetro inválido'
      });
    }

    const updatedCount = await roleService.updateRolePermissions(
      parseInt(roleId),
      permissions
    );

    res.status(200).json({
      message: 'Permisos del rol actualizados exitosamente.',
      data: { role_id: parseInt(roleId), updated_count: updatedCount },
      error: null
    });
  } catch (error) {
    console.error('Error al actualizar permisos del rol:', error);
    res.status(500).json({
      message: 'Error al actualizar permisos del rol',
      data: null,
      error: error.message
    });
  }
};

module.exports = {
  listRoles,
  searchRoles,
  createRole,
  getRoleById,
  updateRole,
  updateRoleStatus,
  deleteRole,
  getRolePermissions,
  updateRolePermissions
};
