const Place = require('../models/Place');
const Visit = require('../models/Visit');
const { NotFoundError, ValidationError } = require('../middleware/error');

// Listar locais
exports.getPlaces = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Construir filtros a partir dos query params
    const filters = {};
    
    if (req.query.type) {
      filters.type = req.query.type;
    }
    
    if (req.query.partner_id) {
      filters.partnerId = parseInt(req.query.partner_id);
    }
    
    if (req.query.wifi === 'true') {
      filters.wifiAvailable = true;
    }
    
    if (req.query.search) {
      filters.search = req.query.search;
    }
    
    const places = await Place.findAll(page, limit, filters);
    
    res.json({
      status: 'success',
      data: {
        places,
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

// Obter detalhes de um local
exports.getPlace = async (req, res, next) => {
  try {
    const placeId = req.params.id;
    const place = await Place.findById(placeId);
    
    if (!place) {
      throw new NotFoundError('Local não encontrado');
    }
    
    res.json({
      status: 'success',
      data: {
        place
      }
    });
  } catch (error) {
    next(error);
  }
};

// Listar locais próximos (geolocalização)
exports.getNearbyPlaces = async (req, res, next) => {
  try {
    const { latitude, longitude, radius } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    if (!latitude || !longitude) {
      throw new ValidationError('Latitude e longitude são obrigatórios');
    }
    
    const radiusKm = parseFloat(radius) || 5; // Default: 5km
    
    const nearbyPlaces = await Place.findNearby(
      parseFloat(latitude),
      parseFloat(longitude),
      radiusKm,
      page,
      limit
    );
    
    res.json({
      status: 'success',
      data: {
        places: nearbyPlaces,
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

// Realizar check-in em um local
exports.checkIn = async (req, res, next) => {
  try {
    const { place_id } = req.body;
    const user_id = req.user.id;
    
    // Verificar se o local existe
    const place = await Place.findById(place_id);
    if (!place) {
      throw new NotFoundError('Local não encontrado');
    }
    
    // Verificar se o usuário já fez check-in neste local hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingVisits = await Visit.getByPlaceId(place_id);
    const userVisitedToday = existingVisits.some(visit => {
      const visitDate = new Date(visit.visited_at);
      visitDate.setHours(0, 0, 0, 0);
      
      return visit.user_id === user_id && 
        ['verified', 'pending'].includes(visit.status) &&
        visitDate.getTime() === today.getTime();
    });
    
    if (userVisitedToday) {
      throw new ValidationError('Você já realizou check-in neste local hoje');
    }
    
    // Criar registro de visita
    const visit = await Visit.create({
      user_id,
      place_id,
      amacoins_earned: place.amacoins_value,
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