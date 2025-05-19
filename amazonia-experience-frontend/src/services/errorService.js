/**
 * Serviço para gerenciamento e log de erros da aplicação
 * Centraliza o tratamento de erros, logging e relatórios
 */

// Lista de códigos HTTP de erro comuns e suas descrições
const HTTP_ERROR_CODES = {
  400: 'Requisição inválida',
  401: 'Não autorizado',
  403: 'Acesso negado',
  404: 'Recurso não encontrado',
  409: 'Conflito',
  422: 'Entidade não processável',
  429: 'Muitas requisições',
  500: 'Erro interno do servidor',
  502: 'Gateway inválido',
  503: 'Serviço indisponível',
  504: 'Tempo limite do gateway'
};

// Categorias de erro para classificação
const ERROR_CATEGORIES = {
  API: 'api_error',
  AUTH: 'auth_error',
  NETWORK: 'network_error',
  VALIDATION: 'validation_error',
  PERMISSION: 'permission_error',
  GEOLOCATION: 'geolocation_error',
  STORAGE: 'storage_error',
  APP: 'app_error'
};

const errorService = {
  /**
   * Registra um erro no console e em serviços externos, se configurados
   * @param {Object} errorInfo - Informações sobre o erro
   * @param {string} errorInfo.message - Mensagem de erro
   * @param {Error|Object} errorInfo.error - Objeto de erro ou detalhes adicionais
   * @param {string} errorInfo.category - Categoria do erro (opcional)
   * @param {number} errorInfo.status - Código HTTP (opcional)
   * @param {string} errorInfo.endpoint - Endpoint da API (opcional)
   * @param {Object} errorInfo.context - Informações contextuais adicionais (opcional)
   */
  logError(errorInfo) {
    const { message, error, category, status, endpoint, context } = errorInfo;
    
    // Estrutura de dados do erro para log
    const logData = {
      timestamp: new Date().toISOString(),
      message: message || 'Erro desconhecido',
      category: category || ERROR_CATEGORIES.APP,
      status,
      endpoint,
      context: context || {},
      environment: process.env.NODE_ENV,
      userAgent: navigator.userAgent,
      appVersion: process.env.REACT_APP_VERSION || '0.1.0'
    };

    // Adicionar detalhes do erro se disponíveis
    if (error) {
      if (error instanceof Error) {
        logData.errorName = error.name;
        logData.errorMessage = error.message;
        logData.stack = error.stack;
      } else {
        logData.errorDetails = error;
      }
    }

    // Log no console em ambiente de desenvolvimento
    if (process.env.NODE_ENV !== 'production') {
      console.error('[AmazôniaExperience Error]', logData);
    }

    // Em produção, enviar para serviço de monitoramento de erros
    // como Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_ERROR_TRACKING_ENABLED === 'true') {
      this.sendToErrorService(logData);
    }

    return logData;
  },

  /**
   * Envia erro para serviço externo de monitoramento
   * @param {Object} errorData - Dados formatados do erro
   * @private
   */
  sendToErrorService(errorData) {
    // Implementação para enviar dados para serviço como Sentry
    // Esta é uma implementação básica e deve ser adaptada conforme o serviço utilizado
    if (window.Sentry) {
      window.Sentry.captureException(errorData);
    }
    
    // Alternativa: enviar para endpoint de API personalizado
    try {
      fetch(process.env.REACT_APP_ERROR_REPORTING_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorData),
        // Não esperar pela resposta para não bloquear a UI
        keepalive: true
      }).catch(() => {
        // Silencioso em caso de falha para não causar loop de erros
      });
    } catch (e) {
      // Ignora erros no relatório de erros para evitar loops infinitos
    }
  },

  /**
   * Formata um erro HTTP com base no código de status
   * @param {Object} error - Objeto de erro da requisição
   * @returns {Object} Erro formatado com mensagem amigável
   */
  formatHttpError(error) {
    const status = error.response?.status;
    const defaultMessage = 'Ocorreu um erro na comunicação com o servidor';
    
    let message = defaultMessage;
    let category = ERROR_CATEGORIES.API;
    
    // Determinar a mensagem com base no código de status
    if (status && HTTP_ERROR_CODES[status]) {
      message = HTTP_ERROR_CODES[status];
      
      // Categorizar por tipo de erro
      if (status === 401 || status === 403) {
        category = ERROR_CATEGORIES.AUTH;
      } else if (status === 422 || status === 400) {
        category = ERROR_CATEGORIES.VALIDATION;
      }
    } else if (!error.response && error.isAxiosError) {
      // Erro de rede (sem resposta)
      message = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
      category = ERROR_CATEGORIES.NETWORK;
    }
    
    // Usar mensagem específica do backend, se disponível
    const serverMessage = error.response?.data?.message;
    if (serverMessage) {
      message = serverMessage;
    }
    
    return {
      message,
      status,
      category,
      original: error
    };
  },

  /**
   * Traduz códigos de erro da geolocalização
   * @param {number} code - Código de erro da API Geolocation
   * @returns {string} Mensagem de erro traduzida
   */
  getGeolocationErrorMessage(code) {
    switch (code) {
      case 1: // PERMISSION_DENIED
        return 'Acesso à localização negado. Verifique as permissões do seu navegador.';
      case 2: // POSITION_UNAVAILABLE
        return 'Localização indisponível. Verifique se o GPS está ativado.';
      case 3: // TIMEOUT
        return 'Tempo esgotado ao tentar obter sua localização.';
      default:
        return 'Erro desconhecido ao obter localização.';
    }
  },

  /**
   * Verifica se um erro é de autenticação (401)
   * @param {Object} error - Objeto de erro
   * @returns {boolean} Verdadeiro se for erro de autenticação
   */
  isAuthError(error) {
    return error.response?.status === 401;
  },

  /**
   * Obtém a mensagem de erro de forma segura do objeto de erro
   * @param {Error|Object} error - Objeto de erro
   * @param {string} defaultMessage - Mensagem padrão caso não seja possível extrair
   * @returns {string} Mensagem de erro
   */
  getErrorMessage(error, defaultMessage = 'Ocorreu um erro inesperado') {
    if (!error) return defaultMessage;
    
    if (typeof error === 'string') return error;
    
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.message) {
      return error.message;
    }
    
    if (typeof error === 'object') {
      try {
        return JSON.stringify(error);
      } catch (e) {
        // Se não puder converter para string, usa mensagem padrão
      }
    }
    
    return defaultMessage;
  },

  /**
   * Categorias de erro disponíveis
   */
  categories: ERROR_CATEGORIES
};

export default errorService;