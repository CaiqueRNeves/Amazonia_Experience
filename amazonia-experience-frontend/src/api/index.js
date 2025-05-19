/**
 * Índice de funções de API
 * Exporta todas as funções de API de um único lugar
 */

// Importa todos os módulos API
import apiClient from './apiClient';
import * as authApi from './auth';
import * as usersApi from './users';
import * as eventsApi from './events';
import * as placesApi from './places';
import * as quizzesApi from './quizzes';
import * as rewardsApi from './rewards';
import * as emergencyApi from './emergency';
import * as connectivityApi from './connectivity';
import * as chatApi from './chat';

// Exporta por categoria
export const api = {
  auth: authApi,
  users: usersApi,
  events: eventsApi,
  places: placesApi,
  quizzes: quizzesApi,
  rewards: rewardsApi,
  emergency: emergencyApi,
  connectivity: connectivityApi,
  chat: chatApi
};

// Exporta cliente API para uso direto se necessário
export { apiClient };

// Exportações individuais para facilitar importações
export { 
  authApi, 
  usersApi, 
  eventsApi, 
  placesApi, 
  quizzesApi, 
  rewardsApi, 
  emergencyApi, 
  connectivityApi, 
  chatApi 
};

// Exportação padrão
export default api;