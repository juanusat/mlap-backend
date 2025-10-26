const jwt = require('jsonwebtoken');
const config = require('../config');

const authMiddleware = (req, res, next) => {
    // req.cookies puede ser undefined si cookie-parser no esté registrado
    const cookieToken = req.cookies && req.cookies.session_token;
    // Soportar también Authorization: Bearer <token>
    const authHeader = req.headers && req.headers.authorization;
    const headerToken = authHeader && authHeader.split(' ')[0] === 'Bearer' ? authHeader.split(' ')[1] : null;

    const token = cookieToken || headerToken;

    if (!token) {
        return res.status(401).json({ 
            message: 'No autorizado. El token de sesión falta, es inválido o ha expirado.'
        });
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = decoded; // Adjunta { userId, context_type, parishId, roleId } a la petición
        next();
    } catch (error) {
        return res.status(401).json({ 
            message: 'No autorizado. El token de sesión falta, es inválido o ha expirado.'
        });
    }
};

const requireAuth = authMiddleware;

module.exports = { authMiddleware, requireAuth };