const express = require('express');
const router = express.Router();
const connectivityController = require('../controllers/connectivityController');
const { authMiddleware } = require('../middleware/auth');
const { validateConnectivityReport } = require('../validators/connectivityValidator');

// Rotas públicas
router.get('/spots', connectivityController.getConnectivitySpots);
router.get('/spots/nearby', connectivityController.getNearbySpots);
router.get('/heatmap', connectivityController.getHeatmap);

// Rotas protegidas (requerem autenticação)
router.post('/spots/:id/report', authMiddleware, validateConnectivityReport, connectivityController.reportSpot);

module.exports = router;