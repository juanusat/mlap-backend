const authService = require('../services/authService');
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
};

const hashUserAgent = (userAgent) => {
    return crypto.createHash('sha256').update(userAgent || '').digest('hex');
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
    const userAgent = req.headers['user-agent'];
    const uaHash = hashUserAgent(userAgent);
    
    const decoded = jwt.verify(result.token, config.jwtSecret);
    const { exp, iat, ...payload } = decoded;
    const tokenPayload = { ...payload, uaHash };
    const newToken = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: '24h' });
    
    res.cookie('session_token', newToken, cookieOptions);

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
        // Log de acceso: solo email y resultado OK
        console.log(`Login intento: ${email} (OK)`);
        res.status(200).json(responseData);
  } catch (error) {
        // Log de acceso: solo email y resultado FAIL
        if (req.body && req.body.email) {
            console.log(`Login intento: ${req.body.email} (FAIL)`);
        }
        next(error);
  }
};

const selectContext = async (req, res, next) => {
    try {
        const { context_type, parishId } = req.body;
        const { userId } = req.user;

        let tokenPayload;
        let permissions = [];
        
        const userAgent = req.headers['user-agent'];
        const uaHash = hashUserAgent(userAgent);

        if (context_type === 'DIOCESE') {
            tokenPayload = { userId, context_type: 'DIOCESE', parishId: null, permissions, uaHash };
        } else if (context_type === 'PARISH') {
            if (!parishId) {
                return res.status(400).json({
                    message: 'Solicitud incorrecta',
                    error: 'parishId es requerido cuando context_type es PARISH'
                });
            }
            tokenPayload = { userId, context_type: 'PARISH', parishId, permissions, uaHash };
        } else if (context_type === 'PARISHIONER') {
            permissions = await userModel.findParishionerPermissions();
            tokenPayload = { userId, context_type: 'PARISHIONER', parishId: null, permissions, uaHash };
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

        const userAgent = req.headers['user-agent'];
        const uaHash = hashUserAgent(userAgent);

        const tokenPayload = { userId, context_type, parishId, roleId, permissions, uaHash };
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
        let currentPermissions = permissions || [];
        let forceLogout = false;

        if (context_type === 'PARISH' && parishId) {
            const associationStatus = await userModel.checkUserAssociationStatus(userId, parishId);
            
            if (!associationStatus || !associationStatus.active) {
                forceLogout = true;
                return res.status(200).json({
                    message: 'Operación exitosa',
                    data: {
                        force_logout: true,
                        logout_reason: 'Tu acceso a esta parroquia ha sido revocado. Por favor, inicia sesión nuevamente.'
                    }
                });
            }

            parishInfo = await userModel.findParishById(parishId);
            availableRoles = await userModel.findUserRolesInParish(userId, parishId);
            isParishAdmin = await userModel.isParishAdmin(userId, parishId);
            
            if (roleId) {
                const roleStillValid = availableRoles.some(r => r.id === roleId);
                if (!roleStillValid && !isParishAdmin) {
                    forceLogout = true;
                    return res.status(200).json({
                        message: 'Operación exitosa',
                        data: {
                            force_logout: true,
                            logout_reason: 'El rol que tenías asignado ha sido revocado. Por favor, inicia sesión nuevamente.'
                        }
                    });
                }

                currentRole = await userModel.findRoleById(roleId);
                if (isParishAdmin) {
                    const allPermsQuery = `SELECT code FROM public.permission WHERE category IN ('ACTOS LITÚRGICOS', 'SEGURIDAD', 'PARROQUIA')`;
                    const { rows } = await require('../db').query(allPermsQuery);
                    currentPermissions = rows.map(r => r.code);
                } else {
                    currentPermissions = await userModel.findRolePermissions(roleId);
                }
            }
        }

        const userAgent = req.headers['user-agent'];
        const uaHash = hashUserAgent(userAgent);

        const tokenPayload = { userId, context_type, parishId, roleId, permissions: currentPermissions, uaHash };
        const newToken = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: '24h' });
        res.cookie('session_token', newToken, cookieOptions);

        res.status(200).json({
            message: 'Operación exitosa',
            data: {
                context_type: context_type,
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
                permissions: currentPermissions,
                force_logout: forceLogout
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Solicita el restablecimiento de contraseña
 */
const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validar que se proporcione el email
    if (!email || !email.trim()) {
      return res.status(400).json({
        message: 'El correo electrónico es requerido'
      });
    }

    // Validar formato del correo
    const emailRegex = /^[a-zA-Z0-9._-]{4,50}@[a-zA-Z0-9-]{2,8}\.[a-zA-Z]{2,8}(\.[a-zA-Z]{2,8})?$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        message: 'El formato del correo no es válido'
      });
    }

    // Procesar la solicitud
    await authService.requestPasswordReset(email.trim());

    // Respuesta genérica por seguridad (no revelamos si el email existe)
    res.status(200).json({
      message: 'Si el correo existe, recibirás un código de verificación en tu bandeja de entrada'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verifica el código de restablecimiento
 */
const verifyResetCode = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    // Validaciones
    if (!email || !email.trim()) {
      return res.status(400).json({
        message: 'El correo electrónico es requerido'
      });
    }

    if (!code || !code.trim()) {
      return res.status(400).json({
        message: 'El código de verificación es requerido'
      });
    }

    // Validar que el código sea de 6 dígitos
    if (!/^\d{6}$/.test(code.trim())) {
      return res.status(400).json({
        message: 'El código debe ser de 6 dígitos'
      });
    }

    // Verificar el código
    const result = await authService.verifyResetCode(email.trim(), code.trim());

    res.status(200).json({
      message: result.message,
      data: { verified: true }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Restablece la contraseña del usuario
 */
const resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;

    // Validaciones
    if (!email || !email.trim()) {
      return res.status(400).json({
        message: 'El correo electrónico es requerido'
      });
    }

    if (!code || !code.trim()) {
      return res.status(400).json({
        message: 'El código de verificación es requerido'
      });
    }

    if (!newPassword || !newPassword.trim()) {
      return res.status(400).json({
        message: 'La nueva contraseña es requerida'
      });
    }

    if (!confirmPassword || !confirmPassword.trim()) {
      return res.status(400).json({
        message: 'La confirmación de contraseña es requerida'
      });
    }

    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: 'Las contraseñas no coinciden'
      });
    }

    // Validar longitud mínima de contraseña
    if (newPassword.length < 8) {
      return res.status(400).json({
        message: 'La contraseña debe tener al menos 8 caracteres'
      });
    }

    // Validar que el código sea de 6 dígitos
    if (!/^\d{6}$/.test(code.trim())) {
      return res.status(400).json({
        message: 'El código debe ser de 6 dígitos'
      });
    }

    // Restablecer la contraseña
    const result = await authService.resetPassword(email.trim(), code.trim(), newPassword);

    res.status(200).json({
      message: result.message
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
  getSession,
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
};