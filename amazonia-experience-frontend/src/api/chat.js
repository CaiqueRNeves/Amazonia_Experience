import apiClient from './apiClient';

/**
 * Funções para interagir com a API de chat
 */
export const sendMessage = async (message, contextType = 'general', contextId = null) => {
  const data = {
    message,
    context_type: contextType,
    context_id: contextId
  };
  
  const response = await apiClient.post('/chat/message', data);
  return response.data.data;
};

export const getHistory = async (params = {}) => {
  const response = await apiClient.get('/chat/history', { params });
  return response.data.data;
};

export const getContext = async (entityType, entityId) => {
  const response = await apiClient.get(`/chat/context/${entityType}/${entityId}`);
  return response.data.data;
};

export const sendFeedback = async (messageId, isHelpful, feedbackText = '') => {
  const data = {
    message_id: messageId,
    is_helpful: isHelpful,
    feedback_text: feedbackText
  };
  
  const response = await apiClient.post('/chat/feedback', data);
  return response.data;
};