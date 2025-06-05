import express from 'express';
import * as partnerController from '../controllers/partnerController.js';
import { authMiddleware, checkRole } from '../middleware/auth.js';
import { validateVerifyCode } from '../validators/partnerValidator.js';

const router = express.Router();

// Rotas públicas
router.get('/', partnerController.getPartners);
router.get('/:id/rewards', partnerController.getPartnerRewards);

// Rotas protegidas (requerem autenticação)
router.post('/verify-code', authMiddleware, checkRole(['partner', 'admin']), validateVerifyCode, partnerController.verifyCode);

export default router;
