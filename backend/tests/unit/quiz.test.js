import quizService from '../../src/services/quizService.js';
import Quiz from '../../src/models/Quiz.js';
import QuizAttempt from '../../src/models/QuizAttempt.js';
import User from '../../src/models/User.js';

// Mock dos modelos
jest.mock('../../src/models/Quiz.js');
jest.mock('../../src/models/QuizAttempt.js');
jest.mock('../../src/models/User.js');

describe('QuizService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock do process.env
    process.env.QUIZ_MAX_ATTEMPTS_PER_DAY = '5';
    process.env.QUIZ_DEFAULT_TIMEOUT_MINUTES = '15';
  });

  describe('startQuiz', () => {
    it('deve iniciar um novo quiz com sucesso', async () => {
      const quizId = 1;
      const userId = 2;

      // Mock do quiz
      const mockQuiz = {
        id: quizId,
        title: 'Test Quiz',
        description: 'Test Description',
        difficulty: 'medium',
        amacoins_reward: 50
      };

      // Mock das funções
      Quiz.findById.mockResolvedValue(mockQuiz);
      QuizAttempt.countTodayAttempts.mockResolvedValue(0); // Nenhuma tentativa hoje
      QuizAttempt.findOngoing.mockResolvedValue(null); // Nenhuma tentativa em andamento
      
      // Mock da criação da tentativa
      const mockAttempt = {
        id: 1,
        user_id: userId,
        quiz_id: quizId,
        status: 'in_progress'
      };
      QuizAttempt.create.mockResolvedValue(mockAttempt);

      // Executar o método
      const result = await quizService.startQuiz(userId, quizId);

      // Verificações
      expect(Quiz.findById).toHaveBeenCalledWith(quizId);
      expect(QuizAttempt.countTodayAttempts).toHaveBeenCalledWith(userId, quizId);
      expect(QuizAttempt.findOngoing).toHaveBeenCalledWith(userId, quizId);
      expect(QuizAttempt.create).toHaveBeenCalled();
      expect(result).toHaveProperty('attempt');
      expect(result).toHaveProperty('quiz');
      expect(result).toHaveProperty('expires_at');
      expect(result.quiz).toHaveProperty('title', 'Test Quiz');
      expect(result.quiz).toHaveProperty('amacoins_reward', 50);
    });

    it('deve retornar a tentativa existente se já houver uma em andamento', async () => {
      const quizId = 1;
      const userId = 2;

      // Mock do quiz
      const mockQuiz = {
        id: quizId,
        title: 'Test Quiz'
      };

      // Mock da tentativa em andamento
      const ongoingAttempt = {
        id: 1,
        user_id: userId,
        quiz_id: quizId,
        status: 'in_progress'
      };

      // Mock das funções
      Quiz.findById.mockResolvedValue(mockQuiz);
      QuizAttempt.countTodayAttempts.mockResolvedValue(2); // 2 tentativas hoje
      QuizAttempt.findOngoing.mockResolvedValue(ongoingAttempt); // Tentativa em andamento

      // Executar o método
      const result = await quizService.startQuiz(userId, quizId);

      // Verificações
      expect(Quiz.findById).toHaveBeenCalledWith(quizId);
      expect(QuizAttempt.countTodayAttempts).toHaveBeenCalledWith(userId, quizId);
      expect(QuizAttempt.findOngoing).toHaveBeenCalledWith(userId, quizId);
      expect(QuizAttempt.create).not.toHaveBeenCalled(); // Não deve criar nova tentativa
      expect(result).toHaveProperty('attempt', ongoingAttempt);
      expect(result).toHaveProperty('message', 'Você já tem uma tentativa em andamento para este quiz');
    });

    it('deve lançar erro se o usuário atingiu o limite diário de tentativas', async () => {
      const quizId = 1;
      const userId = 2;

      // Mock do quiz
      const mockQuiz = {
        id: quizId,
        title: 'Test Quiz'
      };

      // Mock das funções
      Quiz.findById.mockResolvedValue(mockQuiz);
      QuizAttempt.countTodayAttempts.mockResolvedValue(5); // Máximo de tentativas atingido
      QuizAttempt.findOngoing.mockResolvedValue(null);

      // Executar o método e verificar se o erro é lançado
      await expect(quizService.startQuiz(userId, quizId)).rejects.toThrow('Você já atingiu o limite de 5 tentativas por dia para este quiz');
      expect(Quiz.findById).toHaveBeenCalledWith(quizId);
      expect(QuizAttempt.countTodayAttempts).toHaveBeenCalledWith(userId, quizId);
      expect(QuizAttempt.create).not.toHaveBeenCalled();
    });
  });

  describe('submitQuiz', () => {
    it('deve calcular a pontuação corretamente e conceder AmaCoins', async () => {
      const attemptId = 1;
      const userId = 2;
      const quizId = 3;

      // Mock da tentativa
      const mockAttempt = {
        id: attemptId,
        user_id: userId,
        quiz_id: quizId,
        status: 'in_progress'
      };

      // Mock do quiz
      const mockQuiz = {
        id: quizId,
        title: 'Test Quiz',
        amacoins_reward: 100
      };

      // Mock das respostas
      const mockAnswers = [
        { is_correct: true },
        { is_correct: true },
        { is_correct: false },
        { is_correct: true }
      ];

      // Mock das funções
      QuizAttempt.findById.mockResolvedValue(mockAttempt);
      Quiz.findById.mockResolvedValue(mockQuiz);
      QuizAttempt.getAnswers.mockResolvedValue(mockAnswers);
      Quiz.countQuestions.mockResolvedValue(4);
      User.findById.mockResolvedValue({ quiz_points: 50 });

      // Executar o método
      const result = await quizService.submitQuiz(userId, attemptId);

      // Verificações
      expect(QuizAttempt.findById).toHaveBeenCalledWith(attemptId);
      expect(Quiz.findById).toHaveBeenCalledWith(quizId);
      expect(QuizAttempt.getAnswers).toHaveBeenCalledWith(attemptId);
      expect(Quiz.countQuestions).toHaveBeenCalledWith(quizId);
      expect(QuizAttempt.update).toHaveBeenCalledWith(attemptId, {
        completed_at: expect.any(Date),
        status: 'completed',
        score: 75, // 3/4 = 75%
        amacoins_earned: 75 // 75% of 100
      });
      expect(User.updateAmacoins).toHaveBeenCalledWith(userId, 75);
      expect(User.update).toHaveBeenCalledWith(userId, { quiz_points: 125 }); // 50 + 75
      expect(result).toHaveProperty('score', 75);
      expect(result).toHaveProperty('total_questions', 4);
      expect(result).toHaveProperty('correct_answers', 3);
      expect(result).toHaveProperty('amacoins_earned', 75);
    });

    it('deve lançar erro se a tentativa não pertencer ao usuário', async () => {
      const attemptId = 1;
      const userId = 2;

      // Mock da tentativa pertencente a outro usuário
      const mockAttempt = {
        id: attemptId,
        user_id: 999, // Usuário diferente
        quiz_id: 3,
        status: 'in_progress'
      };

      // Mock das funções
      QuizAttempt.findById.mockResolvedValue(mockAttempt);

      // Executar o método e verificar se o erro é lançado
      await expect(quizService.submitQuiz(userId, attemptId)).rejects.toThrow('Esta tentativa não pertence a você');
      expect(QuizAttempt.findById).toHaveBeenCalledWith(attemptId);
      expect(Quiz.findById).not.toHaveBeenCalled();
    });

    it('deve lançar erro se a tentativa já estiver finalizada', async () => {
      const attemptId = 1;
      const userId = 2;

      // Mock da tentativa já finalizada
      const mockAttempt = {
        id: attemptId,
        user_id: userId,
        quiz_id: 3,
        status: 'completed' // Já finalizada
      };

      // Mock das funções
      QuizAttempt.findById.mockResolvedValue(mockAttempt);

      // Executar o método e verificar se o erro é lançado
      await expect(quizService.submitQuiz(userId, attemptId)).rejects.toThrow('Esta tentativa já foi finalizada');
      expect(QuizAttempt.findById).toHaveBeenCalledWith(attemptId);
      expect(Quiz.findById).not.toHaveBeenCalled();
    });
  });
});