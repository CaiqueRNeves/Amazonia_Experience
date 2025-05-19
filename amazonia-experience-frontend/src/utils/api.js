/**
 * Configuração e funções relacionadas às APIs do sistema
 * Centraliza funções auxiliares para comunicação com o backend
 */

import axios from 'axios';
import { getAuthTokens } from './authStorage';

/**
 * Configurações para os endpoints da API
 */
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000, // 30 segundos
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      REFRESH: '/auth/refresh',
      ME: '/auth/me',
      CHANGE_PASSWORD: '/auth/change-password'
    },
    USERS: {
      PROFILE: '/users/profile',
      AMACOINS: '/users/amacoins',
      VISITS: '/users/visits',
      NOTIFICATIONS: '/users/notification-preferences'
    },
    EVENTS: {
      LIST: '/events',
      DETAIL: '/events/:id',
      NEARBY: '/events/nearby',
      CHECKIN: '/events/checkin'
    },
    PLACES: {
      LIST: '/places',
      DETAIL: '/places/:id',
      NEARBY: '/places/nearby',
      CHECKIN: '/places/checkin'
    },
    QUIZZES: {
      LIST: '/quizzes',
      DETAIL: '/quizzes/:id',
      START: '/quizzes/:id/start',
      ANSWER: '/quizzes/attempts/:attempt_id/answer',
      SUBMIT: '/quizzes/attempts/:attempt_id/submit',
      LEADERBOARD: '/quizzes/leaderboard',
      ATTEMPTS: '/quizzes/attempts'
    },
    REWARDS: {
      LIST: '/rewards',
      PHYSICAL: '/rewards/physical',
      DIGITAL: '/rewards/digital',
      DETAIL: '/rewards/:id',
      REDEEM: '/rewards/:id/redeem',
      REDEMPTIONS: '/rewards/redemptions'
    },
    EMERGENCY: {
      SERVICES: '/emergency/services',
      SERVICES_BY_TYPE: '/emergency/services/:type',
      NEARBY: '/emergency/services/nearby',
      CONTACTS: '/emergency/contacts/:language',
      PHRASES: '/emergency/phrases/:language'
    },
    CONNECTIVITY: {
      SPOTS: '/connectivity/spots',
      NEARBY: '/connectivity/spots/nearby',
      REPORT: '/connectivity/spots/:id/report',
      HEATMAP: '/connectivity/heatmap'
    },
    CHAT: {
      MESSAGE: '/chat/message',
      HISTORY: '/chat/history',
      CONTEXT: '/chat/context/:entity_type/:entity_id',
      FEEDBACK: '/chat/feedback'
    }
  }
};

/**
 * Substitui parâmetros em um URL
 * Exemplo: replaceParams('/users/:id', { id: 1 }) => '/users/1'
 * @param {string} url - URL com parâmetros a serem substituídos
 * @param {Object} params - Objeto com os valores dos parâmetros
 * @returns {string} URL com parâmetros substituídos
 */
export const replaceParams = (url, params = {}) => {
  let processedUrl = url;
  
  for (const [key, value] of Object.entries(params)) {
    processedUrl = processedUrl.replace(`:${key}`, value);
  }
  
  return processedUrl;
};

/**
 * Cria uma instância configurada do Axios
 * @returns {AxiosInstance} Instância do Axios configurada para a API
 */
export const createApiClient = () => {
  const client = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
  
  // Interceptor para adicionar token de autenticação
  client.interceptors.request.use((config) => {
    const { token } = getAuthTokens();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  }, (error) => {
    return Promise.reject(error);
  });
  
  // Interceptor para tratamento de erros
  client.interceptors.response.use((response) => {
    return response;
  }, (error) => {
    // Tratamento personalizado de erros
    if (error.response) {
      // O servidor respondeu com um status de erro
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Autenticação falhou - poderia redirecionar para login ou tentar refresh token
          // Por enquanto, apenas passamos o erro adiante
          break;
          
        case 403:
          // Acesso proibido
          console.error('Acesso proibido a recurso:', data);
          break;
          
        case 404:
          // Recurso não encontrado
          console.error('Recurso não encontrado:', data);
          break;
          
        case 422:
          // Erro de validação
          console.error('Erro de validação:', data);
          break;
          
        case 500:
          // Erro interno do servidor
          console.error('Erro no servidor:', data);
          break;
          
        default:
          // Outros erros
          console.error(`Erro ${status}:`, data);
          break;
      }
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta
      console.error('Sem resposta do servidor:', error.request);
    } else {
      // Algo aconteceu na configuração da requisição
      console.error('Erro na configuração da requisição:', error.message);
    }
    
    return Promise.reject(error);
  });
  
  return client;
};

// Instância padrão do cliente API
export const apiClient = createApiClient();

/**
 * Funções auxiliares para trabalhar com a API
 */

/**
 * Faz um GET para a API
 * @param {string} endpoint - Endpoint da API
 * @param {Object} params - Parâmetros da URL
 * @param {Object} config - Configurações adicionais para a requisição
 * @returns {Promise} Promessa com a resposta
 */
export const get = async (endpoint, params = {}, config = {}) => {
  try {
    const response = await apiClient.get(endpoint, {
      params,
      ...config
    });
    return response.data;
  } catch (error) {
    console.error(`Erro ao fazer GET para ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Faz um POST para a API
 * @param {string} endpoint - Endpoint da API
 * @param {Object} data - Dados a serem enviados
 * @param {Object} config - Configurações adicionais para a requisição
 * @returns {Promise} Promessa com a resposta
 */
export const post = async (endpoint, data = {}, config = {}) => {
  try {
    const response = await apiClient.post(endpoint, data, config);
    return response.data;
  } catch (error) {
    console.error(`Erro ao fazer POST para ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Faz um PUT para a API
 * @param {string} endpoint - Endpoint da API
 * @param {Object} data - Dados a serem enviados
 * @param {Object} config - Configurações adicionais para a requisição
 * @returns {Promise} Promessa com a resposta
 */
export const put = async (endpoint, data = {}, config = {}) => {
  try {
    const response = await apiClient.put(endpoint, data, config);
    return response.data;
  } catch (error) {
    console.error(`Erro ao fazer PUT para ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Faz um DELETE para a API
 * @param {string} endpoint - Endpoint da API
 * @param {Object} config - Configurações adicionais para a requisição
 * @returns {Promise} Promessa com a resposta
 */
export const del = async (endpoint, config = {}) => {
  try {
    const response = await apiClient.delete(endpoint, config);
    return response.data;
  } catch (error) {
    console.error(`Erro ao fazer DELETE para ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Faz upload de arquivo para a API
 * @param {string} endpoint - Endpoint da API
 * @param {FormData} formData - Dados do formulário com o arquivo
 * @param {Object} config - Configurações adicionais para a requisição
 * @returns {Promise} Promessa com a resposta
 */
export const uploadFile = async (endpoint, formData, config = {}) => {
  try {
    const response = await apiClient.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      ...config
    });
    return response.data;
  } catch (error) {
    console.error(`Erro ao fazer upload para ${endpoint}:`, error);
    throw error;
  }
};

export default {
  API_CONFIG,
  replaceParams,
  apiClient,
  get,
  post,
  put,
  del,
  uploadFile
};