const db = require('../config/database');

class Place {
  // Métodos de busca
  static findById(id) {
    return db('places').where({ id }).first();
  }

  static findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    
    let query = db('places');
    
    // Aplicar filtros se fornecidos
    if (filters.type) {
      query = query.where('type', filters.type);
    }
    
    if (filters.partnerId) {
      query = query.where('partner_id', filters.partnerId);
    }
    
    if (filters.wifiAvailable) {
      query = query.where('wifi_available', true);
    }
    
    if (filters.search) {
      query = query.whereRaw('LOWER(name) LIKE ?', [`%${filters.search.toLowerCase()}%`])
        .orWhereRaw('LOWER(description) LIKE ?', [`%${filters.search.toLowerCase()}%`]);
    }
    
    return query
      .select('*')
      .limit(limit)
      .offset(offset)
      .orderBy('name');
  }

  // Buscar locais próximos por geolocalização
  static async findNearby(latitude, longitude, radiusKm = 5, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    // Fórmula de Haversine para cálculo de distância entre coordenadas
    // Consulta adaptada para SQLite que não possui funções geoespaciais nativas
    return db('places')
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

  // Criar local
  static async create(placeData) {
    const [id] = await db('places').insert(placeData);
    return this.findById(id);
  }

  // Atualizar local
  static async update(id, placeData) {
    await db('places').where({ id }).update(placeData);
    return this.findById(id);
  }

  // Excluir local
  static delete(id) {
    return db('places').where({ id }).del();
  }

  // Buscar visitantes de um local
  static async getVisitors(placeId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    return db('visits')
      .where({ place_id: placeId, status: 'verified' })
      .join('users', 'visits.user_id', '=', 'users.id')
      .select(
        'users.id',
        'users.name',
        'users.nationality',
        'visits.visited_at'
      )
      .limit(limit)
      .offset(offset)
      .orderBy('visits.visited_at', 'desc');
  }

  // Encontrar locais por parceiro
  static findByPartnerId(partnerId) {
    return db('places').where({ partner_id: partnerId });
  }
}

module.exports = Place;