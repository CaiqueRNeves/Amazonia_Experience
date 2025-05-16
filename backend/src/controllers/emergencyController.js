const EmergencyService = require('../models/EmergencyService');
const EmergencyPhrase = require('../models/EmergencyPhrase');
const { NotFoundError, ValidationError } = require('../middleware/error');

// Listar serviços de emergência
exports.getEmergencyServices = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Construir filtros a partir dos query params
    const filters = {};
    
    if (req.query.is_24h === 'true') {
      filters.is24h = true;
    }
    
    if (req.query.language) {
      filters.language = req.query.language;
    }
    
    if (req.query.search) {
      filters.search = req.query.search;
    }
    
    const services = await EmergencyService.findAll(page, limit, filters);
    
    res.json({
      status: 'success',
      data: {
        services,
        pagination: {
          page,
          limit
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Filtrar serviços por tipo
exports.getServicesByType = async (req, res, next) => {
  try {
    const serviceType = req.params.type;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Validar tipo de serviço
    const validTypes = ['hospital', 'pharmacy', 'police', 'fire_department', 'embassy', 'tourist_police'];
    if (!validTypes.includes(serviceType)) {
      throw new ValidationError('Tipo de serviço inválido');
    }
    
    const services = await EmergencyService.findByType(serviceType, page, limit);
    
    res.json({
      status: 'success',
      data: {
        services,
        pagination: {
          page,
          limit
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Encontrar serviços de emergência próximos
exports.getNearbyServices = async (req, res, next) => {
  try {
    const { latitude, longitude, radius, type } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    if (!latitude || !longitude) {
      throw new ValidationError('Latitude e longitude são obrigatórios');
    }
    
    const radiusKm = parseFloat(radius) || 5; // Default: 5km
    
    // Construir filtros
    const filters = {};
    if (type) {
      const validTypes = ['hospital', 'pharmacy', 'police', 'fire_department', 'embassy', 'tourist_police'];
      if (!validTypes.includes(type)) {
        throw new ValidationError('Tipo de serviço inválido');
      }
      filters.serviceType = type;
    }
    
    const nearbyServices = await EmergencyService.findNearby(
      parseFloat(latitude),
      parseFloat(longitude),
      radiusKm,
      page,
      limit,
      filters
    );
    
    res.json({
      status: 'success',
      data: {
        services: nearbyServices,
        pagination: {
          page,
          limit
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obter contatos de emergência por idioma
exports.getContactsByLanguage = async (req, res, next) => {
  try {
    const language = req.params.language;
    
    // Validar idioma
    const validLanguages = ['pt-BR', 'en-US', 'es-ES', 'fr-FR', 'de-DE', 'zh-CN', 'ru-RU'];
    if (!validLanguages.includes(language)) {
      throw new ValidationError('Idioma não suportado');
    }
    
    // Buscar contatos de emergência no idioma solicitado
    const contacts = await EmergencyService.getEmergencyContacts(language);
    
    res.json({
      status: 'success',
      data: {
        contacts
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obter frases de emergência úteis em um idioma específico
exports.getPhrasesByLanguage = async (req, res, next) => {
  try {
    const language = req.params.language;
    
    // Validar idioma
    const validLanguages = ['pt-BR', 'en-US', 'es-ES', 'fr-FR', 'de-DE', 'zh-CN', 'ru-RU'];
    if (!validLanguages.includes(language)) {
      throw new ValidationError('Idioma não suportado');
    }
    
    // Buscar frases de emergência no idioma solicitado
    const phrases = await EmergencyPhrase.findByLanguage(language);
    
    res.json({
      status: 'success',
      data: {
        phrases
      }
    });
  } catch (error) {
    next(error);
  }
};