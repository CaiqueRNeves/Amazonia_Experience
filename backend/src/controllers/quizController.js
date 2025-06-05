import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import User from '../models/User.js';
import { NotFoundError, ValidationError, ForbiddenError } from '../middleware/error.js';

// Listar quizzes disponíveis
export const getQuizzes = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Construir filtros a partir dos query params
    const filters = {};
    
    if (req.query.difficulty) {
      filters.difficulty = req.query.difficulty;
    }
    
    if (req.query.topic) {
      filters.topic = req.query.topic;
    }
    
    if (req.query.search) {
      filters.search = req.query.search;
    }
    
    const quizzes = await Quiz.findAll(page, limit, filters);
    
    res.json({
      status: 'success',
      data: {
        quizzes,
        pagination: {
          page,
          limit
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obter detalhes e perguntas de um quiz
export const getQuiz = async (req, res, next) => {
  try {
    const quizId = req.params.id;
    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) {
      throw new NotFoundError('Quiz não encontrado');
    }
    
    // Obter perguntas do quiz
    const questions = await Quiz.getQuestions(quizId);
    
    // Remover respostas corretas das perguntas para não dar spoiler
    const sanitizedQuestions = questions.map(q => {
      const { correct_answer, ...question } = q;
      return question;
    });
    
    res.json({
      status: 'success',
      data: {
        quiz,
        questions: sanitizedQuestions
      }
    });
  } catch (error) {
    next(error);
  }
};

// Iniciar tentativa de um quiz
export const startQuiz = async (req, res, next) => {
  try {
    const quizId = req.params.id;
    const userId = req.user.id;
    
    // Verificar se o quiz existe
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new NotFoundError('Quiz não encontrado');
    }
    
    // Verificar se o usuário já atingiu o limite de tentativas por dia
    const attemptsToday = await QuizAttempt.countTodayAttempts(userId, quizId);
    const maxAttempts = parseInt(process.env.QUIZ_MAX_ATTEMPTS_PER_DAY) || 5;
    
    if (attemptsToday >= maxAttempts) {
      throw new ValidationError(`Você já atingiu o limite de ${maxAttempts} tentativas por dia para este quiz`);
    }
    
    // Verificar se o usuário tem alguma tentativa em andamento
    const ongoingAttempt = await QuizAttempt.findOngoing(userId, quizId);
    if (ongoingAttempt) {
      return res.json({
        status: 'success',
        data: {
          attempt: ongoingAttempt,
          message: 'Você já tem uma tentativa em andamento para este quiz'
        }
      });
    }
    
    // Iniciar nova tentativa
    const timeoutMinutes = parseInt(process.env.QUIZ_DEFAULT_TIMEOUT_MINUTES) || 15;
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + timeoutMinutes);
    
    const attempt = await QuizAttempt.create({
      user_id: userId,
      quiz_id: quizId,
      started_at: new Date(),
      expires_at: expiresAt,
      status: 'in_progress'
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        attempt,
        quiz: {
          title: quiz.title,
          description: quiz.description,
          difficulty: quiz.difficulty,
          amacoins_reward: quiz.amacoins_reward
        },
        expires_at: expiresAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// Responder pergunta de quiz
export const answerQuiz = async (req, res, next) => {
  try {
    const attemptId = req.params.attempt_id;
    const userId = req.user.id;
    const { question_id, answer } = req.body;
    
    // Verificar se a tentativa existe e pertence ao usuário
    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) {
      throw new NotFoundError('Tentativa não encontrada');
    }
    
    if (attempt.user_id !== userId) {
      throw new ForbiddenError('Esta tentativa não pertence a você');
    }
    
    // Verificar se a tentativa ainda está em andamento
    if (attempt.status !== 'in_progress') {
      throw new ValidationError('Esta tentativa já foi finalizada');
    }
    
    // Verificar se a tentativa expirou
    const now = new Date();
    if (new Date(attempt.expires_at) < now) {
      // Atualizar status para expirado
      await QuizAttempt.update(attemptId, { status: 'expired' });
      throw new ValidationError('O tempo para responder este quiz expirou');
    }
    
    // Verificar se a pergunta pertence ao quiz
    const question = await Quiz.getQuestionById(question_id);
    if (!question || question.quiz_id !== attempt.quiz_id) {
      throw new ValidationError('Esta pergunta não pertence ao quiz atual');
    }
    
    // Verificar se esta pergunta já foi respondida nesta tentativa
    const existingAnswer = await QuizAttempt.getAnswer(attemptId, question_id);
    if (existingAnswer) {
      throw new ValidationError('Esta pergunta já foi respondida');
    }
    
    // Salvar resposta
    const isCorrect = answer === question.correct_answer;
    await QuizAttempt.saveAnswer(attemptId, question_id, answer, isCorrect);
    
    res.json({
      status: 'success',
      data: {
        is_correct: isCorrect,
        question_id
      }
    });
  } catch (error) {
    next(error);
  }
};

// Finalizar tentativa de quiz
export const submitQuiz = async (req, res, next) => {
  try {
    const attemptId = req.params.attempt_id;
    const userId = req.user.id;
    
    // Verificar se a tentativa existe e pertence ao usuário
    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) {
      throw new NotFoundError('Tentativa não encontrada');
    }
    
    if (attempt.user_id !== userId) {
      throw new ForbiddenError('Esta tentativa não pertence a você');
    }
    
    // Verificar se a tentativa ainda está em andamento
    if (attempt.status !== 'in_progress') {
      throw new ValidationError('Esta tentativa já foi finalizada');
    }
    
    // Obter quiz relacionado
    const quiz = await Quiz.findById(attempt.quiz_id);
    
    // Calcular pontuação
    const answers = await QuizAttempt.getAnswers(attemptId);
    const totalQuestions = await Quiz.countQuestions(attempt.quiz_id);
    const correctAnswers = answers.filter(a => a.is_correct).length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    
    // Calcular recompensa em AmaCoins
    const rewardPercentage = score / 100;
    const earnedAmacoins = Math.round(quiz.amacoins_reward * rewardPercentage);
    
    // Atualizar tentativa
    await QuizAttempt.update(attemptId, {
      completed_at: new Date(),
      status: 'completed',
      score,
      amacoins_earned: earnedAmacoins
    });
    
    // Atualizar pontos de quiz e AmaCoins do usuário
    await User.updateAmacoins(userId, earnedAmacoins);
    await User.update(userId, { quiz_points: { increment: score } });
    
    res.json({
      status: 'success',
      data: {
        score,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        amacoins_earned: earnedAmacoins
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obter histórico de quizzes realizados pelo usuário
export const getQuizAttempts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const attempts = await QuizAttempt.findByUserId(userId, page, limit);
    
    res.json({
      status: 'success',
      data: {
        attempts,
        pagination: {
          page,
          limit
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obter ranking de usuários em quizzes
export const getLeaderboard = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const quizId = req.query.quiz_id; // Opcional: leaderboard específico por quiz
    
    const leaderboard = await QuizAttempt.getLeaderboard(page, limit, quizId);
    
    res.json({
      status: 'success',
      data: {
        leaderboard,
        pagination: {
          page,
          limit
        }
      }
    });
  } catch (error) {
    next(error);
  }
};