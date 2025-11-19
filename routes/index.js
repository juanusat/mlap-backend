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
const documentTypeController = require('../controllers/documentTypeController');
const reservationRoutes = require('./reservationRoutes');
const eventVariantRoutes = require('./eventVariantRoutes');
const chapelEventRequirementRoutes = require('./chapelEventRequirementRoutes');
const scheduleRoutes = require('./scheduleRoutes');
const actsReservationRoutes = require('./actsReservationRoutes');
const mentionTypeRoutes = require('./mentionTypeRoutes');
const mentionTypeDioceseRoutes = require('./mentionTypeDioceseRoutes');
const publicScheduleRoutes = require('./publicScheduleRoutes');

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
router.get('/public/document-types', documentTypeController.publicList);
router.use('/public/schedules', publicScheduleRoutes);
router.use('/client/reservation', reservationRoutes);
router.use('/acts', eventVariantRoutes);
router.use('/acts', chapelEventRequirementRoutes);
router.use('/acts', actsReservationRoutes);
router.use('/', scheduleRoutes);
router.use('/mention-types', mentionTypeRoutes);
router.use('/diocese/mention-types', mentionTypeDioceseRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = router;