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
        const { parishId } = req.user; 
        if (!parishId) {
            return res.status(403).json({ message: 'Forbidden: A parish must be selected to view chapels.' });
        }
        const chapels = await parishModel.findChapelsByParishId(parishId);
        res.status(200).json({
            message: 'Chapels retrieved successfully',
            data: chapels,
            error: ''
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMyParishes,
    getChapelsForCurrentParish,
};