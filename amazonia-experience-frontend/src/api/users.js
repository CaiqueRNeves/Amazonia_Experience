import apiClient from './apiClient';

/**
 * Funções para interagir com a API de usuários
 */
export const getProfile = async () => {
  const response = await apiClient.get('/users/profile');
  return response.data.data;
};

export const updateProfile = async (userData) => {
  const response = await apiClient.put('/users/profile', userData);
  return response.data.data;
};

export const getAmacoins = async () => {
  const response = await apiClient.get('/users/amacoins');
  return response.data.data;
};

export const getVisits = async (params = {}) => {
  const response = await apiClient.get('/users/visits', { params });
  return response.data.data;
};

export const getAlerts = async (includeRead = false, page = 1, limit = 10) => {
  const params = {
    include_read: includeRead,
    page,
    limit
  };
  
  const response = await apiClient.get('/users/alerts', { params });
  return response.data.data;
};

export const markAlertAsRead = async (alertId) => {
  const response = await apiClient.put(`/users/alerts/${alertId}/read`);
  return response.data;
};

export const updateNotificationPreferences = async (preferences) => {
  const response = await apiClient.put('/users/notification-preferences', preferences);
  return response.data.data;
};