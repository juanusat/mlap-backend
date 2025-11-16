const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');

const hashUserAgent = (userAgent) => {
    return crypto.createHash('sha256').update(userAgent || '').digest('hex');
};

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
        
        const userAgent = req.headers['user-agent'];
        const currentUaHash = hashUserAgent(userAgent);
        
        if (decoded.uaHash && decoded.uaHash !== currentUaHash) {
            res.clearCookie('session_token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/'
            });
            return res.status(401).json({ 
                message: 'No autorizado. El token de sesión falta, es inválido o ha expirado.',
                force_logout: true,
                redirect: true
            });
        }
        
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ 
            message: 'No autorizado. El token de sesión falta, es inválido o ha expirado.'
        });
    }
};

const requireAuth = authMiddleware;

module.exports = { authMiddleware, requireAuth };