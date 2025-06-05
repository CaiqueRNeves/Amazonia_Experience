import EmergencyService from '../models/EmergencyService.js';
import EmergencyPhrase from '../models/EmergencyPhrase.js';
import { NotFoundError, ValidationError } from '../middleware/error.js';

// Listar serviços de emergência
export const getEmergencyServices = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
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

// Listar serviços por tipo
export const getServicesByType = async (req, res, next) => {
  try {
    const { type } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const services = await EmergencyService.findByType(type, page, limit);
    
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

// Listar serviços próximos
export const getNearbyServices = async (req, res, next) => {
  try {
    const { latitude, longitude, radius } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    if (!latitude || !longitude) {
      throw new ValidationError('Latitude e longitude são obrigatórios');
    }
    
    const radiusKm = parseFloat(radius) || 5;
    const filters = {};
    
    if (req.query.service_type) {
      filters.serviceType = req.query.service_type;
    }
    
    const services = await EmergencyService.findNearby(
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

// Obter contatos por idioma
export const getContactsByLanguage = async (req, res, next) => {
  try {
    const { language } = req.params;
    
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

// Obter frases por idioma
export const getPhrasesByLanguage = async (req, res, next) => {
  try {
    const { language } = req.params;
    
    const validLanguages = ['pt-BR', 'en-US', 'es-ES', 'fr-FR', 'de-DE', 'zh-CN', 'ru-RU'];
    if (!validLanguages.includes(language)) {
      throw new ValidationError('Idioma não suportado');
    }
    
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
