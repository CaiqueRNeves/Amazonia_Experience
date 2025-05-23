const Event = require('../models/Event');
const Visit = require('../models/Visit');
const { NotFoundError, ValidationError } = require('../middleware/error');

// Listar eventos
exports.getEvents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Construir filtros a partir dos query params
    const filters = {};
    
    if (req.query.event_type) {
      filters.eventType = req.query.event_type;
    }
    
    if (req.query.featured === 'true') {
      filters.isFeatured = true;
    }
    
    if (req.query.start_date) {
      filters.startDate = new Date(req.query.start_date);
    }
    
    if (req.query.end_date) {
      filters.endDate = new Date(req.query.end_date);
    }
    
    if (req.query.search) {
      filters.search = req.query.search;
    }
    
    const events = await Event.findAll(page, limit, filters);
    
    res.json({
      status: 'success',
      data: {
        events,
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

// Obter detalhes de um evento
exports.getEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    
    if (!event) {
      throw new NotFoundError('Evento não encontrado');
    }
    
    res.json({
      status: 'success',
      data: {
        event
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obter eventos em andamento
exports.getOngoingEvents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const ongoingEvents = await Event.findOngoing();
    
    res.json({
      status: 'success',
      data: {
        events: ongoingEvents,
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

// Listar eventos próximos (geolocalização)
exports.getNearbyEvents = async (req, res, next) => {
  try {
    const { latitude, longitude, radius } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    if (!latitude || !longitude) {
      throw new ValidationError('Latitude e longitude são obrigatórios');
    }
    
    const radiusKm = parseFloat(radius) || 5; // Default: 5km
    
    const nearbyEvents = await Event.findNearby(
      parseFloat(latitude),
      parseFloat(longitude),
      radiusKm,
      page,
      limit
    );
    
    res.json({
      status: 'success',
      data: {
        events: nearbyEvents,
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

// Realizar check-in em um evento
exports.checkIn = async (req, res, next) => {
  try {
    const { event_id } = req.body;
    const user_id = req.user.id;
    
    // Verificar se o evento existe
    const event = await Event.findById(event_id);
    if (!event) {
      throw new NotFoundError('Evento não encontrado');
    }
    
    // Verificar se o evento já atingiu capacidade máxima
    if (event.max_capacity && event.current_attendance >= event.max_capacity) {
      throw new ValidationError('Evento já atingiu capacidade máxima');
    }
    
    // Verificar se o usuário já fez check-in neste evento
    const existingVisits = await Visit.getByEventId(event_id);
    const userAlreadyCheckedIn = existingVisits.some(visit => 
      visit.user_id === user_id && ['verified', 'pending'].includes(visit.status)
    );
    
    if (userAlreadyCheckedIn) {
      throw new ValidationError('Você já realizou check-in neste evento');
    }
    
    // Criar registro de visita
    const visit = await Visit.create({
      user_id,
      event_id,
      amacoins_earned: event.amacoins_value,
      visited_at: new Date()
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        visit,
        verification_code: visit.verification_code
      }
    });
  } catch (error) {
    next(error);
  }
};