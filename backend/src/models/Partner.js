import db from '../config/database.js';

class Partner {
  // Métodos de busca
  static findById(id) {
    return db('partners').where({ id }).first();
  }

  static findByUserId(userId) {
    return db('partners').where({ user_id: userId }).first();
  }

  static findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    
    let query = db('partners')
      .join('users', 'partners.user_id', '=', 'users.id')
      .select(
        'partners.*',
        'users.name as user_name',
        'users.email as user_email'
      );
    
    // Aplicar filtros se fornecidos
    if (filters.business_type) {
      query = query.where('partners.business_type', filters.business_type);
    }
    
    if (filters.search) {
      query = query.whereRaw('LOWER(partners.business_name) LIKE ?', [`%${filters.search.toLowerCase()}%`]);
    }
    
    return query
      .limit(limit)
      .offset(offset)
      .orderBy('partners.business_name');
  }

  // Criar parceiro
  static async create(partnerData) {
    const [id] = await db('partners').insert(partnerData);
    return this.findById(id);
  }

  // Atualizar parceiro
  static async update(id, partnerData) {
    await db('partners').where({ id }).update(partnerData);
    return this.findById(id);
  }

  // Excluir parceiro
  static delete(id) {
    return db('partners').where({ id }).del();
  }

  // Buscar recompensas do parceiro
  static async getRewards(partnerId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    return db('rewards')
      .where({ partner_id: partnerId })
      .limit(limit)
      .offset(offset)
      .orderBy('amacoins_cost');
  }

  // Verificar código de visita (parceiros)
  static async verifyVisitCode(userId, code) {
    // Buscar informações do parceiro
    const partner = await this.findByUserId(userId);
    if (!partner) {
      throw new Error('Usuário não é um parceiro');
    }
    
    // Buscar locais do parceiro
    const partnerPlaces = await db('places').where({ partner_id: partner.id }).select('id');
    const placeIds = partnerPlaces.map(place => place.id);
    
    // Verificar se o código pertence a uma visita em algum dos locais do parceiro
    const visit = await db('visits')
      .whereIn('place_id', placeIds)
      .where({ verification_code: code, status: 'pending' })
      .first();
    
    if (!visit) {
      throw new Error('Código de verificação inválido ou não pertence a este parceiro');
    }
    
    // Atualizar status da visita
    await db('visits')
      .where({ id: visit.id })
      .update({ status: 'verified' });
    
    // Creditar AmaCoins ao usuário
    await db('users')
      .where({ id: visit.user_id })
      .increment('amacoins', visit.amacoins_earned);
    
    return {
      visit_id: visit.id,
      user_id: visit.user_id,
      place_id: visit.place_id,
      amacoins_earned: visit.amacoins_earned,
      verified_at: new Date()
    };
  }
}

export default Partner;