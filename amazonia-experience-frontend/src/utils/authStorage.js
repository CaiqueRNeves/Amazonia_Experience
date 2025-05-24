/**
 * Utilitários para armazenamento de tokens de autenticação
 * Gerencia o armazenamento, recuperação e remoção de tokens JWT
 */

// Constantes para as chaves do localStorage
const AUTH_TOKEN_KEY = 'amazonia_auth_token';
const REFRESH_TOKEN_KEY = 'amazonia_refresh_token';
const USER_DATA_KEY = 'amazonia_user_data';

/**
 * Salva os tokens de autenticação e dados do usuário no localStorage
 * @param {Object} authData - Objeto contendo token, refreshToken e dados do usuário
 */
export const setAuthTokens = (authData) => {
  try {
    if (authData.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, authData.token);
    }
    
    if (authData.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, authData.refreshToken);
    }
    
    if (authData.user) {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(authData.user));
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao salvar tokens de autenticação:', error);
    return false;
  }
};

/**
 * Recupera os tokens de autenticação e dados do usuário do localStorage
 * @returns {Object} Objeto contendo token, refreshToken e dados do usuário
 */
export const getAuthTokens = () => {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const userDataString = localStorage.getItem(USER_DATA_KEY);
    const user = userDataString ? JSON.parse(userDataString) : null;
    
    return { token, refreshToken, user };
  } catch (error) {
    console.error('Erro ao recuperar tokens de autenticação:', error);
    return { token: null, refreshToken: null, user: null };
  }
};

/**
 * Verifica se o usuário está autenticado com base na presença de tokens
 * @returns {boolean} True se o usuário estiver autenticado
 */
export const isAuthenticated = () => {
  const { token } = getAuthTokens();
  return !!token;
};

/**
 * Remove todos os tokens e dados de autenticação do localStorage
 */
export const clearAuthTokens = () => {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    return true;
  } catch (error) {
    console.error('Erro ao remover tokens de autenticação:', error);
    return false;
  }
};

/**
 * Atualiza apenas o token de acesso, mantendo o refresh token e os dados do usuário
 * @param {string} newToken - Novo token de acesso
 */
export const updateAccessToken = (newToken) => {
  try {
    if (newToken) {
      localStorage.setItem(AUTH_TOKEN_KEY, newToken);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erro ao atualizar token de acesso:', error);
    return false;
  }
};

/**
 * Atualiza os dados do usuário no localStorage
 * @param {Object} userData - Novos dados do usuário
 */
export const updateUserData = (userData) => {
  try {
    if (userData) {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erro ao atualizar dados do usuário:', error);
    return false;
  }
};

export default {
  setAuthTokens,
  getAuthTokens,
  isAuthenticated,
  clearAuthTokens,
  updateAccessToken,
  updateUserData
};