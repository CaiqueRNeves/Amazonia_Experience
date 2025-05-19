/**
 * Utilitários para tratamento de erros
 * Contém funções para lidar com diferentes tipos de erros na aplicação
 */
import { toast } from 'react-toastify';
import { analytics } from './index';

/**
 * Tipos de erros que podem ocorrer na aplicação
 */
export const ERROR_TYPES = {
  NETWORK: 'network',
  SERVER: 'server',
  AUTH: 'auth',
  VALIDATION: 'validation',
  NOT_FOUND: 'not_found',
  PERMISSION: 'permission',
  UNKNOWN: 'unknown'
};

/**
 * Mapeia códigos HTTP para tipos de erro
 * @param {number} statusCode - Código de status HTTP
 * @returns {string} Tipo de erro
 */
export const mapHttpStatusToErrorType = (statusCode) => {
  if (!statusCode) return ERROR_TYPES.UNKNOWN;
  
  switch (statusCode) {
    case 400:
      return ERROR_TYPES.VALIDATION;
    case 401:
    case 403:
      return ERROR_TYPES.AUTH;
    case 404:
      return ERROR_TYPES.NOT_FOUND;
    case 500:
    case 502:
    case 503:
    case 504:
      return ERROR_TYPES.SERVER;
    default:
      return ERROR_TYPES.UNKNOWN;
  }
};

/**
 * Formata uma mensagem de erro para exibição ao usuário
 * @param {Error|Object|string} error - Erro ou mensagem de erro
 * @returns {string} Mensagem formatada
 */
export const formatErrorMessage = (error) => {
  if (!error) return 'Ocorreu um erro desconhecido';
  
  // Se for uma string, retorna diretamente
  if (typeof error === 'string') return error;
  
  // Se for um erro do Axios
  if (error.isAxiosError) {
    const statusCode = error.response?.status;
    const responseData = error.response?.data;
    
    // Se tiver uma mensagem específica no corpo da resposta
    if (responseData && responseData.message) {
      return responseData.message;
    }
    
    // Mensagens padrão baseadas no status
    switch (statusCode) {
      case 400:
        return 'Dados inválidos. Por favor, verifique as informações enviadas.';
      case 401:
        return 'Sessão expirada. Por favor, faça login novamente.';
      case 403:
        return 'Você não tem permissão para acessar este recurso.';
      case 404:
        return 'O recurso solicitado não foi encontrado.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'Ocorreu um erro no servidor. Por favor, tente novamente mais tarde.';
      default:
        return `Erro na comunicação com o servidor (${statusCode})`;
    }
  }
  
  // Se for um erro do JavaScript
  if (error instanceof Error) {
    return error.message || 'Ocorreu um erro na aplicação';
  }
  
  // Se for um objeto com mensagem
  if (error.message) {
    return error.message;
  }
  
  // Falha em todos os casos acima
  return 'Ocorreu um erro desconhecido';
};

/**
 * Trata um erro mostrando uma mensagem para o usuário e registrando-o
 * @param {Error|Object|string} error - Erro ou mensagem de erro
 * @param {Object} options - Opções de tratamento
 */
export const handleError = (error, options = {}) => {
  const {
    silent = false,
    context = {},
    toastType = 'error',
    trackInAnalytics = true
  } = options;
  
  // Formata a mensagem do erro
  const errorMessage = formatErrorMessage(error);
  
  // Determina o tipo de erro
  let errorType = ERROR_TYPES.UNKNOWN;
  
  if (error.isAxiosError) {
    errorType = mapHttpStatusToErrorType(error.response?.status);
    
    // Se for um erro de autenticação e o usuário não estiver numa página de auth
    if (errorType === ERROR_TYPES.AUTH && !window.location.pathname.includes('/auth/')) {
      // Poderia redirecionar para a página de login aqui
      // window.location.href = '/login';
    }
  } else if (!navigator.onLine) {
    errorType = ERROR_TYPES.NETWORK;
  }
  
  // Log do erro no console
  console.error('Erro tratado pela aplicação:', {
    type: errorType,
    message: errorMessage,
    originalError: error,
    context
  });
  
  // Mostrar mensagem para o usuário, se não for silencioso
  if (!silent) {
    toast[toastType](errorMessage, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
  }
  
  // Registrar no analytics, se habilitado
  if (trackInAnalytics) {
    analytics.trackError(error, {
      error_type: errorType,
      formatted_message: errorMessage,
      ...context
    });
  }
  
  return {
    errorType,
    errorMessage
  };
};

/**
 * Verifica se o erro é de um tipo específico
 * @param {Error|Object} error - Erro
 * @param {string} errorType - Tipo de erro a verificar
 * @returns {boolean} True se o erro for do tipo especificado
 */
export const isErrorType = (error, errorType) => {
  if (!error) return false;
  
  // Erro de rede (offline)
  if (errorType === ERROR_TYPES.NETWORK) {
    return !navigator.onLine || (error.isAxiosError && !error.response);
  }
  
  // Erro de autenticação
  if (errorType === ERROR_TYPES.AUTH) {
    return error.isAxiosError && [401, 403].includes(error.response?.status);
  }
  
  // Erro de validação
  if (errorType === ERROR_TYPES.VALIDATION) {
    return error.isAxiosError && error.response?.status === 400;
  }
  
  // Erro de recurso não encontrado
  if (errorType === ERROR_TYPES.NOT_FOUND) {
    return error.isAxiosError && error.response?.status === 404;
  }
  
  // Erro do servidor
  if (errorType === ERROR_TYPES.SERVER) {
    return error.isAxiosError && error.response?.status >= 500;
  }
  
  return false;
};

/**
 * Traduz mensagens de erro comuns para um formato mais amigável
 * @param {string} errorMessage - Mensagem de erro original
 * @returns {string} Mensagem traduzida
 */
export const translateErrorMessage = (errorMessage) => {
  if (!errorMessage) return 'Erro desconhecido';
  
  // Mapeia mensagens comuns para mensagens mais amigáveis
  const errorMap = {
    'Network Error': 'Erro de conexão. Verifique sua internet.',
    'Request timeout': 'Tempo de resposta excedido. Tente novamente.',
    'Invalid token': 'Sessão expirada. Por favor, faça login novamente.',
    'User not found': 'Usuário não encontrado.',
    'Incorrect password': 'Senha incorreta.',
    'Email already in use': 'Este email já está sendo utilizado.',
    'Invalid credentials': 'Email ou senha incorretos.',
    'Permission denied': 'Você não tem permissão para esta ação.'
  };
  
  // Retorna a mensagem traduzida ou a original
  return errorMap[errorMessage] || errorMessage;
};

export default {
  ERROR_TYPES,
  mapHttpStatusToErrorType,
  formatErrorMessage,
  handleError,
  isErrorType,
  translateErrorMessage
};