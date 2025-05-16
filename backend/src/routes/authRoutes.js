const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister, validateLogin, validateChangePassword } = require('../validators/authValidator');
const { authMiddleware } = require('../middleware/auth');

// Rotas públicas
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh', authController.refreshToken);

// Rotas protegidas (requerem autenticação)
router.get('/me', authMiddleware, authController.getMe);
router.post('/change-password', authMiddleware, validateChangePassword, authController.changePassword);

module.exports = router;