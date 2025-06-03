/* eslint-disable max-len */
const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');
const { authMiddleware, checkRole } = require('../middleware/auth');
const { validateVerifyCode } = require('../validators/partnerValidator');

// Rotas públicas
router.get('/', partnerController.getPartners);
router.get('/:id/rewards', partnerController.getPartnerRewards);

// Rotas protegidas (requerem autenticação)
router.post('/verify-code', authMiddleware, checkRole(['partner', 'admin']), validateVerifyCode, partnerController.verifyCode);

module.exports = router;
