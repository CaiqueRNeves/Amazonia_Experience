const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authMiddleware } = require('../middleware/auth');
const { validateChatMessage } = require('../validators/chatValidator');

// Todas as rotas requerem autenticação
router.use(authMiddleware);

router.post('/message', validateChatMessage, chatController.sendMessage);
router.get('/history', chatController.getHistory);
router.get('/context/:entity_type/:entity_id', chatController.getContext);
router.post('/feedback', chatController.sendFeedback);

module.exports = router;