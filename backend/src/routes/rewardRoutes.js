const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');
const { authMiddleware } = require('../middleware/auth');

// Rotas públicas
router.get('/', rewardController.getRewards);
router.get('/physical', rewardController.getPhysicalRewards);
router.get('/digital', rewardController.getDigitalRewards);
router.get('/:id', rewardController.getReward);

// Rotas protegidas (requerem autenticação)
router.post('/:id/redeem', authMiddleware, rewardController.redeemReward);
router.get('/redemptions', authMiddleware, rewardController.getRedemptions);

module.exports = router;