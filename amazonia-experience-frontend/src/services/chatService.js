import apiService from './apiService';
import errorService from './errorService';

/**
 * Serviço para operações relacionadas ao chatbot
 * Gerencia envio de mensagens, histórico e feedback
 */
const chatService = {
  /**
   * Envia uma mensagem para o chatbot
   * @param {string} message - Mensagem a ser enviada
   * @param {string} contextType - Tipo de contexto (geral, evento, lugar, etc)
   * @param {number} contextId - ID do contexto, se aplicável
   * @returns {Promise<Object>} Resposta do chatbot
   */
  async sendMessage(message, contextType = 'general', contextId = null) {
    try {
      const data = {
        message,
        context_type: contextType,
        context_id: contextId
      };
      
      const response = await apiService.post('/chat/message', data);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao enviar mensagem para o chatbot',
        error
      });
      throw error;
    }
  },

  /**
   * Obtém histórico de conversas
   * @param {Object} params - Parâmetros de filtragem (context_type, context_id, etc)
   * @returns {Promise<Object>} Histórico de conversas
   */
  async getHistory(params = {}) {
    try {
      const response = await apiService.get('/chat/history', { params });
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao obter histórico de conversas',
        error
      });
      throw error;
    }
  },

  /**
   * Obtém informações contextuais para uma entidade específica
   * @param {string} entityType - Tipo de entidade (evento, lugar, etc)
   * @param {number} entityId - ID da entidade
   * @returns {Promise<Object>} Informações contextuais
   */
  async getContext(entityType, entityId) {
    try {
      const response = await apiService.get(`/chat/context/${entityType}/${entityId}`);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: `Erro ao obter contexto para ${entityType} ${entityId}`,
        error
      });
      throw error;
    }
  },

  /**
   * Envia feedback sobre uma resposta do chatbot
   * @param {number} messageId - ID da mensagem
   * @param {boolean} isHelpful - Se a resposta foi útil
   * @param {string} feedbackText - Texto do feedback (opcional)
   * @returns {Promise<Object>} Confirmação do feedback
   */
  async sendFeedback(messageId, isHelpful, feedbackText = '') {
    try {
      const data = {
        message_id: messageId,
        is_helpful: isHelpful,
        feedback_text: feedbackText
      };
      
      const response = await apiService.post('/chat/feedback', data);
      return response.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao enviar feedback',
        error
      });
      throw error;
    }
  },
  
  /**
   * Consulta o chatbot para uma pesquisa rápida (sem armazenar no histórico)
   * @param {string} query - Consulta a ser enviada
   * @returns {Promise<string>} Resposta do chatbot
   */
  async quickAnswer(query) {
    try {
      const data = {
        message: query,
        store_history: false
      };
      
      const response = await apiService.post('/chat/quick-answer', data);
      return response.data.data.message;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao obter resposta rápida',
        error
      });
      throw error;
    }
  },
  
  /**
   * Exporta histórico de conversas em formato de arquivo
   * @param {string} format - Formato de exportação (pdf, txt, json)
   * @param {Object} params - Parâmetros de filtragem
   * @returns {Promise<Blob>} Arquivo com o histórico
   */
  async exportHistory(format = 'json', params = {}) {
    try {
      const response = await apiService.get('/chat/export', {
        params: { 
          ...params, 
          format 
        },
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao exportar histórico de conversas',
        error
      });
      throw error;
    }
  },
  
  /**
   * Limpa histórico de conversas
   * @param {string} contextType - Tipo de contexto a limpar (opcional)
   * @param {number} contextId - ID do contexto a limpar (opcional)
   * @returns {Promise<Object>} Confirmação da operação
   */
  async clearHistory(contextType = null, contextId = null) {
    try {
      const data = {};
      
      if (contextType) {
        data.context_type = contextType;
      }
      
      if (contextId) {
        data.context_id = contextId;
      }
      
      const response = await apiService.post('/chat/clear-history', data);
      return response.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao limpar histórico de conversas',
        error
      });
      throw error;
    }
  }
};

export default chatService;