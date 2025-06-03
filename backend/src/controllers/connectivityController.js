const ConnectivitySpot = require('../models/ConnectivitySpot');
const ConnectivityReport = require('../models/ConnectivityReport');
const { NotFoundError, ValidationError } = require('../middleware/error');

// Listar pontos de conectividade
exports.getConnectivitySpots = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // CORREÇÃO: Padronização consistente em snake_case
    const filters = {};
    
    if (req.query.is_free === 'true') {
      filters.is_free = true;
    }
    
    if (req.query.wifi_speed) {
      filters.wifi_speed = req.query.wifi_speed;
    }
    
    if (req.query.is_verified === 'true') {
      filters.is_verified = true;
    }
    
    if (req.query.search) {
      filters.search = req.query.search;
    }
    
    const spots = await ConnectivitySpot.findAll(page, limit, filters);
    
    res.json({
      status: 'success',
      data: {
        spots,
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

// Listar pontos de conectividade próximos (geolocalização)
exports.getNearbySpots = async (req, res, next) => {
  try {
    const { latitude, longitude, radius } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    if (!latitude || !longitude) {
      throw new ValidationError('Latitude e longitude são obrigatórios');
    }
    
    const radiusKm = parseFloat(radius) || 5; // Default: 5km
    
    const nearbySpots = await ConnectivitySpot.findNearby(
      parseFloat(latitude),
      parseFloat(longitude),
      radiusKm,
      page,
      limit
    );
    
    res.json({
      status: 'success',
      data: {
        spots: nearbySpots,
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

// Reportar informação sobre ponto de conectividade
exports.reportSpot = async (req, res, next) => {
  try {
    const spotId = req.params.id;
    const userId = req.user.id;
    const { wifi_speed, wifi_reliability, is_working, comment } = req.body;
    
    // Verificar se o ponto de conectividade existe
    const spot = await ConnectivitySpot.findById(spotId);
    if (!spot) {
      throw new NotFoundError('Ponto de conectividade não encontrado');
    }
    
    // CORREÇÃO: Validação de entrada melhorada
    const sanitizedComment = comment ? comment.substring(0, 500) : null;
    
    // Criar relatório
    const report = await ConnectivityReport.create({
      user_id: userId,
      spot_id: spotId,
      wifi_speed,
      wifi_reliability,
      is_working,
      comment: sanitizedComment,
      reported_at: new Date()
    });
    
    // Atualizar métricas do ponto com base nos relatórios
    await ConnectivitySpot.updateMetrics(spotId);
    
    res.status(201).json({
      status: 'success',
      data: {
        report
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obter mapa de calor de qualidade de sinal
exports.getHeatmap = async (req, res, next) => {
  try {
    // Buscar todos os pontos com métricas
    const spots = await ConnectivitySpot.findAll(1, 1000, { include_reports: true });
    
    // Formatar dados para mapa de calor
    const heatmapData = spots.map(spot => ({
      latitude: spot.latitude,
      longitude: spot.longitude,
      intensity: spot.avg_signal_strength || 0, // Escala de 0 a 10
      name: spot.name,
      is_free: spot.is_free,
      wifi_speed: spot.wifi_speed,
      working_percentage: spot.working_percentage || 0
    }));
    
    res.json({
      status: 'success',
      data: {
        heatmap: heatmapData
      }
    });
  } catch (error) {
    next(error);
  }
};