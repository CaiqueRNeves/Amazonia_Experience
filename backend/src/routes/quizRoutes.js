const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { authMiddleware } = require('../middleware/auth');
const { validateQuizAnswer } = require('../validators/quizValidator');

// Rotas públicas
router.get('/', quizController.getQuizzes);
router.get('/leaderboard', quizController.getLeaderboard); // CORRETO: antes da rota com parâmetro
router.get('/:id', quizController.getQuiz);

// Rotas protegidas (requerem autenticação)
router.post('/:id/start', authMiddleware, quizController.startQuiz);
router.post('/attempts/:attempt_id/answer', authMiddleware, validateQuizAnswer, quizController.answerQuiz);
router.post('/attempts/:attempt_id/submit', authMiddleware, quizController.submitQuiz);
router.get('/attempts', authMiddleware, quizController.getQuizAttempts);

module.exports = router;