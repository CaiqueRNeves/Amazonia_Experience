import apiService from './apiService';
import { setAuthTokens, clearAuthTokens, getAuthTokens } from '../utils/authStorage';
import errorService from './errorService';

/**
 * Serviço para operações de autenticação
 * Gerencia autenticação, registro e informações do usuário
 */
const authService = {
  /**
   * Realiza login do usuário
   * @param {Object} credentials - Credenciais de login (email, senha)
   * @returns {Promise<Object>} Objeto com dados do usuário e tokens
   */
  async login(credentials) {
    try {
      const response = await apiService.post('/auth/login', credentials);
      const { token, refreshToken, user } = response.data.data;
      
      // Salva os tokens no localStorage
      setAuthTokens(token, refreshToken);
      
      return { user, token, refreshToken };
    } catch (error) {
      errorService.logError({
        message: 'Erro ao realizar login',
        error
      });
      throw error;
    }
  },

  /**
   * Registra um novo usuário
   * @param {Object} userData - Dados do novo usuário
   * @returns {Promise<Object>} Objeto com dados do usuário e tokens
   */
  async register(userData) {
    try {
      const response = await apiService.post('/auth/register', userData);
      const { token, refreshToken, user } = response.data.data;
      
      // Salva os tokens no localStorage
      setAuthTokens(token, refreshToken);
      
      return { user, token, refreshToken };
    } catch (error) {
      errorService.logError({
        message: 'Erro ao registrar usuário',
        error
      });
      throw error;
    }
  },

  /**
   * Realiza logout do usuário
   * @returns {boolean} Resultado da operação de logout
   */
  logout() {
    try {
      // Remove os tokens do localStorage
      clearAuthTokens();
      return true;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao realizar logout',
        error
      });
      return false;
    }
  },

  /**
   * Obtém os dados do usuário logado
   * @returns {Promise<Object>} Objeto com os dados do usuário
   */
  async getUserProfile() {
    try {
      const response = await apiService.get('/auth/me');
      return response.data.data.user;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao obter perfil do usuário',
        error
      });
      throw error;
    }
  },

  /**
   * Atualiza o token de acesso usando o refresh token
   * @returns {Promise<Object>} Objeto com o novo token
   */
  async refreshAccessToken() {
    try {
      const { refreshToken } = getAuthTokens();
      
      if (!refreshToken) {
        throw new Error('Refresh token não disponível');
      }
      
      const response = await apiService.post('/auth/refresh', { refreshToken });
      const { token } = response.data.data;
      
      // Atualiza apenas o token de acesso
      setAuthTokens(token, refreshToken);
      
      return { token, refreshToken };
    } catch (error) {
      errorService.logError({
        message: 'Erro ao atualizar token de acesso',
        error
      });
      
      // Limpa os tokens em caso de erro
      clearAuthTokens();
      
      throw error;
    }
  },

  /**
   * Atualiza o perfil do usuário
   * @param {Object} userData - Dados a serem atualizados
   * @returns {Promise<Object>} Objeto com os dados atualizados do usuário
   */
  async updateProfile(userData) {
    try {
      const response = await apiService.put('/users/profile', userData);
      return response.data.data.user;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao atualizar perfil',
        error
      });
      throw error;
    }
  },

  /**
   * Altera a senha do usuário
   * @param {Object} passwordData - Dados de senha (atual e nova)
   * @returns {Promise<Object>} Mensagem de confirmação
   */
  async changePassword(passwordData) {
    try {
      const response = await apiService.post('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao alterar senha',
        error
      });
      throw error;
    }
  },

  /**
   * Solicita redefinição de senha
   * @param {string} email - Email do usuário
   * @returns {Promise<Object>} Mensagem de confirmação
   */
  async forgotPassword(email) {
    try {
      const response = await apiService.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao solicitar redefinição de senha',
        error
      });
      throw error;
    }
  },

  /**
   * Redefine a senha com token
   * @param {string} token - Token de redefinição
   * @param {string} password - Nova senha
   * @returns {Promise<Object>} Mensagem de confirmação
   */
  async resetPassword(token, password) {
    try {
      const response = await apiService.post('/auth/reset-password', { token, password });
      return response.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao redefinir senha',
        error
      });
      throw error;
    }
  },

  /**
   * Verifica o email com token
   * @param {string} token - Token de verificação
   * @returns {Promise<Object>} Mensagem de confirmação
   */
  async verifyEmail(token) {
    try {
      const response = await apiService.post('/auth/verify-email', { token });
      return response.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao verificar email',
        error
      });
      throw error;
    }
  },

  /**
   * Reenvia o email de verificação
   * @param {string} email - Email do usuário
   * @returns {Promise<Object>} Mensagem de confirmação
   */
  async resendVerificationEmail(email) {
    try {
      const response = await apiService.post('/auth/resend-verification', { email });
      return response.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao reenviar email de verificação',
        error
      });
      throw error;
    }
  },
  
  /**
   * Atualiza preferências de notificação
   * @param {Object} preferences - Novas preferências
   * @returns {Promise<Object>} Preferências atualizadas
   */
  async updateNotificationPreferences(preferences) {
    try {
      const response = await apiService.put('/users/notification-preferences', preferences);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao atualizar preferências de notificação',
        error
      });
      throw error;
    }
  },
  
  /**
   * Verifica se o usuário está autenticado
   * @returns {boolean} Verdadeiro se o usuário estiver autenticado
   */
  isAuthenticated() {
    const { token } = getAuthTokens();
    return !!token;
  }
};

export default authService;