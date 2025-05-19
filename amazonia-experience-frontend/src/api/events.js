const apiClient = require('./apiClient');

/**
 * Funções para interagir com as APIs de eventos
 */

/**
 * Obter lista de eventos
 * @param {Object} params - Parâmetros de consulta (página, limite, filtros)
 * @returns {Promise<Object>} Lista paginada de eventos
 */
const getEvents = async (params = {}) => {
  const response = await apiClient.get('/events', { params });
  return response.data.data;
};

/**
 * Obter detalhes de um evento
 * @param {number} id - ID do evento
 * @returns {Promise<Object>} Detalhes do evento
 */
const getEventById = async (id) => {
  const response = await apiClient.get(`/events/${id}`);
  return response.data.data.event;
};

/**
 * Obter eventos próximos com base na localização
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @param {number} radius - Raio em km (opcional)
 * @param {Object} params - Parâmetros adicionais (página, limite)
 * @returns {Promise<Object>} Lista paginada de eventos próximos
 */
const getNearbyEvents = async (latitude, longitude, radius = 5, params = {}) => {
  const queryParams = {
    ...params,
    latitude,
    longitude,
    radius
  };
  
  const response = await apiClient.get('/events/nearby', { params: queryParams });
  return response.data.data;
};

/**
 * Realizar check-in em um evento
 * @param {number} eventId - ID do evento
 * @returns {Promise<Object>} Detalhes do check-in
 */
const checkInEvent = async (eventId) => {
  const response = await apiClient.post('/events/checkin', { event_id: eventId });
  return response.data.data;
};

/**
 * Obter eventos em destaque
 * @param {Object} params - Parâmetros de consulta (página, limite)
 * @returns {Promise<Object>} Lista paginada de eventos em destaque
 */
const getFeaturedEvents = async (params = {}) => {
  const queryParams = {
    ...params,
    featured: true
  };
  
  const response = await apiClient.get('/events', { params: queryParams });
  return response.data.data;
};

/**
 * Obter eventos por tipo
 * @param {string} eventType - Tipo de evento
 * @param {Object} params - Parâmetros de consulta (página, limite)
 * @returns {Promise<Object>} Lista paginada de eventos do tipo especificado
 */
const getEventsByType = async (eventType, params = {}) => {
  const queryParams = {
    ...params,
    event_type: eventType
  };
  
  const response = await apiClient.get('/events', { params: queryParams });
  return response.data.data;
};

/**
 * Buscar eventos por termo
 * @param {string} searchTerm - Termo de busca
 * @param {Object} params - Parâmetros de consulta (página, limite)
 * @returns {Promise<Object>} Lista paginada de eventos correspondentes à busca
 */
const searchEvents = async (searchTerm, params = {}) => {
  const queryParams = {
    ...params,
    search: searchTerm
  };
  
  const response = await apiClient.get('/events', { params: queryParams });
  return response.data.data;
};

/**
 * Obter eventos por data
 * @param {Date} startDate - Data inicial
 * @param {Date} endDate - Data final (opcional)
 * @param {Object} params - Parâmetros de consulta (página, limite)
 * @returns {Promise<Object>} Lista paginada de eventos dentro do período
 */
const getEventsByDate = async (startDate, endDate, params = {}) => {
  const queryParams = {
    ...params,
    start_date: startDate.toISOString().split('T')[0]
  };
  
  if (endDate) {
    queryParams.end_date = endDate.toISOString().split('T')[0];
  }
  
  const response = await apiClient.get('/events', { params: queryParams });
  return response.data.data;
};

module.exports = {
  getEvents,
  getEventById,
  getNearbyEvents,
  checkInEvent,
  getFeaturedEvents,
  getEventsByType,
  searchEvents,
  getEventsByDate
};