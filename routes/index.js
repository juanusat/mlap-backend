const express = require('express');
const router = express.Router();

// Ejemplo de cómo agregarás las otras rutas más adelante
// const authRoutes = require('./authRoutes');
// const userRoutes = require('./userRoutes');

// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = router;