const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');
const { validateUpdateProfile, validateNotificationPreferences } = require('../validators/userValidator');

// Todas as rotas requerem autenticação
router.use(authMiddleware);

router.get('/profile', userController.getProfile);
router.put('/profile', validateUpdateProfile, userController.updateProfile);
router.get('/amacoins', userController.getAmacoins);
router.get('/visits', userController.getVisits);
router.put('/notification-preferences', validateNotificationPreferences, userController.updateNotificationPreferences);

module.exports = router;