import express from 'express';
import * as emergencyController from '../controllers/emergencyController.js';

const router = express.Router();

// Todas as rotas são públicas para acesso rápido em emergências
router.get('/services', emergencyController.getEmergencyServices);
router.get('/services/nearby', emergencyController.getNearbyServices);
router.get('/services/:type', emergencyController.getServicesByType);
router.get('/contacts/:language', emergencyController.getContactsByLanguage);
router.get('/phrases/:language', emergencyController.getPhrasesByLanguage);

export default router;