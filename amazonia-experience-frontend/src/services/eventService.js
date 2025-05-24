import apiService from './apiService';
import errorService from './errorService';

/**
 * Serviço para operações relacionadas a eventos
 * Gerencia listagem, detalhes e check-in em eventos
 */
const eventService = {
  /**
   * Obtém lista de eventos com paginação e filtros
   * @param {Object} params - Parâmetros de consulta (página, limite, filtros)
   * @returns {Promise<Object>} Lista paginada de eventos
   */
  async getEvents(params = {}) {
    try {
      const response = await apiService.get('/events', params);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao obter eventos',
        error
      });
      throw error;
    }
  },

  /**
   * Obtém detalhes de um evento específico
   * @param {number} id - ID do evento
   * @returns {Promise<Object>} Detalhes do evento
   */
  async getEventById(id) {
    try {
      const response = await apiService.get(`/events/${id}`);
      return response.data.data.event;
    } catch (error) {
      errorService.logError({
        message: `Erro ao obter evento ${id}`,
        error
      });
      throw error;
    }
  },

  /**
   * Obtém eventos próximos com base na localização
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} radius - Raio em km (opcional)
   * @param {Object} params - Parâmetros adicionais (página, limite)
   * @returns {Promise<Object>} Lista paginada de eventos próximos
   */
  async getNearbyEvents(latitude, longitude, radius = 5, params = {}) {
    try {
      const queryParams = {
        ...params,
        latitude,
        longitude,
        radius
      };
      
      const response = await apiService.get('/events/nearby', queryParams);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao obter eventos próximos',
        error
      });
      throw error;
    }
  },

  /**
   * Realiza check-in em um evento
   * @param {number} eventId - ID do evento
   * @returns {Promise<Object>} Detalhes do check-in
   */
  async checkInEvent(eventId) {
    try {
      const response = await apiService.post('/events/checkin', { event_id: eventId });
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: `Erro ao fazer check-in no evento ${eventId}`,
        error
      });
      throw error;
    }
  },

  /**
   * Obtém eventos em destaque
   * @param {Object} params - Parâmetros de consulta (página, limite)
   * @returns {Promise<Object>} Lista paginada de eventos em destaque
   */
  async getFeaturedEvents(params = {}) {
    try {
      const queryParams = {
        ...params,
        featured: true
      };
      
      const response = await apiService.get('/events', queryParams);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao obter eventos em destaque',
        error
      });
      throw error;
    }
  },

  /**
   * Obtém eventos por tipo
   * @param {string} eventType - Tipo de evento
   * @param {Object} params - Parâmetros de consulta (página, limite)
   * @returns {Promise<Object>} Lista paginada de eventos do tipo especificado
   */
  async getEventsByType(eventType, params = {}) {
    try {
      const queryParams = {
        ...params,
        event_type: eventType
      };
      
      const response = await apiService.get('/events', queryParams);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: `Erro ao obter eventos do tipo ${eventType}`,
        error
      });
      throw error;
    }
  },

  /**
   * Busca eventos por termo
   * @param {string} searchTerm - Termo de busca
   * @param {Object} params - Parâmetros de consulta (página, limite)
   * @returns {Promise<Object>} Lista paginada de eventos correspondentes à busca
   */
  async searchEvents(searchTerm, params = {}) {
    try {
      const queryParams = {
        ...params,
        search: searchTerm
      };
      
      const response = await apiService.get('/events', queryParams);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: `Erro ao buscar eventos com termo "${searchTerm}"`,
        error
      });
      throw error;
    }
  },

  /**
   * Obtém eventos por data
   * @param {Date} startDate - Data inicial
   * @param {Date} endDate - Data final (opcional)
   * @param {Object} params - Parâmetros de consulta (página, limite)
   * @returns {Promise<Object>} Lista paginada de eventos dentro do período
   */
  async getEventsByDate(startDate, endDate, params = {}) {
    try {
      const queryParams = {
        ...params,
        start_date: startDate.toISOString().split('T')[0]
      };
      
      if (endDate) {
        queryParams.end_date = endDate.toISOString().split('T')[0];
      }
      
      const response = await apiService.get('/events', queryParams);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao obter eventos por data',
        error
      });
      throw error;
    }
  },
  
  /**
   * Obtém eventos que estão acontecendo no momento
   * @returns {Promise<Array>} Lista de eventos em andamento
   */
  async getOngoingEvents() {
    try {
      const now = new Date();
      const response = await apiService.get('/events', {
        start_date_lte: now.toISOString(),
        end_date_gte: now.toISOString()
      });
      return response.data.data.events;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao obter eventos em andamento',
        error
      });
      throw error;
    }
  },
  
  /**
   * Obtém o próximo evento programado
   * @returns {Promise<Object>} Próximo evento
   */
  async getNextEvent() {
    try {
      const now = new Date();
      const response = await apiService.get('/events', {
        start_date_gte: now.toISOString(),
        limit: 1,
        _sort: 'start_time',
        _order: 'asc'
      });
      
      const events = response.data.data.events;
      return events.length > 0 ? events[0] : null;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao obter próximo evento',
        error
      });
      throw error;
    }
  }
};

export default eventService;