const db = require('../config/database');
const { NotFoundError, ValidationError } = require('../middleware/error');

class EmergencyService {
  /**
   * Obtém um serviço de emergência por ID
   */
  static findById(id) {
    return db('emergency_services').where({ id }).first();
  }

  /**
   * Lista serviços de emergência
   */
  static findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let query = db('emergency_services');
    
    // Aplicar filtros
    if (filters.is24h) {
      query = query.where('is_24h', true);
    }
    
    if (filters.language) {
      query = query.whereRaw('languages_spoken LIKE ?', [`%${filters.language}%`]);
    }
    
    if (filters.search) {
      query = query.whereRaw('LOWER(name) LIKE ?', [`%${filters.search.toLowerCase()}%`])
        .orWhereRaw('LOWER(address) LIKE ?', [`%${filters.search.toLowerCase()}%`]);
    }
    
    return query
      .select('*')
      .limit(limit)
      .offset(offset)
      .orderBy('name');
  }

  /**
   * Lista serviços de emergência por tipo
   */
  static findByType(serviceType, page = 1, limit = 10) {
    // Validar tipo de serviço
    const validTypes = ['hospital', 'pharmacy', 'police', 'fire_department', 'embassy', 'tourist_police'];
    if (!validTypes.includes(serviceType)) {
      throw new ValidationError('Tipo de serviço inválido');
    }
    
    const offset = (page - 1) * limit;
    
    return db('emergency_services')
      .where({ service_type: serviceType })
      .select('*')
      .limit(limit)
      .offset(offset)
      .orderBy('name');
  }

  /**
   * Lista serviços de emergência próximos por geolocalização
   */
  static async findNearby(latitude, longitude, radius = 5, page = 1, limit = 10, filters = {}) {
    if (!latitude || !longitude) {
      throw new ValidationError('Latitude e longitude são obrigatórios');
    }
    
    const offset = (page - 1) * limit;
    
    let query = db('emergency_services')
      .select('*')
      .select(db.raw(`
        (6371 * acos(cos(radians(?)) * 
        cos(radians(latitude)) * 
        cos(radians(longitude) - 
        radians(?)) + 
        sin(radians(?)) * 
        sin(radians(latitude)))) AS distance
      `, [latitude, longitude, latitude]))
      .having('distance', '<', radius);
    
    // Aplicar filtros adicionais
    if (filters.serviceType) {
      query = query.where('service_type', filters.serviceType);
    }
    
    return query
      .orderBy('distance')
      .limit(limit)
      .offset(offset);
  }

  /**
   * Obtém contatos de emergência por idioma
   */
  static async getEmergencyContacts(language) {
    // Validar idioma
    const validLanguages = ['pt-BR', 'en-US', 'es-ES', 'fr-FR', 'de-DE', 'zh-CN', 'ru-RU'];
    if (!validLanguages.includes(language)) {
      throw new ValidationError('Idioma não suportado');
    }
    
    // Buscar contatos de emergência no idioma solicitado
    const contacts = await db('emergency_contacts')
      .where({ language })
      .first();
    
    // Se não existir no idioma solicitado, retornar em inglês
    if (!contacts && language !== 'en-US') {
      return this.getEmergencyContacts('en-US');
    }
    
    return contacts;
  }

  /**
   * Adiciona um novo serviço de emergência
   */
  static async create(serviceData) {
    // Validar tipo de serviço
    const validTypes = ['hospital', 'pharmacy', 'police', 'fire_department', 'embassy', 'tourist_police'];
    if (!validTypes.includes(serviceData.service_type)) {
      throw new ValidationError('Tipo de serviço inválido');
    }
    
    // Converter array de idiomas para JSON, se necessário
    if (Array.isArray(serviceData.languages_spoken)) {
      serviceData.languages_spoken = JSON.stringify(serviceData.languages_spoken);
    }
    
    const [id] = await db('emergency_services').insert(serviceData);
    return this.findById(id);
  }

  /**
   * Atualiza um serviço de emergência
   */
  static async update(serviceId, serviceData) {
    const service = await this.findById(serviceId);
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
    
    await db('emergency_services').where({ id: serviceId }).update(serviceData);
    return this.findById(serviceId);
  }

  /**
   * Remove um serviço de emergência
   */
  static async delete(serviceId) {
    const service = await this.findById(serviceId);
    if (!service) {
      throw new NotFoundError('Serviço de emergência não encontrado');
    }
    
    await db('emergency_services').where({ id: serviceId }).del();
    return true;
  }
}

module.exports = EmergencyService;
