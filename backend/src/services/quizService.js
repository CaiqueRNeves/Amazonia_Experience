import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import User from '../models/User.js';
import { NotFoundError, ValidationError, ForbiddenError } from '../middleware/error.js';

/**
 * Serviço responsável por operações relacionadas a quizzes
 */
class QuizService {
  /**
   * Lista quizzes disponíveis
   * @param {number} page - Página atual
   * @param {number} limit - Limite por página
   * @param {Object} filters - Filtros para a busca
   * @returns {Array} - Lista de quizzes
   */
  async getQuizzes(page = 1, limit = 10, filters = {}) {
    return Quiz.findAll(page, limit, filters);
  }

  /**
   * Obtém detalhes de um quiz específico
   * @param {number} quizId - ID do quiz
   * @returns {Object} - Detalhes do quiz com perguntas
   */
  async getQuiz(quizId) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new NotFoundError('Quiz não encontrado');
    }
    
    // Obter perguntas do quiz
    const questions = await Quiz.getQuestions(quizId);
    
    // Remover respostas corretas das perguntas para não dar spoiler
    const sanitizedQuestions = questions.map(q => {
      const { correct_answer, ...question } = q;
      
      // Desserializar opções se for de múltipla escolha
      if (question.question_type === 'multiple_choice' && typeof question.options === 'string') {
        try {
          question.options = JSON.parse(question.options);
        } catch (error) {
          console.error('Erro ao desserializar opções de pergunta:', error);
          question.options = [];
        }
      }
      
      return question;
    });
    
    return {
      quiz,
      questions: sanitizedQuestions
    };
  }

  /**
   * Inicia uma nova tentativa de quiz
   * @param {number} userId - ID do usuário
   * @param {number} quizId - ID do quiz
   * @returns {Object} - Dados da tentativa iniciada
   */
  async startQuiz(userId, quizId) {
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
      return {
        attempt: ongoingAttempt,
        message: 'Você já tem uma tentativa em andamento para este quiz'
      };
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
    
    return {
      attempt,
      quiz: {
        title: quiz.title,
        description: quiz.description,
        difficulty: quiz.difficulty,
        amacoins_reward: quiz.amacoins_reward
      },
      expires_at: expiresAt
    };
  }

  /**
   * Registra resposta de uma pergunta do quiz
   * @param {number} userId - ID do usuário
   * @param {number} attemptId - ID da tentativa
   * @param {number} questionId - ID da pergunta
   * @param {string} answer - Resposta do usuário
   * @returns {Object} - Resultado da resposta
   */
  async answerQuiz(userId, attemptId, questionId, answer) {
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
    const question = await Quiz.getQuestionById(questionId);
    if (!question || question.quiz_id !== attempt.quiz_id) {
      throw new ValidationError('Esta pergunta não pertence ao quiz atual');
    }
    
    // Verificar se esta pergunta já foi respondida nesta tentativa
    const existingAnswer = await QuizAttempt.getAnswer(attemptId, questionId);
    if (existingAnswer) {
      throw new ValidationError('Esta pergunta já foi respondida');
    }
    
    // Salvar resposta
    const isCorrect = answer === question.correct_answer;
    await QuizAttempt.saveAnswer(attemptId, questionId, answer, isCorrect);
    
    return {
      is_correct: isCorrect,
      question_id: questionId
    };
  }

  /**
   * Finaliza uma tentativa de quiz
   * @param {number} userId - ID do usuário
   * @param {number} attemptId - ID da tentativa
   * @returns {Object} - Resultado da tentativa
   */
  async submitQuiz(userId, attemptId) {
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
    
    // Incrementar pontos de quiz (1 ponto por % de acerto)
    const user = await User.findById(userId);
    await User.update(userId, { quiz_points: user.quiz_points + score });
    
    return {
      score,
      total_questions: totalQuestions,
      correct_answers: correctAnswers,
      amacoins_earned: earnedAmacoins
    };
  }

  /**
   * Obtém histórico de tentativas de quiz do usuário
   * @param {number} userId - ID do usuário
   * @param {number} page - Página atual
   * @param {number} limit - Limite por página
   * @returns {Array} - Histórico de tentativas
   */
  async getUserAttempts(userId, page = 1, limit = 10) {
    return QuizAttempt.findByUserId(userId, page, limit);
  }

  /**
   * Obtém ranking de usuários em quizzes
   * @param {number} page - Página atual
   * @param {number} limit - Limite por página
   * @param {number} quizId - ID do quiz específico (opcional)
   * @returns {Array} - Ranking de usuários
   */
  async getLeaderboard(page = 1, limit = 10, quizId = null) {
    return QuizAttempt.getLeaderboard(page, limit, quizId);
  }

  /**
   * Cria um novo quiz (admin)
   * @param {Object} quizData - Dados do quiz
   * @returns {Object} - Quiz criado
   */
  async createQuiz(quizData) {
    const { title, description, difficulty, topic, amacoins_reward, questions } = quizData;
    
    // Criar quiz
    const quiz = await Quiz.create({
      title,
      description,
      difficulty,
      topic,
      amacoins_reward,
      created_at: new Date()
    });
    
    // Adicionar perguntas ao quiz
    if (questions && Array.isArray(questions)) {
      for (const questionData of questions) {
        await Quiz.addQuestion(quiz.id, questionData);
      }
    }
    
    // Buscar quiz completo com perguntas
    const createdQuiz = await Quiz.findById(quiz.id);
    const createdQuestions = await Quiz.getQuestions(quiz.id);
    
    return {
      quiz: createdQuiz,
      questions: createdQuestions
    };
  }

  /**
   * Atualiza um quiz existente (admin)
   * @param {number} quizId - ID do quiz
   * @param {Object} quizData - Novos dados do quiz
   * @returns {Object} - Quiz atualizado
   */
  async updateQuiz(quizId, quizData) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new NotFoundError('Quiz não encontrado');
    }
    
    const { title, description, difficulty, topic, amacoins_reward, questions } = quizData;
    
    // Atualizar dados básicos do quiz
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (difficulty) updateData.difficulty = difficulty;
    if (topic) updateData.topic = topic;
    if (amacoins_reward) updateData.amacoins_reward = amacoins_reward;
    
    await Quiz.update(quizId, updateData);
    
    // Atualizar perguntas, se fornecidas
    if (questions && Array.isArray(questions)) {
      for (const questionData of questions) {
        if (questionData.id) {
          // Atualizar pergunta existente
          await Quiz.updateQuestion(questionData.id, questionData);
        } else {
          // Adicionar nova pergunta
          await Quiz.addQuestion(quizId, questionData);
        }
      }
    }
    
    // Buscar quiz atualizado
    const updatedQuiz = await Quiz.findById(quizId);
    const updatedQuestions = await Quiz.getQuestions(quizId);
    
    return {
      quiz: updatedQuiz,
      questions: updatedQuestions
    };
  }

  /**
   * Exclui um quiz (admin)
   * @param {number} quizId - ID do quiz
   * @returns {boolean} - Sucesso da operação
   */
  async deleteQuiz(quizId) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new NotFoundError('Quiz não encontrado');
    }
    
    // Excluir todas as perguntas do quiz
    await Quiz.deleteAllQuestions(quizId);
    
    // Excluir o quiz
    await Quiz.delete(quizId);
    
    return true;
  }
}

export default new QuizService();