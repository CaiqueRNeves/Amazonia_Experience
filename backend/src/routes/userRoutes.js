import express from 'express';
import * as userController from '../controllers/userController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateUpdateProfile, validateNotificationPreferences } from '../validators/userValidator.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

router.get('/profile', userController.getProfile);
router.put('/profile', validateUpdateProfile, userController.updateProfile);
router.get('/amacoins', userController.getAmacoins);
router.get('/visits', userController.getVisits);
router.put('/notification-preferences', validateNotificationPreferences, userController.updateNotificationPreferences);

export default router;