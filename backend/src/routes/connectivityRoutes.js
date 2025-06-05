import express from 'express';
import * as connectivityController from '../controllers/connectivityController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateConnectivityReport } from '../validators/connectivityValidator.js';

const router = express.Router();

// Rotas públicas
router.get('/spots', connectivityController.getConnectivitySpots);
router.get('/spots/nearby', connectivityController.getNearbySpots);
router.get('/heatmap', connectivityController.getHeatmap);

// Rotas protegidas (requerem autenticação)
router.post('/spots/:id/report', authMiddleware, validateConnectivityReport, connectivityController.reportSpot);

export default router;
