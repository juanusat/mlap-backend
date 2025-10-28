const authMiddleware = require('./authMiddleware');

const dioceseMiddleware = (req, res, next) => {
    if (req.user.context_type !== 'DIOCESE') {
        return res.status(403).json({
            message: 'Prohibido. Esta operación requiere acceso de nivel diócesis.',
            error: 'Acceso denegado'
        });
    }
    next();
};

module.exports = dioceseMiddleware;
