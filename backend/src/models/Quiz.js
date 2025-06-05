import db from '../config/database.js';

class Quiz {
  // Métodos de busca
  static findById(id) {
    return db('quizzes').where({ id }).first();
  }

  static findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    
    let query = db('quizzes');
    
    // Aplicar filtros se fornecidos
    if (filters.difficulty) {
      query = query.where('difficulty', filters.difficulty);
    }
    
    if (filters.topic) {
      query = query.where('topic', filters.topic);
    }
    
    if (filters.search) {
      query = query.whereRaw('LOWER(title) LIKE ?', [`%${filters.search.toLowerCase()}%`])
        .orWhereRaw('LOWER(description) LIKE ?', [`%${filters.search.toLowerCase()}%`]);
    }
    
    return query
      .select('*')
      .limit(limit)
      .offset(offset)
      .orderBy('created_at', 'desc');
  }

  // Criar quiz
  static async create(quizData) {
    const [id] = await db('quizzes').insert(quizData);
    return this.findById(id);
  }

  // Atualizar quiz
  static async update(id, quizData) {
    await db('quizzes').where({ id }).update(quizData);
    return this.findById(id);
  }

  // Excluir quiz
  static delete(id) {
    return db('quizzes').where({ id }).del();
  }

  // Obter perguntas do quiz
  static getQuestions(quizId) {
    return db('quiz_questions')
      .where({ quiz_id: quizId })
      .orderBy('question_order');
  }

  // Obter uma pergunta específica
  static getQuestionById(questionId) {
    return db('quiz_questions')
      .where({ id: questionId })
      .first();
  }

  // Contar número de perguntas
  static countQuestions(quizId) {
    return db('quiz_questions')
      .where({ quiz_id: quizId })
      .count('id as count')
      .then(result => parseInt(result[0].count));
  }

  // Adicionar pergunta ao quiz
  static async addQuestion(quizId, questionData) {
    // Calcular a próxima ordem
    const lastQuestion = await db('quiz_questions')
      .where({ quiz_id: quizId })
      .orderBy('question_order', 'desc')
      .first();
    
    const nextOrder = lastQuestion ? lastQuestion.question_order + 1 : 1;
    
    // Se for pergunta de múltipla escolha, armazenar opções como JSON
    if (questionData.question_type === 'multiple_choice' && Array.isArray(questionData.options)) {
      questionData.options = JSON.stringify(questionData.options);
    }
    
    const [id] = await db('quiz_questions').insert({
      ...questionData,
      quiz_id: quizId,
      question_order: nextOrder
    });
    
    return this.getQuestionById(id);
  }

  // Atualizar pergunta
  static async updateQuestion(questionId, questionData) {
    // Se for pergunta de múltipla escolha, armazenar opções como JSON
    if (questionData.question_type === 'multiple_choice' && Array.isArray(questionData.options)) {
      questionData.options = JSON.stringify(questionData.options);
    }
    
    await db('quiz_questions')
      .where({ id: questionId })
      .update(questionData);
    
    return this.getQuestionById(questionId);
  }

  // Excluir pergunta
  static deleteQuestion(questionId) {
    return db('quiz_questions')
      .where({ id: questionId })
      .del();
  }

  // Excluir todas as perguntas de um quiz
  static deleteAllQuestions(quizId) {
    return db('quiz_questions')
      .where({ quiz_id: quizId })
      .del();
  }
}

export default Quiz;