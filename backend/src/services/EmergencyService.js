const EmergencyService = require('../models/EmergencyService');
const EmergencyPhrase = require('../models/EmergencyPhrase');
const { NotFoundError, ValidationError } = require('../middleware/error');

/**
 * Serviço responsável por operações relacionadas a serviços de emergência
 */
class EmergencyServiceClass {
  /**
   * Lista serviços de emergência
   * @param {number} page - Página atual
   * @param {number} limit - Limite por página
   * @param {Object} filters - Filtros para a busca
   * @returns {Array} - Lista de serviços de emergência
   */
  async getEmergencyServices(page = 1, limit = 10, filters = {}) {
    return EmergencyService.findAll(page, limit, filters);
  }

  /**
   * Lista serviços de emergência por tipo
   * @param {string} serviceType - Tipo de serviço
   * @param {number} page - Página atual
   * @param {number} limit - Limite por página
   * @returns {Array} - Lista de serviços de emergência do tipo especificado
   */
  async getServicesByType(serviceType, page = 1, limit = 10) {
    // Validar tipo de serviço
    const validTypes = ['hospital', 'pharmacy', 'police', 'fire_department', 'embassy', 'tourist_police'];
    if (!validTypes.includes(serviceType)) {
      throw new ValidationError('Tipo de serviço inválido');
    }
    
    return EmergencyService.findByType(serviceType, page, limit);
  }

  /**
   * Lista serviços de emergência próximos por geolocalização
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} radius - Raio de busca em km
   * @param {number} page - Página atual
   * @param {number} limit - Limite por página
   * @param {Object} filters - Filtros adicionais
   * @returns {Array} - Lista de serviços de emergência próximos
   */
  async getNearbyServices(latitude, longitude, radius = 5, page = 1, limit = 10, filters = {}) {
    if (!latitude || !longitude) {
      throw new ValidationError('Latitude e longitude são obrigatórios');
    }
    
    return EmergencyService.findNearby(
      parseFloat(latitude),
      parseFloat(longitude),
      radius,
      page,
      limit,
      filters
    );
  }

  /**
   * Obtém contatos de emergência por idioma
   * @param {string} language - Código do idioma
   * @returns {Object} - Contatos de emergência
   */
  async getContactsByLanguage(language) {
    // Validar idioma
    const validLanguages = ['pt-BR', 'en-US', 'es-ES', 'fr-FR', 'de-DE', 'zh-CN', 'ru-RU'];
    if (!validLanguages.includes(language)) {
      throw new ValidationError('Idioma não suportado');
    }
    
    return EmergencyService.getEmergencyContacts(language);
  }

  /**
   * Obtém frases de emergência úteis em um idioma específico
   * @param {string} language - Código do idioma
   * @returns {Object} - Frases de emergência agrupadas por categoria
   */
  async getPhrasesByLanguage(language) {
    // Validar idioma
    const validLanguages = ['pt-BR', 'en-US', 'es-ES', 'fr-FR', 'de-DE', 'zh-CN', 'ru-RU'];
    if (!validLanguages.includes(language)) {
      throw new ValidationError('Idioma não suportado');
    }
    
    return EmergencyPhrase.findByLanguage(language);
  }

  /**
   * Adiciona um novo serviço de emergência (admin)
   * @param {Object} serviceData - Dados do serviço
   * @returns {Object} - Serviço criado
   */
  async addEmergencyService(serviceData) {
    // Validar tipo de serviço
    const validTypes = ['hospital', 'pharmacy', 'police', 'fire_department', 'embassy', 'tourist_police'];
    if (!validTypes.includes(serviceData.service_type)) {
      throw new ValidationError('Tipo de serviço inválido');
    }
    
    // Converter array de idiomas para JSON, se necessário
    if (Array.isArray(serviceData.languages_spoken)) {
      serviceData.languages_spoken = JSON.stringify(serviceData.languages_spoken);
    }
    
    return EmergencyService.create(serviceData);
  }

  /**
   * Atualiza um serviço de emergência (admin)
   * @param {number} serviceId - ID do serviço
   * @param {Object} serviceData - Novos dados do serviço
   * @returns {Object} - Serviço atualizado
   */
  async updateEmergencyService(serviceId, serviceData) {
    const service = await EmergencyService.findById(serviceId);
    if (!service) {
      throw new NotFoundError('Serviço de emergência não encontrado');
    }
    
    // Validar tipo de serviço, se fornecido
    if (serviceData.service_type) {
      const validTypes = ['hospital', 'pharmacy', 'police', 'fire_department', 'embassy', 'tourist_police'];
      if (!validTypes.includes(serviceData.service_type)) {
        throw new ValidationError('Tipo de serviço inválido');
      }
    }
    
    // Converter array de idiomas para JSON, se necessário
    if (Array.isArray(serviceData.languages_spoken)) {
      serviceData.languages_spoken = JSON.stringify(serviceData.languages_spoken);
    }
    
    return EmergencyService.update(serviceId, serviceData);
  }

  /**
   * Remove um serviço de emergência (admin)
   * @param {number} serviceId - ID do serviço
   * @returns {boolean} - Sucesso da operação
   */
  async removeEmergencyService(serviceId) {
    const service = await EmergencyService.findById(serviceId);
    if (!service) {
      throw new NotFoundError('Serviço de emergência não encontrado');
    }
    
    await db('emergency_services').where({ id: serviceId }).del();
    
    return true;
  }
}

module.exports = new EmergencyServiceClass();