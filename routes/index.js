const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const chapelRoutes = require('./chapelRoutes');

router.use('/auth', authRoutes);
router.use('/chapels', chapelRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = router;