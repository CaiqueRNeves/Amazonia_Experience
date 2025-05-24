/**
 * Índice de serviços
 * Exporta todos os serviços da aplicação para facilitar importações
 */

import apiService from './apiService';
import authService from './authService';
import eventService from './eventService';
import placeService from './placeService';
import quizService from './quizService';
import rewardService from './rewardService';
import chatService from './chatService';
import emergencyService from './emergencyService';
import connectivityService from './connectivityService';
import notificationService from './notificationService';
import storageService from './storageService';
import geoService from './geoService';
import i18nService from './i18nService';
import analyticsService from './analyticsService';
import errorService from './errorService';

// Exportação de serviços individuais
export {
  apiService,
  authService,
  eventService,
  placeService,
  quizService,
  rewardService,
  chatService,
  emergencyService,
  connectivityService,
  notificationService,
  storageService,
  geoService,
  i18nService,
  analyticsService,
  errorService
};

// Exportação padrão
export default {
  apiService,
  authService,
  eventService,
  placeService,
  quizService,
  rewardService,
  chatService,
  emergencyService,
  connectivityService,
  notificationService,
  storageService,
  geoService,
  i18nService,
  analyticsService,
  errorService
};