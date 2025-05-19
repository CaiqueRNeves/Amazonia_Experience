/**
 * Serviço para análise e rastreamento de eventos da aplicação
 * Centraliza o envio de eventos para ferramentas de análise
 */

import errorService from './errorService';

// Eventos padrão para rastreamento
const ANALYTICS_EVENTS = {
  // Eventos de navegação
  PAGE_VIEW: 'page_view',
  SCREEN_VIEW: 'screen_view',
  
  // Eventos de autenticação
  LOGIN: 'login',
  LOGOUT: 'logout',
  REGISTER: 'register',
  
  // Eventos de interação com recursos
  CHECK_IN: 'check_in',
  REWARD_REDEEM: 'reward_redeem',
  QUIZ_START: 'quiz_start',
  QUIZ_COMPLETE: 'quiz_complete',
  
  // Eventos de engajamento
  SEARCH: 'search',
  CONTENT_VIEW: 'content_view',
  BUTTON_CLICK: 'button_click',
  
  // Eventos de localização
  LOCATION_SHARE: 'location_share',
  NEARBY_SEARCH: 'nearby_search',
  
  // Eventos de aplicativo
  APP_INSTALL: 'app_install',
  APP_UPDATE: 'app_update',
  APP_OPEN: 'app_open',
  APP_CLOSE: 'app_close',
  
  // Eventos de erro
  ERROR: 'error'
};

// Categorias para agrupamento de eventos
const ANALYTICS_CATEGORIES = {
  NAVIGATION: 'navigation',
  AUTH: 'authentication',
  ENGAGEMENT: 'engagement',
  GAMIFICATION: 'gamification',
  LOCATION: 'location',
  APP: 'application',
  ERROR: 'error'
};

const analyticsService = {
  /**
   * Inicializa o serviço de analytics
   * Configura os provedores de analytics (Google Analytics, Firebase, etc.)
   */
  init() {
    try {
      // Inicializar serviços de analytics conforme disponibilidade
      this.initGoogleAnalytics();
      this.initFirebaseAnalytics();
      this.initCustomAnalytics();
      
      // Registrar evento de inicialização
      this.trackEvent(ANALYTICS_EVENTS.APP_OPEN);
      
      return true;
    } catch (error) {
      errorService.logError({
        message: 'Falha ao inicializar serviço de analytics',
        error,
        category: errorService.categories.APP
      });
      return false;
    }
  },

  /**
   * Inicializa o Google Analytics
   * @private
   */
  initGoogleAnalytics() {
    // Verificar se GA está disponível e configurado
    if (window.gtag && process.env.REACT_APP_GA_MEASUREMENT_ID) {
      console.log('Google Analytics inicializado');
    }
  },

  /**
   * Inicializa o Firebase Analytics
   * @private
   */
  initFirebaseAnalytics() {
    // Verificar se Firebase está disponível
    if (window.firebase && window.firebase.analytics) {
      console.log('Firebase Analytics inicializado');
    }
  },

  /**
   * Inicializa sistema de analytics customizado
   * @private
   */
  initCustomAnalytics() {
    // Implementação para sistema de analytics personalizado
    if (process.env.REACT_APP_CUSTOM_ANALYTICS_URL) {
      console.log('Analytics customizado inicializado');
    }
  },

  /**
   * Registra um evento de visualização de página
   * @param {string} pageName - Nome da página visualizada
   * @param {Object} params - Parâmetros adicionais
   */
  trackPageView(pageName, params = {}) {
    this.trackEvent(ANALYTICS_EVENTS.PAGE_VIEW, {
      page_name: pageName,
      ...params
    }, ANALYTICS_CATEGORIES.NAVIGATION);
  },

  /**
   * Registra um evento genérico
   * @param {string} eventName - Nome do evento
   * @param {Object} params - Parâmetros do evento
   * @param {string} category - Categoria do evento
   */
  trackEvent(eventName, params = {}, category = ANALYTICS_CATEGORIES.ENGAGEMENT) {
    // Dados básicos do evento
    const eventData = {
      event: eventName,
      category,
      timestamp: new Date().toISOString(),
      ...params
    };

    // Adicionar informações do usuário, se disponíveis
    try {
      const userInfo = this.getUserInfo();
      if (userInfo) {
        eventData.user = userInfo;
      }
    } catch (e) {
      // Silencioso se falhar ao obter dados do usuário
    }

    // Enviar para Google Analytics
    this.sendToGoogleAnalytics(eventName, eventData);
    
    // Enviar para Firebase Analytics
    this.sendToFirebaseAnalytics(eventName, eventData);
    
    // Enviar para sistema customizado
    this.sendToCustomAnalytics(eventName, eventData);
    
    // Log em desenvolvimento
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Analytics]', eventName, eventData);
    }
  },

  /**
   * Envia evento para o Google Analytics
   * @param {string} eventName - Nome do evento
   * @param {Object} eventData - Dados do evento
   * @private
   */
  sendToGoogleAnalytics(eventName, eventData) {
    if (window.gtag && process.env.REACT_APP_GA_MEASUREMENT_ID) {
      try {
        window.gtag('event', eventName, eventData);
      } catch (error) {
        // Log silencioso para não interromper a experiência do usuário
        if (process.env.NODE_ENV !== 'production') {
          console.error('Erro ao enviar evento para Google Analytics:', error);
        }
      }
    }
  },

  /**
   * Envia evento para o Firebase Analytics
   * @param {string} eventName - Nome do evento
   * @param {Object} eventData - Dados do evento
   * @private
   */
  sendToFirebaseAnalytics(eventName, eventData) {
    if (window.firebase && window.firebase.analytics) {
      try {
        window.firebase.analytics().logEvent(eventName, eventData);
      } catch (error) {
        // Log silencioso para não interromper a experiência do usuário
        if (process.env.NODE_ENV !== 'production') {
          console.error('Erro ao enviar evento para Firebase Analytics:', error);
        }
      }
    }
  },

  /**
   * Envia evento para sistema customizado de analytics
   * @param {string} eventName - Nome do evento
   * @param {Object} eventData - Dados do evento
   * @private
   */
  sendToCustomAnalytics(eventName, eventData) {
    if (!process.env.REACT_APP_CUSTOM_ANALYTICS_URL) return;
    
    try {
      fetch(process.env.REACT_APP_CUSTOM_ANALYTICS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event: eventName,
          data: eventData,
          app: 'amazonia-experience',
          version: process.env.REACT_APP_VERSION || '0.1.0'
        }),
        // Não esperar pela resposta para não bloquear a UI
        keepalive: true
      }).catch(() => {
        // Silencioso em caso de falha
      });
    } catch (e) {
      // Ignora erros no envio para não interromper a experiência
    }
  },

  /**
   * Obtém informações básicas do usuário para rastreamento
   * @returns {Object|null} Informações do usuário ou null se não estiver autenticado
   * @private
   */
  getUserInfo() {
    try {
      // Tenta obter dados de autenticação do localStorage
      const authStorageKey = process.env.REACT_APP_AUTH_STORAGE_KEY || 'amazonia_auth';
      const authData = localStorage.getItem(authStorageKey);
      
      if (!authData) return null;
      
      const token = JSON.parse(authData).token;
      if (!token) return null;
      
      // Decodifica o token JWT para obter ID e função do usuário
      // Sem verificar assinatura, apenas para analytics
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      return {
        user_id: payload.id,
        role: payload.role
      };
    } catch (error) {
      return null;
    }
  },

  /**
   * Registra erros para análise
   * @param {string} errorMessage - Mensagem de erro
   * @param {Object} errorDetails - Detalhes do erro
   */
  trackError(errorMessage, errorDetails = {}) {
    this.trackEvent(ANALYTICS_EVENTS.ERROR, {
      error_message: errorMessage,
      error_details: errorDetails
    }, ANALYTICS_CATEGORIES.ERROR);
  },

  /**
   * Registra busca realizada pelo usuário
   * @param {string} searchTerm - Termo de busca
   * @param {string} searchType - Tipo de busca (eventos, locais, etc)
   * @param {number} resultCount - Quantidade de resultados
   */
  trackSearch(searchTerm, searchType, resultCount) {
    this.trackEvent(ANALYTICS_EVENTS.SEARCH, {
      search_term: searchTerm,
      search_type: searchType,
      result_count: resultCount
    }, ANALYTICS_CATEGORIES.ENGAGEMENT);
  },

  /**
   * Registra check-in em evento ou local
   * @param {string} type - Tipo de check-in ('event' ou 'place')
   * @param {number} id - ID da entidade
   * @param {string} name - Nome da entidade
   */
  trackCheckIn(type, id, name) {
    this.trackEvent(ANALYTICS_EVENTS.CHECK_IN, {
      check_in_type: type,
      entity_id: id,
      entity_name: name
    }, ANALYTICS_CATEGORIES.GAMIFICATION);
  },

  /**
   * Registra resgate de recompensa
   * @param {number} rewardId - ID da recompensa
   * @param {string} rewardName - Nome da recompensa
   * @param {number} amacoinsCost - Custo em AmaCoins
   */
  trackRewardRedemption(rewardId, rewardName, amacoinsCost) {
    this.trackEvent(ANALYTICS_EVENTS.REWARD_REDEEM, {
      reward_id: rewardId,
      reward_name: rewardName,
      amacoins_cost: amacoinsCost
    }, ANALYTICS_CATEGORIES.GAMIFICATION);
  },

  /**
   * Registra participação em quiz
   * @param {number} quizId - ID do quiz
   * @param {string} quizTitle - Título do quiz
   * @param {number} score - Pontuação obtida
   * @param {number} amacoinsEarned - AmaCoins ganhos
   */
  trackQuizCompletion(quizId, quizTitle, score, amacoinsEarned) {
    this.trackEvent(ANALYTICS_EVENTS.QUIZ_COMPLETE, {
      quiz_id: quizId,
      quiz_title: quizTitle,
      score,
      amacoins_earned: amacoinsEarned
    }, ANALYTICS_CATEGORIES.GAMIFICATION);
  },

  /**
   * Constantes de eventos e categorias expostas publicamente
   */
  events: ANALYTICS_EVENTS,
  categories: ANALYTICS_CATEGORIES
};

export default analyticsService;