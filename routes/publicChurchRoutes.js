const express = require('express');
const router = express.Router();
const PublicChurchController = require('../controllers/publicChurchController');

router.post('/search', PublicChurchController.searchChurches);
router.post('/select-parish', PublicChurchController.selectParish);
router.get('/:chapel_id/info', PublicChurchController.getChapelInfo);
router.get('/:chapel_id/acts', PublicChurchController.getChapelActs);
router.get('/:chapel_id/profile', PublicChurchController.getChapelProfile);

module.exports = router;
