const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { authMiddleware } = require('../middleware/auth');
const { validateQuizAnswer } = require('../validators/quizValidator');

// Rotas públicas
router.get('/', quizController.getQuizzes);
router.get('/leaderboard', quizController.getLeaderboard);

// CORREÇÃO: Rotas protegidas sem parâmetros devem vir antes das rotas com parâmetros
router.get('/attempts', authMiddleware, quizController.getQuizAttempts);

// Rotas com parâmetros dinâmicos por último
router.get('/:id', quizController.getQuiz);
router.post('/:id/start', authMiddleware, quizController.startQuiz);
router.post('/attempts/:attempt_id/answer', authMiddleware, validateQuizAnswer, quizController.answerQuiz);
router.post('/attempts/:attempt_id/submit', authMiddleware, quizController.submitQuiz);

module.exports = router;