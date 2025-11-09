const userService = require('../services/userService');

const getUserAccount = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const accountData = await userService.getUserAccountInfo(userId);
    
    res.status(200).json({
      message: 'Información del perfil obtenida correctamente',
      data: accountData,
      error: null,
      traceback: null
    });
  } catch (error) {
    next(error);
  }
};

const updatePersonalInfo = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { first_names, paternal_surname, maternal_surname, document, document_type_id, profile_photo_name } = req.body;
    const profilePhoto = req.file;

    await userService.updatePersonalInfo(userId, {
      first_names,
      paternal_surname,
      maternal_surname,
      document,
      document_type_id: document_type_id ? parseInt(document_type_id) : undefined,
      profile_photo: profilePhoto,
      profile_photo_name
    });

    res.status(200).json({
      message: 'Información personal actualizada correctamente',
      data: {},
      error: null,
      traceback: null
    });
  } catch (error) {
    next(error);
  }
};

const updateCredentials = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { username, email, new_password } = req.body;

    await userService.updateCredentials(userId, {
      username,
      email,
      new_password
    });

    res.status(200).json({
      message: 'Datos de la cuenta actualizados correctamente',
      data: {},
      error: null,
      traceback: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserAccount,
  updatePersonalInfo,
  updateCredentials
};
