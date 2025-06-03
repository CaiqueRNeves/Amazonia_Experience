const express = require('express');
const router = express.Router();
const placeController = require('../controllers/placeController');
const { authMiddleware } = require('../middleware/auth');
const { validatePlaceCheckin } = require('../validators/placeValidator');

// Rotas públicas
router.get('/', placeController.getPlaces);
// Corrigindo a ordem - rota específica antes da rota com parâmetro
router.get('/nearby', placeController.getNearbyPlaces);
router.get('/:id', placeController.getPlace);

// Rotas protegidas (requerem autenticação)
router.post('/checkin', authMiddleware, validatePlaceCheckin, placeController.checkIn);

module.exports = router;