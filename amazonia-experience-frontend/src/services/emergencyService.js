import apiService from './apiService';
import errorService from './errorService';

/**
 * Serviço para operações relacionadas a serviços de emergência
 * Gerencia listagem, detalhes, contatos e frases úteis
 */
const emergencyService = {
  /**
   * Obtém lista de serviços de emergência com paginação e filtros
   * @param {Object} params - Parâmetros de consulta (página, limite, filtros)
   * @returns {Promise<Object>} Lista paginada de serviços de emergência
   */
  async getEmergencyServices(params = {}) {
    try {
      const response = await apiService.get('/emergency/services', params);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao obter serviços de emergência',
        error
      });
      throw error;
    }
  },

  /**
   * Obtém serviços de emergência por tipo
   * @param {string} type - Tipo de serviço (hospital, pharmacy, police, etc)
   * @param {Object} params - Parâmetros adicionais (página, limite)
   * @returns {Promise<Object>} Lista paginada de serviços do tipo especificado
   */
  async getServicesByType(type, params = {}) {
    try {
      const response = await apiService.get(`/emergency/services/${type}`, params);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: `Erro ao obter serviços de emergência do tipo ${type}`,
        error
      });
      throw error;
    }
  },

  /**
   * Obtém serviços de emergência próximos com base na localização
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} radius - Raio em km (opcional)
   * @param {string} type - Tipo de serviço (opcional)
   * @param {Object} params - Parâmetros adicionais (página, limite)
   * @returns {Promise<Object>} Lista paginada de serviços próximos
   */
  async getNearbyServices(latitude, longitude, radius = 5, type = null, params = {}) {
    try {
      const queryParams = {
        ...params,
        latitude,
        longitude,
        radius
      };
      
      if (type) {
        queryParams.type = type;
      }
      
      const response = await apiService.get('/emergency/services/nearby', { params: queryParams });
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao obter serviços de emergência próximos',
        error
      });
      throw error;
    }
  },

  /**
   * Obtém contatos de emergência por idioma
   * @param {string} language - Código do idioma (pt-BR, en-US, etc)
   * @returns {Promise<Object>} Contatos de emergência
   */
  async getContactsByLanguage(language) {
    try {
      const response = await apiService.get(`/emergency/contacts/${language}`);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: `Erro ao obter contatos de emergência no idioma ${language}`,
        error
      });
      throw error;
    }
  },

  /**
   * Obtém frases úteis por idioma
   * @param {string} language - Código do idioma (pt-BR, en-US, etc)
   * @returns {Promise<Object>} Frases úteis agrupadas por categoria
   */
  async getPhrasesByLanguage(language) {
    try {
      const response = await apiService.get(`/emergency/phrases/${language}`);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: `Erro ao obter frases úteis no idioma ${language}`,
        error
      });
      throw error;
    }
  },
  
  /**
   * Obtém detalhes de um serviço de emergência específico
   * @param {number} id - ID do serviço
   * @returns {Promise<Object>} Detalhes do serviço
   */
  async getServiceById(id) {
    try {
      const response = await apiService.get(`/emergency/services/${id}`);
      return response.data.data.service;
    } catch (error) {
      errorService.logError({
        message: `Erro ao obter serviço de emergência ${id}`,
        error
      });
      throw error;
    }
  },
  
  /**
   * Obtém contatos de embaixadas
   * @param {string} nationality - Nacionalidade do usuário
   * @returns {Promise<Object>} Contatos de embaixadas
   */
  async getEmbassyContacts(nationality) {
    try {
      const response = await apiService.get('/emergency/embassies', {
        params: { nationality }
      });
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: `Erro ao obter contatos de embaixadas para nacionalidade ${nationality}`,
        error
      });
      throw error;
    }
  },
  
  /**
   * Reporta uma emergência ou solicita ajuda
   * @param {Object} emergencyData - Dados da emergência
   * @param {number} emergencyData.latitude - Latitude da localização
   * @param {number} emergencyData.longitude - Longitude da localização
   * @param {string} emergencyData.type - Tipo de emergência
   * @param {string} emergencyData.description - Descrição da emergência
   * @returns {Promise<Object>} Confirmação do reporte
   */
  async reportEmergency(emergencyData) {
    try {
      const response = await apiService.post('/emergency/report', emergencyData);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao reportar emergência',
        error
      });
      throw error;
    }
  },
  
  /**
   * Verifica se um serviço está aberto no momento atual
   * @param {number} serviceId - ID do serviço
   * @returns {Promise<boolean>} Verdadeiro se o serviço estiver aberto
   */
  async isServiceOpen(serviceId) {
    try {
      const service = await this.getServiceById(serviceId);
      
      // Se o serviço funciona 24h, está sempre aberto
      if (service.is_24h) {
        return true;
      }
      
      // Verifica com base no horário de funcionamento e horário atual
      // Esta é uma implementação simplificada e deve ser adaptada conforme necessário
      const now = new Date();
      const currentHour = now.getHours();
      const currentDayOfWeek = now.getDay(); // 0 (domingo) a 6 (sábado)
      
      // Assumindo que o horário de funcionamento está em um formato específico
      // Esta implementação é apenas ilustrativa e deve ser adaptada ao formato real dos dados
      if (!service.opening_hours) {
        return false;
      }
      
      // Exemplo de lógica para verificar se está aberto
      // Considerando um formato hipotético de opening_hours
      if (service.opening_hours.includes('24 horas')) {
        return true;
      }
      
      // Verifica se está fechado aos finais de semana
      if ((currentDayOfWeek === 0 || currentDayOfWeek === 6) && 
          service.opening_hours.includes('Segunda a sexta')) {
        return false;
      }
      
      // Considerando um horário comercial padrão das 8h às 18h
      // Na prática, isso deve ser adaptado para analisar o formato real do campo opening_hours
      if (currentHour >= 8 && currentHour < 18) {
        return true;
      }
      
      return false;
    } catch (error) {
      errorService.logError({
        message: `Erro ao verificar status de operação do serviço ${serviceId}`,
        error
      });
      // Em caso de erro, assume que está fechado
      return false;
    }
  }
};

export default emergencyService;