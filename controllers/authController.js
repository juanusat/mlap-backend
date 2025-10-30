const authService = require('../services/authService');
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const config = require('../config');

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
};

const register = async (req, res, next) => {
    try {
        const { first_names, paternal_surname, maternal_surname, email, document_type_id, document, username, password } = req.body;
        
        await authService.register({
            first_names,
            paternal_surname,
            maternal_surname,
            email,
            document_type_id,
            document,
            username,
            password
        });

        res.status(201).json({
            message: 'Usuario creado exitosamente'
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    
    res.cookie('session_token', result.token, cookieOptions);

    const responseData = {
      message: 'Operación exitosa',
      data: {
        user_info: {
          full_name: result.user.user_name_full,
          email: result.user.email
        },
        is_diocese_user: result.is_diocese_user,
        parish_associations: result.parish_associations
      }
    };
    console.log('Login response:', JSON.stringify(responseData, null, 2));

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

const selectContext = async (req, res, next) => {
    try {
        const { context_type, parishId } = req.body;
        const { userId } = req.user;

        let tokenPayload;
        let permissions = [];
        
        if (context_type === 'DIOCESE') {
            tokenPayload = { userId, context_type: 'DIOCESE', parishId: null, permissions };
        } else if (context_type === 'PARISH') {
            if (!parishId) {
                return res.status(400).json({
                    message: 'Solicitud incorrecta',
                    error: 'parishId es requerido cuando context_type es PARISH'
                });
            }
            tokenPayload = { userId, context_type: 'PARISH', parishId, permissions };
        } else if (context_type === 'PARISHIONER') {
            permissions = await userModel.findParishionerPermissions();
            tokenPayload = { userId, context_type: 'PARISHIONER', parishId: null, permissions };
        } else {
            return res.status(400).json({
                message: 'Solicitud incorrecta',
                error: 'context_type debe ser PARISH, PARISHIONER o DIOCESE'
            });
        }

        const newToken = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: '24h' });
        res.cookie('session_token', newToken, cookieOptions);

        res.status(200).json({
            message: 'Operación exitosa'
        });
    } catch (error) {
        next(error);
    }
};

const selectRole = async (req, res, next) => {
    try {
        const { roleId } = req.body;
        const { userId, parishId, context_type } = req.user;

        if (!parishId || context_type !== 'PARISH') {
            return res.status(403).json({ 
                message: 'Prohibido. No se ha establecido un contexto de parroquia válido para la sesión.'
            });
        }

        const permissions = await userModel.findRolePermissions(roleId);

        const tokenPayload = { userId, context_type, parishId, roleId, permissions };
        const finalToken = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: '24h' });

        res.cookie('session_token', finalToken, cookieOptions);

        res.status(200).json({
            message: 'Operación exitosa'
        });
    } catch (error) {
        next(error);
    }
};

const logout = (req, res) => {
    res.clearCookie('session_token', cookieOptions);
    res.status(200).json({ 
        message: 'Operación exitosa'
    });
};

const getRolesForCurrentParish = async (req, res, next) => {
    try {
        const { userId, parishId, context_type } = req.user;

        if (!parishId || context_type !== 'PARISH') {
            return res.status(403).json({ 
                message: 'Prohibido. No se ha establecido un contexto de parroquia válido para la sesión.'
            });
        }

        const roles = await userModel.findUserRolesInParish(userId, parishId);
        
        res.status(200).json({
            message: 'Operación exitosa',
            data: roles
        });
    } catch (error) {
        next(error);
    }
};

const getSession = async (req, res, next) => {
    try {
        const { userId, parishId, context_type, roleId, permissions } = req.user;

        const userInfo = await userModel.findUserSessionInfo(userId);
        if (!userInfo) {
            return res.status(401).json({
                message: 'No autorizado. El token de sesión falta, es inválido o ha expirado.'
            });
        }

        const fullName = `${userInfo.first_names} ${userInfo.paternal_surname}${userInfo.maternal_surname ? ' ' + userInfo.maternal_surname : ''}`.trim();
        
        const profilePhoto = userInfo.profile_photo || null;
        
        let parishInfo = null;
        let availableRoles = null;
        let currentRole = null;
        let isParishAdmin = false;

        if (context_type === 'PARISH' && parishId) {
            parishInfo = await userModel.findParishById(parishId);
            availableRoles = await userModel.findUserRolesInParish(userId, parishId);
            isParishAdmin = await userModel.isParishAdmin(userId, parishId);
            
            if (roleId) {
                currentRole = await userModel.findRoleById(roleId);
            }
        }

        const tokenPayload = { userId, context_type, parishId, roleId, permissions: permissions || [] };
        const newToken = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: '24h' });
        res.cookie('session_token', newToken, cookieOptions);

        res.status(200).json({
            message: 'Operación exitosa',
            data: {
                person: {
                    full_name: fullName,
                    profile_photo: profilePhoto
                },
                is_diocese_user: userInfo.is_diocese,
                is_parish_admin: isParishAdmin,
                parish: parishInfo ? {
                    id: parishInfo.id,
                    name: parishInfo.name
                } : null,
                available_roles: availableRoles,
                current_role: currentRole,
                permissions: permissions || []
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
  register,
  login,
  selectContext,
  selectRole,
  logout,
  getRolesForCurrentParish,
  getSession
};