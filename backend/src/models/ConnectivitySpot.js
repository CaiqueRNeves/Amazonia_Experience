import db from '../config/database.js';

class ConnectivitySpot {
  // Métodos de busca
  static findById(id) {
    return db('connectivity_spots').where({ id }).first();
  }

  static findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    
    let query = db('connectivity_spots');
    
    // Aplicar filtros se fornecidos
    if (filters.is_free) {
      query = query.where('is_free', true);
    }
    
    if (filters.wifi_speed) {
      query = query.where('wifi_speed', filters.wifi_speed);
    }
    
    if (filters.is_verified) {
      query = query.where('is_verified', true);
    }
    
    if (filters.search) {
      query = query.whereRaw('LOWER(name) LIKE ?', [`%${filters.search.toLowerCase()}%`]);
    }
    
    // Incluir relatórios recentes, se solicitado
    if (filters.include_reports) {
      query = query
        .leftJoin('connectivity_reports', 'connectivity_spots.id', '=', 'connectivity_reports.spot_id')
        .select(
          'connectivity_spots.*',
          db.raw('AVG(connectivity_reports.wifi_reliability) as avg_signal_strength')
        )
        .groupBy('connectivity_spots.id');
    }
    
    return query
      .limit(limit)
      .offset(offset)
      .orderBy('connectivity_spots.name');
  }

  // Buscar pontos próximos por geolocalização
  static async findNearby(latitude, longitude, radiusKm = 5, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    // Fórmula de Haversine para cálculo de distância entre coordenadas
    return db('connectivity_spots')
      .select('*')
      .select(db.raw(`
        (6371 * acos(cos(radians(?)) * 
        cos(radians(latitude)) * 
        cos(radians(longitude) - 
        radians(?)) + 
        sin(radians(?)) * 
        sin(radians(latitude)))) AS distance
      `, [latitude, longitude, latitude]))
      .having('distance', '<', radiusKm)
      .orderBy('distance')
      .limit(limit)
      .offset(offset);
  }

  // Criar ponto de conectividade
  static async create(spotData) {
    const [id] = await db('connectivity_spots').insert(spotData);
    return this.findById(id);
  }

  // Atualizar ponto de conectividade
  static async update(id, spotData) {
    await db('connectivity_spots').where({ id }).update(spotData);
    return this.findById(id);
  }

  // Atualizar métricas com base em relatórios recentes
  static async updateMetrics(spotId) {
    // Calcular média das últimas métricas (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const metrics = await db('connectivity_reports')
      .where('spot_id', spotId)
      .where('reported_at', '>=', thirtyDaysAgo)
      .select(
        db.raw('AVG(wifi_reliability) as avg_reliability'),
        db.raw('COUNT(DISTINCT user_id) as unique_reporters'),
        db.raw(`
          SUM(CASE WHEN wifi_speed = 'slow' THEN 1 ELSE 0 END) as slow_count,
          SUM(CASE WHEN wifi_speed = 'medium' THEN 1 ELSE 0 END) as medium_count,
          SUM(CASE WHEN wifi_speed = 'fast' THEN 1 ELSE 0 END) as fast_count
        `),
        db.raw('SUM(CASE WHEN is_working = true THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as working_percentage')
      )
      .first();
    
    if (metrics && metrics.unique_reporters > 0) {
      // Determinar velocidade mais reportada
      let predominantSpeed = 'unknown';
      if (metrics.slow_count > metrics.medium_count && metrics.slow_count > metrics.fast_count) {
        predominantSpeed = 'slow';
      } else if (metrics.medium_count > metrics.slow_count && metrics.medium_count > metrics.fast_count) {
        predominantSpeed = 'medium';
      } else if (metrics.fast_count > metrics.slow_count && metrics.fast_count > metrics.medium_count) {
        predominantSpeed = 'fast';
      }
      
      // Atualizar métricas do spot
      await db('connectivity_spots')
        .where({ id: spotId })
        .update({
          wifi_speed: predominantSpeed,
          avg_signal_strength: metrics.avg_reliability,
          working_percentage: metrics.working_percentage,
          last_updated: new Date()
        });
    }
    
    return this.findById(spotId);
  }
}

export default ConnectivitySpot;