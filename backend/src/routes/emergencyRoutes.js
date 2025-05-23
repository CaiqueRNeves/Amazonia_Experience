const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');

// Todas as rotas são públicas para acesso rápido em emergências
router.get('/services', emergencyController.getEmergencyServices);
router.get('/services/nearby', emergencyController.getNearbyServices); // CORREÇÃO: Ordem corrigida
router.get('/services/:type', emergencyController.getServicesByType);
router.get('/contacts/:language', emergencyController.getContactsByLanguage);
router.get('/phrases/:language', emergencyController.getPhrasesByLanguage);

module.exports = router;