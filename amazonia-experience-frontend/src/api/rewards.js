import apiClient from './apiClient';

/**
 * Funções para interagir com a API de recompensas
 */
export const getRewards = async (params = {}) => {
  const response = await apiClient.get('/rewards', { params });
  return response.data.data;
};

export const getPhysicalRewards = async (params = {}) => {
  const response = await apiClient.get('/rewards/physical', { params });
  return response.data.data;
};

export const getDigitalRewards = async (params = {}) => {
  const response = await apiClient.get('/rewards/digital', { params });
  return response.data.data;
};

export const getReward = async (id) => {
  const response = await apiClient.get(`/rewards/${id}`);
  return response.data.data;
};

export const redeemReward = async (rewardId) => {
  const response = await apiClient.post(`/rewards/${rewardId}/redeem`);
  return response.data.data;
};

export const getRedemptions = async (params = {}) => {
  const response = await apiClient.get('/rewards/redemptions', { params });
  return response.data.data;
};