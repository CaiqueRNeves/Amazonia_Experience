import db from '../config/database.js';

class Reward {
  // Métodos de busca
  static findById(id) {
    return db('rewards').where({ id }).first();
  }

  static findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    
    let query = db('rewards');
    
    // Aplicar filtros se fornecidos
    if (filters.reward_type) {
      if (Array.isArray(filters.reward_type)) {
        query = query.whereIn('reward_type', filters.reward_type);
      } else {
        query = query.where('reward_type', filters.reward_type);
      }
    }
    
    if (filters.partner_id) {
      query = query.where('partner_id', filters.partner_id);
    }
    
    if (filters.max_cost) {
      query = query.where('amacoins_cost', '<=', filters.max_cost);
    }
    
    if (filters.in_stock === true) {
      query = query.where('stock', '>', 0);
    }
    
    if (filters.search) {
      query = query.whereRaw('LOWER(name) LIKE ?', [`%${filters.search.toLowerCase()}%`])
        .orWhereRaw('LOWER(description) LIKE ?', [`%${filters.search.toLowerCase()}%`]);
    }
    
    return query
      .select('*')
      .limit(limit)
      .offset(offset)
      .orderBy('amacoins_cost');
  }

  // Criar recompensa
  static async create(rewardData) {
    const [id] = await db('rewards').insert(rewardData);
    return this.findById(id);
  }

  // Atualizar recompensa
  static async update(id, rewardData) {
    await db('rewards').where({ id }).update(rewardData);
    return this.findById(id);
  }

  // Decrementar estoque
  static async decrementStock(id, amount = 1) {
    const reward = await this.findById(id);
    if (!reward) {
      throw new Error('Recompensa não encontrada');
    }

    if (reward.stock < amount) {
      throw new Error('Estoque insuficiente');
    }

    const newStock = reward.stock - amount;
    await db('rewards').where({ id }).update({ stock: newStock });
    return newStock;
  }

  // Excluir recompensa
  static delete(id) {
    return db('rewards').where({ id }).del();
  }

  // Encontrar recompensas por parceiro
  static findByPartnerId(partnerId) {
    return db('rewards').where({ partner_id: partnerId });
  }

  // Filtrar por tipo de recompensa
  static findByType(type) {
    return db('rewards').where({ reward_type: type });
  }

  // Encontrar recompensas expiradas
  static findExpired() {
    const now = new Date();
    return db('rewards')
      .whereNotNull('expiration_date')
      .where('expiration_date', '<', now);
  }
}

export default Reward;