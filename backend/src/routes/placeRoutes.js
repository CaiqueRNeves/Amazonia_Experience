const express = require('express');
const router = express.Router();
const placeController = require('../controllers/placeController');
const { authMiddleware } = require('../middleware/auth');
const { validatePlaceCheckin } = require('../validators/placeValidator');

// Rotas públicas
router.get('/', placeController.getPlaces);
router.get('/:id', placeController.getPlace);
router.get('/nearby', placeController.getNearbyPlaces);

// Rotas protegidas (requerem autenticação)
router.post('/checkin', authMiddleware, validatePlaceCheckin, placeController.checkIn);

module.exports = router;