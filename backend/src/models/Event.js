import db from '../config/database.js';

class Event {
  // Métodos de busca
  static findById(id) {
    return db('events').where({ id }).first();
  }

  static findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    
    let query = db('events');
    
    // Aplicar filtros se fornecidos
    if (filters.eventType) {
      query = query.where('event_type', filters.eventType);
    }
    
    if (filters.isFeatured) {
      query = query.where('is_featured', true);
    }
    
    if (filters.startDate) {
      query = query.where('start_time', '>=', filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.where('end_time', '<=', filters.endDate);
    }
    
    if (filters.search) {
      query = query.whereRaw('LOWER(name) LIKE ?', [`%${filters.search.toLowerCase()}%`])
        .orWhereRaw('LOWER(description) LIKE ?', [`%${filters.search.toLowerCase()}%`]);
    }
    
    return query
      .select('*')
      .limit(limit)
      .offset(offset)
      .orderBy('start_time');
  }

  // Buscar eventos próximos por geolocalização
  static async findNearby(latitude, longitude, radiusKm = 5, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    // Fórmula de Haversine para cálculo de distância entre coordenadas
    // Consulta adaptada para SQLite que não possui funções geoespaciais nativas
    return db('events')
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

  // Buscar eventos que estão ocorrendo agora
  static findOngoing() {
    const now = new Date();
    return db('events')
      .where('start_time', '<=', now)
      .where('end_time', '>=', now)
      .orderBy('end_time');
  }

  // Criar evento
  static async create(eventData) {
    const [id] = await db('events').insert(eventData);
    return this.findById(id);
  }

  // Atualizar evento
  static async update(id, eventData) {
    await db('events').where({ id }).update(eventData);
    return this.findById(id);
  }

  // Excluir evento
  static delete(id) {
    return db('events').where({ id }).del();
  }

  // Incrementar contador de participantes
  static async incrementAttendance(id) {
    const event = await this.findById(id);
    if (!event) {
      throw new Error('Evento não encontrado');
    }

    const newAttendance = event.current_attendance + 1;
    
    // Verificar se já atingiu a capacidade máxima
    if (event.max_capacity && newAttendance > event.max_capacity) {
      throw new Error('Evento já atingiu capacidade máxima');
    }

    await db('events').where({ id }).update({ current_attendance: newAttendance });
    return newAttendance;
  }

  // Buscar participantes de um evento
  static async getAttendees(eventId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    return db('visits')
      .where({ event_id: eventId, status: 'verified' })
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
}

export default Event;