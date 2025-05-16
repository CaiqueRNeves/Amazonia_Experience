const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authMiddleware } = require('../middleware/auth');
const { validateEventCheckin } = require('../validators/eventValidator');

// Rotas públicas
router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEvent);
router.get('/nearby', eventController.getNearbyEvents);

// Rotas protegidas (requerem autenticação)
router.post('/checkin', authMiddleware, validateEventCheckin, eventController.checkIn);

module.exports = router;