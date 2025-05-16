const Event = require('../models/Event');
const Visit = require('../models/Visit');
const User = require('../models/User');
const { NotFoundError, ValidationError } = require('../middleware/error');

/**
 * Serviço responsável por operações relacionadas a eventos
 */
class EventService {
  /**
   * Lista eventos com paginação e filtros
   * @param {number} page - Página atual
   * @param {number} limit - Limite por página
   * @param {Object} filters - Filtros para a busca
   * @returns {Array} - Lista de eventos
   */
  async getEvents(page = 1, limit = 10, filters = {}) {
    return Event.findAll(page, limit, filters);
  }

  /**
   * Obtém detalhes de um evento específico
   * @param {number} eventId - ID do evento
   * @returns {Object} - Detalhes do evento
   */
  async getEvent(eventId) {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new NotFoundError('Evento não encontrado');
    }
    
    return event;
  }

  /**
   * Lista eventos próximos por geolocalização
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} radius - Raio de busca em km
   * @param {number} page - Página atual
   * @param {number} limit - Limite por página
   * @returns {Array} - Lista de eventos próximos
   */
  async getNearbyEvents(latitude, longitude, radius = 5, page = 1, limit = 10) {
    if (!latitude || !longitude) {
      throw new ValidationError('Latitude e longitude são obrigatórios');
    }
    
    return Event.findNearby(
      parseFloat(latitude),
      parseFloat(longitude),
      radius,
      page,
      limit
    );
  }

  /**
   * Realiza check-in em um evento
   * @param {number} userId - ID do usuário
   * @param {number} eventId - ID do evento
   * @returns {Object} - Dados da visita registrada
   */
  async checkIn(userId, eventId) {
    // Verificar se o evento existe
    const event = await Event.findById(eventId);
    if (!event) {
      throw new NotFoundError('Evento não encontrado');
    }
    
    // Verificar se o evento já atingiu capacidade máxima
    if (event.max_capacity && event.current_attendance >= event.max_capacity) {
      throw new ValidationError('Evento já atingiu capacidade máxima');
    }
    
    // Verificar se o usuário já fez check-in neste evento
    const existingVisits = await Visit.getByEventId(eventId);
    const userAlreadyCheckedIn = existingVisits.some(visit => 
      visit.user_id === userId && ['verified', 'pending'].includes(visit.status)
    );
    
    if (userAlreadyCheckedIn) {
      throw new ValidationError('Você já realizou check-in neste evento');
    }
    
    // Criar registro de visita
    const visit = await Visit.create({
      user_id: userId,
      event_id: eventId,
      amacoins_earned: event.amacoins_value,
      visited_at: new Date(),
      status: 'pending'
    });
    
    // Incrementar contador de participantes do evento
    await Event.incrementAttendance(eventId);
    
    return visit;
  }

  /**
   * Obtém lista de participantes de um evento
   * @param {number} eventId - ID do evento
   * @param {number} page - Página atual
   * @param {number} limit - Limite por página
   * @returns {Array} - Lista de participantes
   */
  async getEventAttendees(eventId, page = 1, limit = 10) {
    // Verificar se o evento existe
    const event = await Event.findById(eventId);
    if (!event) {
      throw new NotFoundError('Evento não encontrado');
    }
    
    return Event.getAttendees(eventId, page, limit);
  }

  /**
   * Lista eventos em andamento
   * @returns {Array} - Lista de eventos em andamento
   */
  async getOngoingEvents() {
    return Event.findOngoing();
  }

  /**
   * Cria um novo evento (admin)/**
   * Cria um novo evento (admin)
   * @param {Object} eventData - Dados do evento
   * @returns {Object} - Evento criado
   */
  async createEvent(eventData) {
    return Event.create(eventData);
  }

  /**
   * Atualiza um evento existente (admin)
   * @param {number} eventId - ID do evento
   * @param {Object} eventData - Novos dados do evento
   * @returns {Object} - Evento atualizado
   */
  async updateEvent(eventId, eventData) {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new NotFoundError('Evento não encontrado');
    }
    
    return Event.update(eventId, eventData);
  }

  /**
   * Exclui um evento (admin)
   * @param {number} eventId - ID do evento
   * @returns {boolean} - Sucesso da operação
   */
  async deleteEvent(eventId) {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new NotFoundError('Evento não encontrado');
    }
    
    await Event.delete(eventId);
    return true;
  }

  /**
   * Verifica um código de check-in (admin/parceiro)
   * @param {string} code - Código de verificação
   * @returns {Object} - Dados da visita verificada
   */
  async verifyCheckIn(code) {
    return Visit.verify(code);
  }
}

module.exports = new EventService();