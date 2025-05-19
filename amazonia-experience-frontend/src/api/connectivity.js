import apiClient from './apiClient';

/**
 * Funções para interagir com a API de conectividade
 */
export const getConnectivitySpots = async (params = {}) => {
  const response = await apiClient.get('/connectivity/spots', { params });
  return response.data.data;
};

export const getNearbySpots = async (latitude, longitude, radius = 5, page = 1, limit = 10) => {
  const params = {
    latitude,
    longitude,
    radius,
    page,
    limit
  };
  
  const response = await apiClient.get('/connectivity/spots/nearby', { params });
  return response.data.data;
};

export const reportSpot = async (spotId, reportData) => {
  const response = await apiClient.post(`/connectivity/spots/${spotId}/report`, reportData);
  return response.data.data;
};

export const getHeatmap = async () => {
  const response = await apiClient.get('/connectivity/heatmap');
  return response.data.data;
};