import apiClient from './apiClient';

/**
 * Funções para interagir com a API de locais
 */
export const getPlaces = async (params = {}) => {
  const response = await apiClient.get('/places', { params });
  return response.data.data;
};

export const getPlace = async (id) => {
  const response = await apiClient.get(`/places/${id}`);
  return response.data.data;
};

export const getNearbyPlaces = async (latitude, longitude, radius = 5, page = 1, limit = 10) => {
  const params = {
    latitude,
    longitude,
    radius,
    page,
    limit
  };
  
  const response = await apiClient.get('/places/nearby', { params });
  return response.data.data;
};

export const checkInPlace = async (placeId) => {
  const response = await apiClient.post('/places/checkin', { place_id: placeId });
  return response.data.data;
};

export const getPlaceVisitors = async (placeId, page = 1, limit = 10) => {
  const params = { page, limit };
  const response = await apiClient.get(`/places/${placeId}/visitors`, { params });
  return response.data.data;
};