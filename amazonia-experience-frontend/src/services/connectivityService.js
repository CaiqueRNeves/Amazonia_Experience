import apiService from './apiService';
import errorService from './errorService';

/**
 * Serviço para operações relacionadas a conectividade
 * Gerencia pontos de Wi-Fi, relatórios e mapas de calor
 */
const connectivityService = {
  /**
   * Obtém lista de pontos de conectividade com paginação e filtros
   * @param {Object} params - Parâmetros de consulta (página, limite, filtros)
   * @returns {Promise<Object>} Lista paginada de pontos de conectividade
   */
  async getConnectivitySpots(params = {}) {
    try {
      const response = await apiService.get('/connectivity/spots', params);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao obter pontos de conectividade',
        error
      });
      throw error;
    }
  },

  /**
   * Obtém pontos de conectividade próximos com base na localização
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} radius - Raio em km (opcional)
   * @param {Object} params - Parâmetros adicionais (página, limite)
   * @returns {Promise<Object>} Lista paginada de pontos próximos
   */
  async getNearbySpots(latitude, longitude, radius = 5, params = {}) {
    try {
      const queryParams = {
        ...params,
        latitude,
        longitude,
        radius
      };
      
      const response = await apiService.get('/connectivity/spots/nearby', { params: queryParams });
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao obter pontos de conectividade próximos',
        error
      });
      throw error;
    }
  },

  /**
   * Envia relatório sobre um ponto de conectividade
   * @param {number} spotId - ID do ponto de conectividade
   * @param {Object} reportData - Dados do relatório
   * @returns {Promise<Object>} Confirmação do relatório
   */
  async reportSpot(spotId, reportData) {
    try {
      const response = await apiService.post(`/connectivity/spots/${spotId}/report`, reportData);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: `Erro ao enviar relatório para o ponto ${spotId}`,
        error
      });
      throw error;
    }
  },

  /**
   * Obtém dados para o mapa de calor de qualidade de sinal
   * @returns {Promise<Object>} Dados para o mapa de calor
   */
  async getHeatmap() {
    try {
      const response = await apiService.get('/connectivity/heatmap');
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao obter mapa de calor',
        error
      });
      throw error;
    }
  },
  
  /**
   * Obtém detalhes de um ponto de conectividade específico
   * @param {number} spotId - ID do ponto de conectividade
   * @returns {Promise<Object>} Detalhes do ponto
   */
  async getSpotById(spotId) {
    try {
      const response = await apiService.get(`/connectivity/spots/${spotId}`);
      return response.data.data.spot;
    } catch (error) {
      errorService.logError({
        message: `Erro ao obter ponto de conectividade ${spotId}`,
        error
      });
      throw error;
    }
  },
  
  /**
   * Obtém pontos de Wi-Fi gratuito
   * @param {Object} params - Parâmetros de consulta (página, limite)
   * @returns {Promise<Object>} Lista paginada de pontos gratuitos
   */
  async getFreeWifiSpots(params = {}) {
    try {
      const queryParams = {
        ...params,
        is_free: true
      };
      
      const response = await apiService.get('/connectivity/spots', { params: queryParams });
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao obter pontos de Wi-Fi gratuito',
        error
      });
      throw error;
    }
  },
  
  /**
   * Obtém pontos de conectividade verificados
   * @param {Object} params - Parâmetros de consulta (página, limite)
   * @returns {Promise<Object>} Lista paginada de pontos verificados
   */
  async getVerifiedSpots(params = {}) {
    try {
      const queryParams = {
        ...params,
        is_verified: true
      };
      
      const response = await apiService.get('/connectivity/spots', { params: queryParams });
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao obter pontos de conectividade verificados',
        error
      });
      throw error;
    }
  },
  
  /**
   * Obtém pontos de conectividade por velocidade de Wi-Fi
   * @param {string} speed - Velocidade de Wi-Fi (slow, medium, fast)
   * @param {Object} params - Parâmetros de consulta (página, limite)
   * @returns {Promise<Object>} Lista paginada de pontos
   */
  async getSpotsByWifiSpeed(speed, params = {}) {
    try {
      const queryParams = {
        ...params,
        wifi_speed: speed
      };
      
      const response = await apiService.get('/connectivity/spots', { params: queryParams });
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: `Erro ao obter pontos de conectividade com velocidade ${speed}`,
        error
      });
      throw error;
    }
  },
  
  /**
   * Busca pontos de conectividade por termo
   * @param {string} searchTerm - Termo de busca
   * @param {Object} params - Parâmetros de consulta (página, limite)
   * @returns {Promise<Object>} Lista paginada de pontos correspondentes à busca
   */
  async searchSpots(searchTerm, params = {}) {
    try {
      const queryParams = {
        ...params,
        search: searchTerm
      };
      
      const response = await apiService.get('/connectivity/spots', { params: queryParams });
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: `Erro ao buscar pontos de conectividade com termo "${searchTerm}"`,
        error
      });
      throw error;
    }
  },
  
  /**
   * Testa a conectividade atual do dispositivo
   * @returns {Promise<Object>} Resultado do teste de conectividade
   */
  async testConnection() {
    try {
      const startTime = Date.now();
      const response = await apiService.get('/connectivity/test', { timeout: 10000 });
      const endTime = Date.now();
      
      // Calcula o tempo de resposta em milissegundos
      const responseTime = endTime - startTime;
      
      return {
        ...response.data.data,
        responseTime
      };
    } catch (error) {
      errorService.logError({
        message: 'Erro ao testar conectividade',
        error
      });
      
      // Retorna erro de conectividade
      return {
        status: 'error',
        connected: false,
        message: 'Falha na conexão'
      };
    }
  }
};

export default connectivityService;