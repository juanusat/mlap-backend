const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const chapelRoutes = require('./chapelRoutes');
// const userRoutes = require('./userRoutes');

router.use('/account', authRoutes);
router.use('/chapels', chapelRoutes);
// router.use('/users', userRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = router;