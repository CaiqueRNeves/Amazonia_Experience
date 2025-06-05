import express from 'express';
import * as quizController from '../controllers/quizController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateQuizAnswer } from '../validators/quizValidator.js';

const router = express.Router();

// Rotas públicas
router.get('/', quizController.getQuizzes);
router.get('/leaderboard', quizController.getLeaderboard);

// Rotas protegidas sem parâmetros devem vir antes das rotas com parâmetros
router.get('/attempts', authMiddleware, quizController.getQuizAttempts);

// Rotas com parâmetros dinâmicos por último
router.get('/:id', quizController.getQuiz);
router.post('/:id/start', authMiddleware, quizController.startQuiz);
router.post('/attempts/:attempt_id/answer', authMiddleware, validateQuizAnswer, quizController.answerQuiz);
router.post('/attempts/:attempt_id/submit', authMiddleware, quizController.submitQuiz);

export default router;