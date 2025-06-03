const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');
const { authMiddleware } = require('../middleware/auth');

// Rotas públicas
router.get('/', rewardController.getRewards);
router.get('/physical', rewardController.getPhysicalRewards);
router.get('/digital', rewardController.getDigitalRewards);

// CORREÇÃO: Rotas protegidas devem vir antes das rotas com parâmetros dinâmicos
router.get('/redemptions', authMiddleware, rewardController.getRedemptions);

// Rotas com parâmetros dinâmicos por último
router.get('/:id', rewardController.getReward);
router.post('/:id/redeem', authMiddleware, rewardController.redeemReward);

module.exports = router;