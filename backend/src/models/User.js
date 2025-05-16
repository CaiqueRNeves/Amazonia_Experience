const db = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  // Métodos de busca
  static findById(id) {
    return db('users').where({ id }).first();
  }

  static findByEmail(email) {
    return db('users').where({ email }).first();
  }

  static findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return db('users')
      .select('id', 'name', 'email', 'role', 'nationality', 'amacoins', 'quiz_points', 'created_at')
      .limit(limit)
      .offset(offset)
      .orderBy('name');
  }

  // Criação de usuário
  static async create(userData) {
    const { password, ...otherData } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [id] = await db('users').insert({
      ...otherData,
      password: hashedPassword
    });

    return this.findById(id);
  }

  // Atualização de usuário
  static async update(id, userData) {
    // Se houver uma senha no userData, deve ser hasheada
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    await db('users').where({ id }).update(userData);
    return this.findById(id);
  }

  // Adicionar ou remover AmaCoins
  static async updateAmacoins(id, amount) {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const newBalance = Math.max(0, user.amacoins + amount); // Não permitir saldo negativo
    await db('users').where({ id }).update({ amacoins: newBalance });
    return newBalance;
  }

  // Verifica senha
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Deleção (soft delete seria recomendado em produção)
  static delete(id) {
    return db('users').where({ id }).del();
  }

  // Buscar histórico de visitas de um usuário
  static async getVisitHistory(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    return db('visits')
      .where({ user_id: userId })
      .join('places', 'visits.place_id', '=', 'places.id')
      .leftJoin('events', 'visits.event_id', '=', 'events.id')
      .select(
        'visits.id',
        'visits.visited_at',
        'visits.amacoins_earned',
        'visits.status',
        'places.name as place_name',
        'events.name as event_name'
      )
      .limit(limit)
      .offset(offset)
      .orderBy('visits.visited_at', 'desc');
  }

  // Buscar recompensas resgatadas por um usuário
  static async getRedemptionHistory(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    return db('redemptions')
      .where({ user_id: userId })
      .join('rewards', 'redemptions.reward_id', '=', 'rewards.id')
      .select(
        'redemptions.id',
        'redemptions.redeemed_at',
        'redemptions.amacoins_spent',
        'redemptions.status',
        'rewards.name',
        'rewards.reward_type'
      )
      .limit(limit)
      .offset(offset)
      .orderBy('redemptions.redeemed_at', 'desc');
  }

  // Buscar alertas de um usuário
  static async getAlerts(userId, page = 1, limit = 10, includeRead = false) {
    const offset = (page - 1) * limit;
    
    let query = db('user_alerts')
      .where({ user_id: userId });
    
    if (!includeRead) {
      query = query.where({ is_read: false });
    }
    
    return query
      .select('*')
      .limit(limit)
      .offset(offset)
      .orderBy('scheduled_for', 'desc');
  }

  // Atualizar preferências de notificação
  static async updateNotificationPreferences(userId, preferences) {
    await db('users')
      .where({ id: userId })
      .update({ notification_preferences: JSON.stringify(preferences) });
      
    return this.findById(userId);
  }
}

module.exports = User;