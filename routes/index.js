const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const chapelRoutes = require('./chapelRoutes');
const userRoutes = require('./userRoutes');
const parishRoutes = require('./parishRoutes');
const parishWorkerRoutes = require('./parishWorkerRoutes');
const roleRoutes = require('./roleRoutes');
const documentTypeRoutes = require('./documentTypeRoutes');
const dioceseParishRoutes = require('./dioceseParishRoutes');
const eventRoutes = require('./eventRoutes');
const baseRequirementRoutes = require('./baseRequirementRoutes');
const publicChurchRoutes = require('./publicChurchRoutes');
const reservationRoutes = require('./reservationRoutes');
const eventVariantRoutes = require('./eventVariantRoutes');
const chapelEventRequirementRoutes = require('./chapelEventRequirementRoutes');
const scheduleRoutes = require('./scheduleRoutes');
const actsReservationRoutes = require('./actsReservationRoutes');
const mentionTypeRoutes = require('./mentionTypeRoutes');

router.use('/auth', authRoutes);
router.use('/chapels', chapelRoutes);
router.use('/user', userRoutes);
router.use('/parish', parishRoutes);
router.use('/', parishWorkerRoutes);
router.use('/', roleRoutes);
router.use('/diocese', documentTypeRoutes);
router.use('/diocese', dioceseParishRoutes);
router.use('/diocese', eventRoutes);
router.use('/diocese', baseRequirementRoutes);
router.use('/public/church', publicChurchRoutes);
router.use('/client/reservation', reservationRoutes);
router.use('/acts', eventVariantRoutes);
router.use('/acts', chapelEventRequirementRoutes);
router.use('/acts', actsReservationRoutes);
router.use('/', scheduleRoutes);
router.use('/mention-types', mentionTypeRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = router;