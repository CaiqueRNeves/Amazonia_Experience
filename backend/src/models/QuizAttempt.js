import db from '../config/database.js';

class QuizAttempt {
  // Métodos de busca
  static findById(id) {
    return db('quiz_attempts').where({ id }).first();
  }

  // Criar tentativa
  static async create(attemptData) {
    const [id] = await db('quiz_attempts').insert(attemptData);
    return this.findById(id);
  }

  // Atualizar tentativa
  static async update(id, data) {
    await db('quiz_attempts').where({ id }).update(data);
    return this.findById(id);
  }

  // Buscar tentativas por usuário
  static findByUserId(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    return db('quiz_attempts')
      .where({ user_id: userId })
      .join('quizzes', 'quiz_attempts.quiz_id', '=', 'quizzes.id')
      .select(
        'quiz_attempts.*',
        'quizzes.title as quiz_title',
        'quizzes.difficulty as quiz_difficulty'
      )
      .limit(limit)
      .offset(offset)
      .orderBy('quiz_attempts.started_at', 'desc');
  }

  // Buscar tentativa em andamento
  static findOngoing(userId, quizId) {
    return db('quiz_attempts')
      .where({
        user_id: userId,
        quiz_id: quizId,
        status: 'in_progress'
      })
      .first();
  }

  // Contar tentativas do dia
  static async countTodayAttempts(userId, quizId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await db('quiz_attempts')
      .where({
        user_id: userId,
        quiz_id: quizId
      })
      .where('started_at', '>=', today)
      .count('id as count')
      .first();
    
    return parseInt(result.count);
  }

  // Salvar resposta
  static async saveAnswer(attemptId, questionId, answer, isCorrect) {
    const [id] = await db('quiz_answers').insert({
      attempt_id: attemptId,
      question_id: questionId,
      answer,
      is_correct: isCorrect,
      answered_at: new Date()
    });
    
    return db('quiz_answers').where({ id }).first();
  }

  // Buscar resposta
  static getAnswer(attemptId, questionId) {
    return db('quiz_answers')
      .where({
        attempt_id: attemptId,
        question_id: questionId
      })
      .first();
  }

  // Buscar todas as respostas de uma tentativa
  static getAnswers(attemptId) {
    return db('quiz_answers')
      .where({ attempt_id: attemptId })
      .select('*');
  }

  // Obter ranking de usuários
  static async getLeaderboard(page = 1, limit = 10, quizId = null) {
    const offset = (page - 1) * limit;
    
    let query = db('users')
      .select(
        'users.id',
        'users.name',
        'users.nationality',
        'users.quiz_points',
        db.raw('COUNT(DISTINCT quiz_attempts.id) as attempts_count'),
        db.raw('SUM(CASE WHEN quiz_attempts.score >= 80 THEN 1 ELSE 0 END) as high_scores')
      )
      .leftJoin('quiz_attempts', 'users.id', '=', 'quiz_attempts.user_id')
      .where('quiz_attempts.status', 'completed');
    
    // Filtrar por quiz específico, se fornecido
    if (quizId) {
      query = query.where('quiz_attempts.quiz_id', quizId);
    }
    
    return query
      .groupBy('users.id')
      .orderBy('users.quiz_points', 'desc')
      .limit(limit)
      .offset(offset);
  }
}

export default QuizAttempt;