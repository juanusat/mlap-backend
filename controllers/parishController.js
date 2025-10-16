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

module.exports = {
    getMyParishes,
    getChapelsForCurrentParish,
};