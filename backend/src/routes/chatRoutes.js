import express from 'express';
import * as chatController from '../controllers/chatController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateChatMessage } from '../validators/chatValidator.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

router.post('/message', validateChatMessage, chatController.sendMessage);
router.get('/history', chatController.getHistory);
router.get('/context/:entity_type/:entity_id', chatController.getContext);
router.post('/feedback', chatController.sendFeedback);

export default router;
