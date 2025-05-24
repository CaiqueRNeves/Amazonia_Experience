/**
 * Utilitários para rastreamento e análise de eventos na aplicação
 * Permite o registro de eventos de uso, conversões, etc.
 */

/**
 * Tipos de eventos que podem ser rastreados
 */
export const EVENT_TYPES = {
  PAGE_VIEW: 'page_view',
  FEATURE_USAGE: 'feature_usage',
  ERROR: 'error',
  CHECKIN: 'checkin',
  QUIZ_STARTED: 'quiz_started',
  QUIZ_COMPLETED: 'quiz_completed',
  REWARD_REDEEMED: 'reward_redeemed',
  USER_REGISTRATION: 'user_registration',
  USER_LOGIN: 'user_login',
  SEARCH: 'search'
};

// Chave para armazenar eventos offline
const OFFLINE_EVENTS_KEY = 'amazonia_offline_analytics_events';

/**
 * Configuração do analytics
 */
let config = {
  enabled: true,
  userId: null,
  anonymousId: null,
  endpoint: process.env.REACT_APP_ANALYTICS_ENDPOINT || null,
  debug: process.env.NODE_ENV !== 'production',
  offlineStorage: true
};

/**
 * Inicializa o sistema de analytics
 * @param {Object} options - Opções de configuração
 */
export const initAnalytics = (options = {}) => {
  config = {
    ...config,
    ...options
  };
  
  // Gera um ID anônimo se não existir
  if (!config.anonymousId) {
    config.anonymousId = generateAnonymousId();
  }
  
  // Sincroniza eventos offline, se habilitado
  if (config.offlineStorage) {
    syncOfflineEvents();
  }
  
  if (config.debug) {
    console.log('Analytics inicializado com configuração:', config);
  }
};

/**
 * Define o ID do usuário atual
 * @param {string} userId - ID do usuário
 */
export const setUserId = (userId) => {
  config.userId = userId;
  
  if (config.debug) {
    console.log('Analytics: ID do usuário definido para', userId);
  }
};

/**
 * Limpa o ID do usuário (quando faz logout)
 */
export const clearUserId = () => {
  config.userId = null;
  
  if (config.debug) {
    console.log('Analytics: ID do usuário limpo');
  }
};

/**
 * Rastreia um evento na aplicação
 * @param {string} eventType - Tipo do evento
 * @param {Object} eventData - Dados do evento
 * @returns {Promise} Promessa com resultado do envio
 */
export const trackEvent = async (eventType, eventData = {}) => {
  if (!config.enabled) return null;
  
  const event = {
    event_type: eventType,
    event_data: eventData,
    timestamp: new Date().toISOString(),
    user_id: config.userId,
    anonymous_id: config.anonymousId,
    session_id: getSessionId()
  };
  
  if (config.debug) {
    console.log('Analytics: Rastreando evento', event);
  }
  
  try {
    // Se não tiver conexão ou endpoint, armazena offline
    if (!navigator.onLine || !config.endpoint) {
      if (config.offlineStorage) {
        storeEventOffline(event);
      }
      return null;
    }
    
    // Envia o evento para o endpoint
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao enviar evento: ${response.status} ${response.statusText}`);
    }
    
    return {
      success: true,
      event
    };
  } catch (error) {
    // Em caso de erro, armazena offline se habilitado
    if (config.offlineStorage) {
      storeEventOffline(event);
    }if (config.debug) {
      console.error('Analytics: Erro ao enviar evento', error);
    }
    
    return {
      success: false,
      error: error.message,
      event
    };
  }
};

/**
 * Rastreia uma visualização de página
 * @param {string} pageName - Nome da página
 * @param {Object} pageData - Dados adicionais da página
 */
export const trackPageView = (pageName, pageData = {}) => {
  return trackEvent(EVENT_TYPES.PAGE_VIEW, {
    page_name: pageName,
    page_url: window.location.href,
    page_title: document.title,
    ...pageData
  });
};

/**
 * Rastreia um erro na aplicação
 * @param {Error|string} error - Erro ou mensagem de erro
 * @param {Object} context - Contexto adicional do erro
 */
export const trackError = (error, context = {}) => {
  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : null;
  
  return trackEvent(EVENT_TYPES.ERROR, {
    error_message: errorMessage,
    error_stack: errorStack,
    ...context
  });
};

/**
 * Rastreia um check-in em local ou evento
 * @param {string} type - Tipo de check-in ('event' ou 'place')
 * @param {Object} data - Dados do check-in
 */
export const trackCheckIn = (type, data) => {
  return trackEvent(EVENT_TYPES.CHECKIN, {
    checkin_type: type,
    ...data
  });
};

/**
 * Rastreia o início de um quiz
 * @param {Object} quizData - Dados do quiz
 */
export const trackQuizStarted = (quizData) => {
  return trackEvent(EVENT_TYPES.QUIZ_STARTED, quizData);
};

/**
 * Rastreia a conclusão de um quiz
 * @param {Object} quizData - Dados do quiz
 * @param {Object} resultData - Dados do resultado
 */
export const trackQuizCompleted = (quizData, resultData) => {
  return trackEvent(EVENT_TYPES.QUIZ_COMPLETED, {
    ...quizData,
    result: resultData
  });
};

/**
 * Rastreia o resgate de uma recompensa
 * @param {Object} rewardData - Dados da recompensa
 */
export const trackRewardRedeemed = (rewardData) => {
  return trackEvent(EVENT_TYPES.REWARD_REDEEMED, rewardData);
};

/**
 * Rastreia o registro de um novo usuário
 * @param {Object} userData - Dados do usuário (sem informações sensíveis)
 */
export const trackUserRegistration = (userData) => {
  // Remover dados sensíveis
  const { password, email, ...safeUserData } = userData;
  
  return trackEvent(EVENT_TYPES.USER_REGISTRATION, {
    ...safeUserData,
    email_domain: email ? email.split('@')[1] : null
  });
};

/**
 * Rastreia o login de um usuário
 * @param {Object} userData - Dados do usuário (sem informações sensíveis)
 */
export const trackUserLogin = (userData) => {
  // Remover dados sensíveis
  const { password, email, ...safeUserData } = userData;
  
  return trackEvent(EVENT_TYPES.USER_LOGIN, safeUserData);
};

/**
 * Rastreia uma busca na aplicação
 * @param {string} query - Termo de busca
 * @param {string} category - Categoria da busca
 * @param {Object} additionalData - Dados adicionais
 */
export const trackSearch = (query, category, additionalData = {}) => {
  return trackEvent(EVENT_TYPES.SEARCH, {
    search_query: query,
    search_category: category,
    ...additionalData
  });
};

/**
 * Armazena um evento offline para envio posterior
 * @param {Object} event - Evento a ser armazenado
 */
const storeEventOffline = (event) => {
  try {
    const storedEvents = localStorage.getItem(OFFLINE_EVENTS_KEY);
    const events = storedEvents ? JSON.parse(storedEvents) : [];
    
    events.push(event);
    
    localStorage.setItem(OFFLINE_EVENTS_KEY, JSON.stringify(events));
    
    if (config.debug) {
      console.log('Analytics: Evento armazenado offline', event);
    }
  } catch (error) {
    if (config.debug) {
      console.error('Analytics: Erro ao armazenar evento offline', error);
    }
  }
};

/**
 * Sincroniza eventos armazenados offline
 */
const syncOfflineEvents = async () => {
  if (!navigator.onLine || !config.endpoint) return;
  
  try {
    const storedEvents = localStorage.getItem(OFFLINE_EVENTS_KEY);
    
    if (!storedEvents) return;
    
    const events = JSON.parse(storedEvents);
    
    if (!events.length) return;
    
    if (config.debug) {
      console.log(`Analytics: Sincronizando ${events.length} eventos offline`);
    }
    
    // Envia os eventos em lote
    const response = await fetch(`${config.endpoint}/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ events })
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao sincronizar eventos: ${response.status} ${response.statusText}`);
    }
    
    // Limpa os eventos sincronizados
    localStorage.removeItem(OFFLINE_EVENTS_KEY);
    
    if (config.debug) {
      console.log('Analytics: Eventos offline sincronizados com sucesso');
    }
  } catch (error) {
    if (config.debug) {
      console.error('Analytics: Erro ao sincronizar eventos offline', error);
    }
  }
};

/**
 * Gera um ID anônimo para rastreamento
 * @returns {string} ID anônimo
 */
const generateAnonymousId = () => {
  try {
    // Verifica se já existe um ID anônimo armazenado
    const storedId = localStorage.getItem('amazonia_anonymous_id');
    
    if (storedId) {
      return storedId;
    }
    
    // Cria um novo ID
    const newId = 'anon_' + Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);
    
    // Armazena o ID para uso futuro
    localStorage.setItem('amazonia_anonymous_id', newId);
    
    return newId;
  } catch (e) {
    return 'anon_' + Math.random().toString(36).substring(2, 15);
  }
};

/**
 * Obtém o ID da sessão atual
 * @returns {string} ID da sessão
 */
const getSessionId = () => {
  try {
    let sessionId = sessionStorage.getItem('amazonia_session_id');
    
    if (!sessionId) {
      sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem('amazonia_session_id', sessionId);
    }
    
    return sessionId;
  } catch (e) {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  }
};

/**
 * Adiciona listener para sincronizar eventos quando a conexão é restaurada
 */
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    if (config.offlineStorage) {
      syncOfflineEvents();
    }
  });
}

export default {
  initAnalytics,
  trackEvent,
  trackPageView,
  trackError,
  trackCheckIn,
  trackQuizStarted,
  trackQuizCompleted,
  trackRewardRedeemed,
  trackUserRegistration,
  trackUserLogin,
  trackSearch,
  setUserId,
  clearUserId,
  EVENT_TYPES
};