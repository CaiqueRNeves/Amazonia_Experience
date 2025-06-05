import express from 'express';
import * as rewardController from '../controllers/rewardController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Rotas públicas
router.get('/', rewardController.getRewards);
router.get('/physical', rewardController.getPhysicalRewards);
router.get('/digital', rewardController.getDigitalRewards);

// Rotas protegidas devem vir antes das rotas com parâmetros dinâmicos
router.get('/redemptions', authMiddleware, rewardController.getRedemptions);

// Rotas com parâmetros dinâmicos por último
router.get('/:id', rewardController.getReward);
router.post('/:id/redeem', authMiddleware, rewardController.redeemReward);

export default router;