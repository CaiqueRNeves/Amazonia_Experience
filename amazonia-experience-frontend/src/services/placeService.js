import apiService from './apiService';
import errorService from './errorService';

/**
 * Serviço para operações relacionadas a lugares
 * Gerencia listagem, detalhes e check-in em lugares
 */
const placeService = {
  /**
   * Obtém lista de lugares com paginação e filtros
   * @param {Object} params - Parâmetros de consulta (página, limite, filtros)
   * @returns {Promise<Object>} Lista paginada de lugares
   */
  async getPlaces(params = {}) {
    try {
      const response = await apiService.get('/places', params);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao obter lugares',
        error
      });
      throw error;
    }
  },

  /**
   * Obtém detalhes de um lugar específico
   * @param {number} id - ID do lugar
   * @returns {Promise<Object>} Detalhes do lugar
   */
  async getPlaceById(id) {
    try {
      const response = await apiService.get(`/places/${id}`);
      return response.data.data.place;
    } catch (error) {
      errorService.logError({
        message: `Erro ao obter lugar ${id}`,
        error
      });
      throw error;
    }
  },

  /**
   * Obtém lugares próximos com base na localização
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} radius - Raio em km (opcional)
   * @param {Object} params - Parâmetros adicionais (página, limite)
   * @returns {Promise<Object>} Lista paginada de lugares próximos
   */
  async getNearbyPlaces(latitude, longitude, radius = 5, params = {}) {
    try {
      const queryParams = {
        ...params,
        latitude,
        longitude,
        radius
      };
      
      const response = await apiService.get('/places/nearby', queryParams);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao obter lugares próximos',
        error
      });
      throw error;
    }
  },

  /**
   * Realiza check-in em um lugar
   * @param {number} placeId - ID do lugar
   * @returns {Promise<Object>} Detalhes do check-in
   */
  async checkInPlace(placeId) {
    try {
      const response = await apiService.post('/places/checkin', { place_id: placeId });
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: `Erro ao fazer check-in no lugar ${placeId}`,
        error
      });
      throw error;
    }
  },

  /**
   * Obtém lugares por tipo
   * @param {string} placeType - Tipo de lugar
   * @param {Object} params - Parâmetros de consulta (página, limite)
   * @returns {Promise<Object>} Lista paginada de lugares do tipo especificado
   */
  async getPlacesByType(placeType, params = {}) {
    try {
      const queryParams = {
        ...params,
        type: placeType
      };
      
      const response = await apiService.get('/places', queryParams);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: `Erro ao obter lugares do tipo ${placeType}`,
        error
      });
      throw error;
    }
  },

  /**
   * Busca lugares por termo
   * @param {string} searchTerm - Termo de busca
   * @param {Object} params - Parâmetros de consulta (página, limite)
   * @returns {Promise<Object>} Lista paginada de lugares correspondentes à busca
   */
  async searchPlaces(searchTerm, params = {}) {
    try {
      const queryParams = {
        ...params,
        search: searchTerm
      };
      
      const response = await apiService.get('/places', queryParams);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: `Erro ao buscar lugares com termo "${searchTerm}"`,
        error
      });
      throw error;
    }
  },

  /**
   * Obtém lugares por parceiro
   * @param {number} partnerId - ID do parceiro
   * @param {Object} params - Parâmetros de consulta (página, limite)
   * @returns {Promise<Object>} Lista paginada de lugares do parceiro
   */
  async getPlacesByPartner(partnerId, params = {}) {
    try {
      const queryParams = {
        ...params,
        partner_id: partnerId
      };
      
      const response = await apiService.get('/places', queryParams);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: `Erro ao obter lugares do parceiro ${partnerId}`,
        error
      });
      throw error;
    }
  },
  
  /**
   * Obtém histórico de visitantes de um lugar
   * @param {number} placeId - ID do lugar
   * @param {Object} params - Parâmetros de consulta (página, limite)
   * @returns {Promise<Object>} Lista paginada de visitantes
   */
  async getPlaceVisitors(placeId, params = {}) {
    try {
      const response = await apiService.get(`/places/${placeId}/visitors`, params);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: `Erro ao obter visitantes do lugar ${placeId}`,
        error
      });
      throw error;
    }
  },
  
  /**
   * Verifica se um lugar tem Wi-Fi disponível
   * @param {number} placeId - ID do lugar
   * @returns {Promise<boolean>} Verdadeiro se tiver Wi-Fi
   */
  async hasWifi(placeId) {
    try {
      const place = await this.getPlaceById(placeId);
      return place && place.wifi_available === true;
    } catch (error) {
      errorService.logError({
        message: `Erro ao verificar Wi-Fi do lugar ${placeId}`,
        error
      });
      throw error;
    }
  },
  
  /**
   * Obtém lugares com Wi-Fi disponível
   * @param {Object} params - Parâmetros de consulta (página, limite)
   * @returns {Promise<Object>} Lista paginada de lugares com Wi-Fi
   */
  async getPlacesWithWifi(params = {}) {
    try {
      const queryParams = {
        ...params,
        wifi: true
      };
      
      const response = await apiService.get('/places', queryParams);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao obter lugares com Wi-Fi',
        error
      });
      throw error;
    }
  }
};

export default placeService;