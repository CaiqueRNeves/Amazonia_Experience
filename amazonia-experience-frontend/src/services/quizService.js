import apiService from './apiService';
import errorService from './errorService';

/**
 * Serviço para operações relacionadas a quizzes
 * Gerencia listagem, detalhes, tentativas e submissão de quizzes
 */
const quizService = {
  /**
   * Obtém lista de quizzes com paginação e filtros
   * @param {Object} params - Parâmetros de consulta (página, limite, filtros)
   * @returns {Promise<Object>} Lista paginada de quizzes
   */
  async getQuizzes(params = {}) {
    try {
      const response = await apiService.get('/quizzes', params);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao obter quizzes',
        error
      });
      throw error;
    }
  },

  /**
   * Obtém detalhes de um quiz específico
   * @param {number} id - ID do quiz
   * @returns {Promise<Object>} Detalhes do quiz com perguntas
   */
  async getQuizById(id) {
    try {
      const response = await apiService.get(`/quizzes/${id}`);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: `Erro ao obter quiz ${id}`,
        error
      });
      throw error;
    }
  },

  /**
   * Inicia uma nova tentativa de quiz
   * @param {number} quizId - ID do quiz
   * @returns {Promise<Object>} Dados da tentativa iniciada
   */
  async startQuiz(quizId) {
    try {
      const response = await apiService.post(`/quizzes/${quizId}/start`);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: `Erro ao iniciar quiz ${quizId}`,
        error
      });
      throw error;
    }
  },

  /**
   * Envia resposta para uma pergunta do quiz
   * @param {number} attemptId - ID da tentativa
   * @param {number} questionId - ID da pergunta
   * @param {string} answer - Resposta do usuário
   * @returns {Promise<Object>} Resultado da resposta
   */
  async answerQuiz(attemptId, questionId, answer) {
    try {
      const response = await apiService.post(`/quizzes/attempts/${attemptId}/answer`, {
        question_id: questionId,
        answer
      });
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: `Erro ao responder pergunta ${questionId} na tentativa ${attemptId}`,
        error
      });
      throw error;
    }
  },

  /**
   * Finaliza e submete uma tentativa de quiz
   * @param {number} attemptId - ID da tentativa
   * @returns {Promise<Object>} Resultado da tentativa
   */
  async submitQuiz(attemptId) {
    try {
      const response = await apiService.post(`/quizzes/attempts/${attemptId}/submit`);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: `Erro ao submeter tentativa ${attemptId}`,
        error
      });
      throw error;
    }
  },

  /**
   * Obtém histórico de tentativas de quiz do usuário
   * @param {Object} params - Parâmetros de consulta (página, limite)
   * @returns {Promise<Object>} Histórico de tentativas
   */
  async getQuizAttempts(params = {}) {
    try {
      const response = await apiService.get('/quizzes/attempts', params);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao obter histórico de tentativas',
        error
      });
      throw error;
    }
  },

  /**
   * Obtém o ranking de usuários em quizzes
   * @param {number} quizId - ID do quiz específico (opcional)
   * @param {Object} params - Parâmetros de consulta (página, limite)
   * @returns {Promise<Object>} Ranking de usuários
   */
  async getLeaderboard(quizId = null, params = {}) {
    try {
      const queryParams = { ...params };
      
      if (quizId) {
        queryParams.quiz_id = quizId;
      }
      
      const response = await apiService.get('/quizzes/leaderboard', queryParams);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao obter ranking de quizzes',
        error
      });
      throw error;
    }
  },
  
  /**
   * Obtém detalhes de uma tentativa específica
   * @param {number} attemptId - ID da tentativa
   * @returns {Promise<Object>} Detalhes da tentativa
   */
  async getAttemptById(attemptId) {
    try {
      const response = await apiService.get(`/quizzes/attempts/${attemptId}`);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: `Erro ao obter detalhes da tentativa ${attemptId}`,
        error
      });
      throw error;
    }
  },
  
  /**
   * Obtém quizzes por dificuldade
   * @param {string} difficulty - Nível de dificuldade (easy, medium, hard)
   * @param {Object} params - Parâmetros de consulta (página, limite)
   * @returns {Promise<Object>} Lista paginada de quizzes
   */
  async getQuizzesByDifficulty(difficulty, params = {}) {
    try {
      const queryParams = {
        ...params,
        difficulty
      };
      
      const response = await apiService.get('/quizzes', queryParams);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: `Erro ao obter quizzes com dificuldade ${difficulty}`,
        error
      });
      throw error;
    }
  },
  
  /**
   * Obtém quizzes por tópico
   * @param {string} topic - Tópico do quiz
   * @param {Object} params - Parâmetros de consulta (página, limite)
   * @returns {Promise<Object>} Lista paginada de quizzes
   */
  async getQuizzesByTopic(topic, params = {}) {
    try {
      const queryParams = {
        ...params,
        topic
      };
      
      const response = await apiService.get('/quizzes', queryParams);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: `Erro ao obter quizzes do tópico ${topic}`,
        error
      });
      throw error;
    }
  },
  
  /**
   * Busca quizzes por termo
   * @param {string} searchTerm - Termo de busca
   * @param {Object} params - Parâmetros de consulta (página, limite)
   * @returns {Promise<Object>} Lista paginada de quizzes correspondentes à busca
   */
  async searchQuizzes(searchTerm, params = {}) {
    try {
      const queryParams = {
        ...params,
        search: searchTerm
      };
      
      const response = await apiService.get('/quizzes', queryParams);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: `Erro ao buscar quizzes com termo "${searchTerm}"`,
        error
      });
      throw error;
    }
  }
};

export default quizService;