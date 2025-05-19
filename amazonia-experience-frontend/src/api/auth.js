import apiClient from './apiClient';

/**
 * Funções para interagir com as APIs de autenticação do backend
 */

/**
 * Login de usuário
 * @param {Object} credentials - Credenciais de login (email, senha)
 * @returns {Promise<Object>} Dados do usuário e tokens
 */
export const login = async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data.data;
};

/**
 * Registro de usuário
 * @param {Object} userData - Dados do usuário
 * @returns {Promise<Object>} Dados do usuário criado e tokens
 */
export const register = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);
  return response.data.data;
};

/**
 * Obter dados do usuário logado
 * @returns {Promise<Object>} Dados do usuário
 */
export const getUserProfile = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data.data.user;
};

/**
 * Atualizar o token de acesso
 * @param {string} refreshToken - Token de atualização
 * @returns {Promise<Object>} Novo token de acesso
 */
export const refreshToken = async (refreshToken) => {
  const response = await apiClient.post('/auth/refresh', { refreshToken });
  return response.data.data;
};

/**
 * Alterar senha do usuário
 * @param {Object} passwordData - Dados da senha (atual e nova)
 * @returns {Promise<Object>} Mensagem de sucesso
 */
export const changePassword = async (passwordData) => {
  const response = await apiClient.post('/auth/change-password', passwordData);
  return response.data;
};

/**
 * Solicitar recuperação de senha
 * @param {string} email - Email do usuário
 * @returns {Promise<Object>} Mensagem de sucesso
 */
export const forgotPassword = async (email) => {
  const response = await apiClient.post('/auth/forgot-password', { email });
  return response.data;
};

/**
 * Redefinir senha usando token
 * @param {string} token - Token de recuperação
 * @param {string} password - Nova senha
 * @returns {Promise<Object>} Mensagem de sucesso
 */
export const resetPassword = async (token, password) => {
  const response = await apiClient.post('/auth/reset-password', { token, password });
  return response.data;
};

/**
 * Verificar email usando token
 * @param {string} token - Token de verificação
 * @returns {Promise<Object>} Mensagem de sucesso
 */
export const verifyEmail = async (token) => {
  const response = await apiClient.post('/auth/verify-email', { token });
  return response.data;
};

/**
 * Reenviar email de verificação
 * @param {string} email - Email do usuário
 * @returns {Promise<Object>} Mensagem de sucesso
 */
export const resendVerificationEmail = async (email) => {
  const response = await apiClient.post('/auth/resend-verification', { email });
  return response.data;
};

export default {
  login,
  register,
  getUserProfile,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail
};