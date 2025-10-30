const pool = require('../db');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises;

const getUserAccountInfo = async (userId) => {
  const result = await pool.query(
    `SELECT 
      u.id,
      p.first_names,
      p.paternal_surname,
      p.maternal_surname,
      p.document,
      p.profile_photo,
      u.username,
      p.email
    FROM "user" u
    INNER JOIN person p ON u.person_id = p.id
    WHERE u.id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error('Usuario no encontrado');
  }

  return result.rows[0];
};

const updatePersonalInfo = async (userId, data) => {
  const { first_names, paternal_surname, maternal_surname, document, profile_photo, profile_photo_name } = data;

  const userResult = await pool.query('SELECT person_id FROM "user" WHERE id = $1', [userId]);
  if (userResult.rows.length === 0) {
    throw new Error('Usuario no encontrado');
  }
  const personId = userResult.rows[0].person_id;

  let photoFilename = null;
  if (profile_photo) {
    const extension = path.extname(profile_photo_name || profile_photo.originalname);
    photoFilename = crypto.randomBytes(6).toString('hex') + extension;
    
    const uploadDir = path.join(__dirname, '..', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, photoFilename), profile_photo.buffer);
  }

  const updates = [];
  const values = [];
  let paramCount = 1;

  if (first_names !== undefined) {
    updates.push(`first_names = $${paramCount++}`);
    values.push(first_names);
  }
  if (paternal_surname !== undefined) {
    updates.push(`paternal_surname = $${paramCount++}`);
    values.push(paternal_surname);
  }
  if (maternal_surname !== undefined) {
    updates.push(`maternal_surname = $${paramCount++}`);
    values.push(maternal_surname);
  }
  if (document !== undefined) {
    updates.push(`document = $${paramCount++}`);
    values.push(document);
  }
  if (photoFilename) {
    updates.push(`profile_photo = $${paramCount++}`);
    values.push(photoFilename);
  }

  if (updates.length > 0) {
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(personId);
    
    await pool.query(
      `UPDATE person SET ${updates.join(', ')} WHERE id = $${paramCount}`,
      values
    );
  }
};

const updateCredentials = async (userId, data) => {
  const { username, email, new_password } = data;

  const userResult = await pool.query('SELECT person_id FROM "user" WHERE id = $1', [userId]);
  if (userResult.rows.length === 0) {
    throw new Error('Usuario no encontrado');
  }
  const personId = userResult.rows[0].person_id;

  if (username) {
    const existingUser = await pool.query(
      'SELECT id FROM "user" WHERE username = $1 AND id != $2',
      [username, userId]
    );
    if (existingUser.rows.length > 0) {
      throw new Error('El nombre de usuario ya está en uso');
    }
  }

  if (email) {
    const existingEmail = await pool.query(
      'SELECT id FROM person WHERE email = $1 AND id != $2',
      [email, personId]
    );
    if (existingEmail.rows.length > 0) {
      throw new Error('El correo electrónico ya está en uso');
    }
  }

  const userUpdates = [];
  const userValues = [];
  let userParamCount = 1;

  if (username !== undefined) {
    userUpdates.push(`username = $${userParamCount++}`);
    userValues.push(username);
  }
  if (new_password) {
    const hashedPassword = crypto.createHash('sha256').update(new_password).digest('hex');
    userUpdates.push(`password_hash = $${userParamCount++}`);
    userValues.push(hashedPassword);
  }

  if (userUpdates.length > 0) {
    userUpdates.push(`updated_at = CURRENT_TIMESTAMP`);
    userValues.push(userId);
    
    await pool.query(
      `UPDATE "user" SET ${userUpdates.join(', ')} WHERE id = $${userParamCount}`,
      userValues
    );
  }

  if (email !== undefined) {
    await pool.query(
      `UPDATE person SET email = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [email, personId]
    );
  }
};

module.exports = {
  getUserAccountInfo,
  updatePersonalInfo,
  updateCredentials
};
