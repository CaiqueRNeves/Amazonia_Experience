import apiClient from './apiClient';

/**
 * Funções para interagir com a API de quizzes
 */
export const getQuizzes = async (params = {}) => {
  const response = await apiClient.get('/quizzes', { params });
  return response.data.data;
};

export const getQuiz = async (id) => {
  const response = await apiClient.get(`/quizzes/${id}`);
  return response.data.data;
};

export const startQuiz = async (quizId) => {
  const response = await apiClient.post(`/quizzes/${quizId}/start`);
  return response.data.data;
};

export const answerQuiz = async (attemptId, questionId, answer) => {
  const response = await apiClient.post(`/quizzes/attempts/${attemptId}/answer`, {
    question_id: questionId,
    answer
  });
  return response.data.data;
};

export const submitQuiz = async (attemptId) => {
  const response = await apiClient.post(`/quizzes/attempts/${attemptId}/submit`);
  return response.data.data;
};

export const getQuizAttempts = async (params = {}) => {
  const response = await apiClient.get('/quizzes/attempts', { params });
  return response.data.data;
};

export const getLeaderboard = async (quizId = null, page = 1, limit = 10) => {
  const params = { page, limit };
  if (quizId) {
    params.quiz_id = quizId;
  }
  
  const response = await apiClient.get('/quizzes/leaderboard', { params });
  return response.data.data;
};