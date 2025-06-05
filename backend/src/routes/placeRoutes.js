import express from 'express';
import * as placeController from '../controllers/placeController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validatePlaceCheckin } from '../validators/placeValidator.js';

const router = express.Router();

// Rotas públicas
router.get('/', placeController.getPlaces);
// Corrigindo a ordem - rota específica antes da rota com parâmetro
router.get('/nearby', placeController.getNearbyPlaces);
router.get('/:id', placeController.getPlace);

// Rotas protegidas (requerem autenticação)
router.post('/checkin', authMiddleware, validatePlaceCheckin, placeController.checkIn);

export default router;