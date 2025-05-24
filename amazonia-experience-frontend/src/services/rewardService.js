import apiService from './apiService';
import errorService from './errorService';

/**
 * Serviço para operações relacionadas a recompensas
 * Gerencia listagem, detalhes e resgate de recompensas
 */
const rewardService = {
  /**
   * Obtém lista de recompensas com paginação e filtros
   * @param {Object} params - Parâmetros de consulta (página, limite, filtros)
   * @returns {Promise<Object>} Lista paginada de recompensas
   */
  async getRewards(params = {}) {
    try {
      const response = await apiService.get('/rewards', params);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao obter recompensas',
        error
      });
      throw error;
    }
  },

  /**
   * Obtém recompensas físicas
   * @param {Object} params - Parâmetros de consulta (página, limite)
   * @returns {Promise<Object>} Lista paginada de recompensas físicas
   */
  async getPhysicalRewards(params = {}) {
    try {
      const response = await apiService.get('/rewards/physical', params);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao obter recompensas físicas',
        error
      });
      throw error;
    }
  },

  /**
   * Obtém recompensas digitais
   * @param {Object} params - Parâmetros de consulta (página, limite)
   * @returns {Promise<Object>} Lista paginada de recompensas digitais
   */
  async getDigitalRewards(params = {}) {
    try {
      const response = await apiService.get('/rewards/digital', params);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao obter recompensas digitais',
        error
      });
      throw error;
    }
  },

  /**
   * Obtém detalhes de uma recompensa específica
   * @param {number} id - ID da recompensa
   * @returns {Promise<Object>} Detalhes da recompensa
   */
  async getRewardById(id) {
    try {
      const response = await apiService.get(`/rewards/${id}`);
      return response.data.data.reward;
    } catch (error) {
      errorService.logError({
        message: `Erro ao obter recompensa ${id}`,
        error
      });
      throw error;
    }
  },

  /**
   * Resgata uma recompensa
   * @param {number} rewardId - ID da recompensa
   * @returns {Promise<Object>} Detalhes do resgate
   */
  async redeemReward(rewardId) {
    try {
      const response = await apiService.post(`/rewards/${rewardId}/redeem`);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: `Erro ao resgatar recompensa ${rewardId}`,
        error
      });
      throw error;
    }
  },

  /**
   * Obtém histórico de resgates do usuário
   * @param {Object} params - Parâmetros de consulta (página, limite)
   * @returns {Promise<Object>} Histórico de resgates
   */
  async getRedemptions(params = {}) {
    try {
      const response = await apiService.get('/rewards/redemptions', params);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao obter histórico de resgates',
        error
      });
      throw error;
    }
  },
  
  /**
   * Obtém recompensas por tipo
   * @param {string} rewardType - Tipo da recompensa
   * @param {Object} params - Parâmetros de consulta (página, limite)
   * @returns {Promise<Object>} Lista paginada de recompensas do tipo especificado
   */
  async getRewardsByType(rewardType, params = {}) {
    try {
      const queryParams = {
        ...params,
        reward_type: rewardType
      };
      
      const response = await apiService.get('/rewards', queryParams);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: `Erro ao obter recompensas do tipo ${rewardType}`,
        error
      });
      throw error;
    }
  },
  
  /**
   * Obtém recompensas por parceiro
   * @param {number} partnerId - ID do parceiro
   * @param {Object} params - Parâmetros de consulta (página, limite)
   * @returns {Promise<Object>} Lista paginada de recompensas do parceiro
   */
  async getRewardsByPartner(partnerId, params = {}) {
    try {
      const queryParams = {
        ...params,
        partner_id: partnerId
      };
      
      const response = await apiService.get('/rewards', queryParams);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: `Erro ao obter recompensas do parceiro ${partnerId}`,
        error
      });
      throw error;
    }
  },
  
  /**
   * Busca recompensas por termo
   * @param {string} searchTerm - Termo de busca
   * @param {Object} params - Parâmetros de consulta (página, limite)
   * @returns {Promise<Object>} Lista paginada de recompensas correspondentes à busca
   */
  async searchRewards(searchTerm, params = {}) {
    try {
      const queryParams = {
        ...params,
        search: searchTerm
      };
      
      const response = await apiService.get('/rewards', queryParams);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: `Erro ao buscar recompensas com termo "${searchTerm}"`,
        error
      });
      throw error;
    }
  },
  
  /**
   * Obtém recompensas por custo máximo em AmaCoins
   * @param {number} maxCost - Custo máximo em AmaCoins
   * @param {Object} params - Parâmetros de consulta (página, limite)
   * @returns {Promise<Object>} Lista paginada de recompensas
   */
  async getRewardsByMaxCost(maxCost, params = {}) {
    try {
      const queryParams = {
        ...params,
        max_cost: maxCost
      };
      
      const response = await apiService.get('/rewards', queryParams);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: `Erro ao obter recompensas com custo máximo ${maxCost}`,
        error
      });
      throw error;
    }
  },
  
  /**
   * Obtém recompensas em estoque
   * @param {Object} params - Parâmetros de consulta (página, limite)
   * @returns {Promise<Object>} Lista paginada de recompensas em estoque
   */
  async getInStockRewards(params = {}) {
    try {
      const queryParams = {
        ...params,
        in_stock: true
      };
      
      const response = await apiService.get('/rewards', queryParams);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao obter recompensas em estoque',
        error
      });
      throw error;
    }
  }
};

export default rewardService;