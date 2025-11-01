// controllers/parishController.js

const userModel = require('../models/userModel');
const parishModel = require('../models/parishModel');

// ✅ ESTA ES LA FUNCIÓN CLAVE PARA TU PANTALLA DE SELECCIÓN
const getMyParishes = async (req, res, next) => {
    try {
        // Usa el userId del token JWT que se creó en el login
        const { userId } = req.user; 
        const associations = await userModel.findUserAssociations(userId);
        
        res.status(200).json({
            message: 'User associations retrieved successfully',
            data: associations,
            error: ''
        });
    } catch (error) {
        next(error);
    }
};

// Esta función se usa DESPUÉS, no en el login.
const getChapelsForCurrentParish = async (req, res, next) => {
    try {
        const { parishId, context_type } = req.user; 
        if (!parishId || context_type !== 'PARISH') {
            return res.status(403).json({ 
                message: 'Prohibido. No se ha establecido un contexto de parroquia válido para la sesión.'
            });
        }
        const chapels = await parishModel.findChapelsByParishId(parishId);
        res.status(200).json({
            message: 'Operación exitosa',
            data: chapels
        });
    } catch (error) {
        next(error);
    }
};

const getRolesForParish = async (req, res, next) => {
    try {
        const { parishId } = req.params;
        const roles = await parishModel.findRolesByParishId(parishId);
        
        res.status(200).json({
            message: 'Roles obtenidos exitosamente',
            data: roles,
            error: null
        });
    } catch (error) {
        next(error);
    }
};

const getParishAccount = async (req, res, next) => {
    try {
        const { parishId, context_type } = req.user;
        
        if (!parishId || context_type !== 'PARISH') {
            return res.status(403).json({
                message: 'Prohibido. No se ha establecido un contexto de parroquia válido para la sesión.'
            });
        }

        const info = await parishModel.getParishAccountInfo(parishId);
        const credentials = await parishModel.getParishCredentials(parishId);

        res.status(200).json({
            message: 'Operación exitosa',
            data: {
                info,
                credentials
            }
        });
    } catch (error) {
        next(error);
    }
};

const updateParishAccountInfo = async (req, res, next) => {
    try {
        const { parishId, context_type } = req.user;
        
        if (!parishId || context_type !== 'PARISH') {
            return res.status(403).json({
                message: 'Prohibido. No se ha establecido un contexto de parroquia válido para la sesión.'
            });
        }

        const { name, address, coordinates, phone, email, primary_color, secondary_color, profile_photo_name, cover_photo_name } = req.body;
        const profilePhoto = req.files?.profile_photo?.[0];
        const coverPhoto = req.files?.cover_photo?.[0];

        const updatedInfo = await parishModel.updateParishAccountInfo(parishId, {
            name,
            address,
            coordinates,
            phone,
            email,
            primary_color,
            secondary_color,
            profile_photo: profilePhoto,
            profile_photo_name,
            cover_photo: coverPhoto,
            cover_photo_name
        });

        res.status(200).json({
            message: 'Información actualizada exitosamente',
            data: updatedInfo
        });
    } catch (error) {
        next(error);
    }
};

const updateParishCredentials = async (req, res, next) => {
    try {
        const { parishId, context_type } = req.user;
        
        if (!parishId || context_type !== 'PARISH') {
            return res.status(403).json({
                message: 'Prohibido. No se ha establecido un contexto de parroquia válido para la sesión.'
            });
        }

        const { current_password, username, email, new_password } = req.body;

        if (!current_password) {
            return res.status(400).json({
                message: 'La contraseña actual es requerida'
            });
        }

        const updatedCredentials = await parishModel.updateParishCredentials(
            parishId,
            { username, email, new_password },
            current_password
        );

        res.status(200).json({
            message: 'Credenciales actualizadas exitosamente',
            data: updatedCredentials
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMyParishes,
    getChapelsForCurrentParish,
    getRolesForParish,
    getParishAccount,
    updateParishAccountInfo,
    updateParishCredentials
};