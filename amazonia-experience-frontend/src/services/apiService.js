import axios from 'axios';
import { getAuthTokens, clearAuthTokens } from '../utils/authStorage';
import errorService from './errorService';
import { store } from '../redux/store';
import { refreshToken, logout } from '../redux/slices/authSlice';

/**
 * Serviço base para interação com a API
 * Gerencia requisições, respostas, autenticação e erros
 */
const apiService = {
  /**
   * Instância configurada do Axios para requisições à API
   */
  client: axios.create({
    baseURL: process.env.REACT_APP_API_URL || '/api',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    timeout: 30000 // 30 segundos
  }),

  /**
   * Inicializa interceptadores de requisição e resposta
   */
  init() {
    // Interceptador de requisição - adiciona token a cada requisição
    this.client.interceptors.request.use(
      (config) => {
        const { token } = getAuthTokens();
        
        // Adiciona o token de autenticação ao cabeçalho, se disponível
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptador de resposta - trata erros comuns
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        
        // Se o erro for de autenticação (401) e não for uma requisição de refresh
        if (error.response?.status === 401 && 
            !originalRequest._retry && 
            !originalRequest.url?.includes('auth/refresh')) {
          
          originalRequest._retry = true;
          
          try {
            // Tenta renovar o token
            const { refreshToken: token } = getAuthTokens();
            
            if (token) {
              // Dispatch da ação de refresh token
              await store.dispatch(refreshToken());
              
              // Atualiza o cabeçalho com o novo token
              const { token: newToken } = getAuthTokens();
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              
              // Refaz a requisição original com o novo token
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Se falhar o refresh, limpa os tokens e redireciona para login
            clearAuthTokens();
            store.dispatch(logout());
            
            // Registra o erro de autenticação
            errorService.logError({
              message: 'Erro de autenticação no refresh token',
              error: refreshError
            });
            
            return Promise.reject(error);
          }
        }
        
        // Trata erros de rede
        if (!error.response) {
          errorService.logError({
            message: 'Erro de rede ou servidor indisponível',
            error
          });
          
          return Promise.reject({
            ...error,
            isNetworkError: true
          });
        }
        
        // Trata outros códigos de erro
        errorService.logError({
          message: `Erro ${error.response.status}`,
          error,
          status: error.response.status,
          endpoint: originalRequest.url
        });
        
        return Promise.reject(error);
      }
    );
  },

  /**
   * Realiza uma requisição GET
   * @param {string} url - Endpoint da API
   * @param {Object} params - Parâmetros de consulta
   * @param {Object} config - Configurações adicionais do Axios
   * @returns {Promise} Promise com a resposta da requisição
   */
  async get(url, params = {}, config = {}) {
    return this.client.get(url, { 
      params, 
      ...config 
    });
  },

  /**
   * Realiza uma requisição POST
   * @param {string} url - Endpoint da API
   * @param {Object} data - Dados a serem enviados
   * @param {Object} config - Configurações adicionais do Axios
   * @returns {Promise} Promise com a resposta da requisição
   */
  async post(url, data = {}, config = {}) {
    return this.client.post(url, data, config);
  },

  /**
   * Realiza uma requisição PUT
   * @param {string} url - Endpoint da API
   * @param {Object} data - Dados a serem enviados
   * @param {Object} config - Configurações adicionais do Axios
   * @returns {Promise} Promise com a resposta da requisição
   */
  async put(url, data = {}, config = {}) {
    return this.client.put(url, data, config);
  },

  /**
   * Realiza uma requisição PATCH
   * @param {string} url - Endpoint da API
   * @param {Object} data - Dados a serem enviados
   * @param {Object} config - Configurações adicionais do Axios
   * @returns {Promise} Promise com a resposta da requisição
   */
  async patch(url, data = {}, config = {}) {
    return this.client.patch(url, data, config);
  },

  /**
   * Realiza uma requisição DELETE
   * @param {string} url - Endpoint da API
   * @param {Object} config - Configurações adicionais do Axios
   * @returns {Promise} Promise com a resposta da requisição
   */
  async delete(url, config = {}) {
    return this.client.delete(url, config);
  },

  /**
   * Configura uma nova instância do cliente com configurações personalizadas
   * @param {Object} config - Configurações personalizadas para o Axios
   * @returns {AxiosInstance} Nova instância configurada do Axios
   */
  createClient(config = {}) {
    return axios.create({
      ...this.client.defaults,
      ...config
    });
  },

  /**
   * Verifica se o servidor está acessível
   * @returns {Promise<boolean>} Verdadeiro se o servidor estiver acessível
   */
  async ping() {
    try {
      const res = await this.client.get('/ping', { timeout: 5000 });
      return res.status === 200;
    } catch (error) {
      return false;
    }
  }
};

// Inicializa os interceptadores
apiService.init();

export default apiService;