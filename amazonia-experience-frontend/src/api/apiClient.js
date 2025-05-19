import axios from 'axios';
import { getAuthTokens, clearAuthTokens } from '../utils/authStorage';

/**
 * Cliente Axios configurado para realizar chamadas à API
 * Adiciona automaticamente tokens de autenticação e lida com erros
 */
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

/**
 * Interceptador de requisições
 * Adiciona token de autenticação a cada requisição se disponível
 */
apiClient.interceptors.request.use(
  (config) => {
    const { token } = getAuthTokens();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptador de respostas
 * Lida com erros comuns como 401 (não autorizado)
 * Também poderia lidar com refresh token, caso necessário
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const originalRequest = error.config;
    
    // Tratar erro 401 (não autorizado)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // Se houver um refresh token implementado, poderia tentar renovar o token aqui
      // Por enquanto, apenas loga o usuário
      clearAuthTokens();
      
      // Redirecionar para página de login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;