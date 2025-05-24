import apiClient from './apiClient';

/**
 * Funções para interagir com a API de serviços de emergência
 */
export const getEmergencyServices = async (params = {}) => {
  const response = await apiClient.get('/emergency/services', { params });
  return response.data.data;
};

export const getServicesByType = async (type, params = {}) => {
  const response = await apiClient.get(`/emergency/services/${type}`, { params });
  return response.data.data;
};

export const getNearbyServices = async (latitude, longitude, radius = 5, type = null, page = 1, limit = 10) => {
  const params = {
    latitude,
    longitude,
    radius,
    page,
    limit
  };
  
  if (type) {
    params.type = type;
  }
  
  const response = await apiClient.get('/emergency/services/nearby', { params });
  return response.data.data;
};

export const getContactsByLanguage = async (language) => {
  const response = await apiClient.get(`/emergency/contacts/${language}`);
  return response.data.data;
};

export const getPhrasesByLanguage = async (language) => {
  const response = await apiClient.get(`/emergency/phrases/${language}`);
  return response.data.data;
};