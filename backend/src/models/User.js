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
    const hashedPassword = await bcrypt.hash(password, 12); // Aumentado para 12 rounds

    const [id] = await db('users').insert({
      ...otherData,
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date()
    });

    return this.findById(id);
  }

  // Atualização de usuário
  static async update(id, userData) {
    // Se houver uma senha no userData, deve ser hasheada
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 12);
    }

    userData.updated_at = new Date();

    await db('users').where({ id }).update(userData);
    return this.findById(id);
  }

  // CORREÇÃO: Método transacional para atualizar AmaCoins
  static async updateAmacoins(id, amount) {
    const trx = await db.transaction();
    
    try {
      // Buscar usuário com lock para evitar condições de corrida
      const user = await trx('users')
        .where({ id })
        .forUpdate()
        .first();
        
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      const newBalance = Math.max(0, user.amacoins + amount);
      
      // Atualizar saldo
      await trx('users')
        .where({ id })
        .update({ 
          amacoins: newBalance,
          updated_at: new Date()
        });

      // Registrar transação para auditoria
      await trx('amacoin_transactions').insert({
        user_id: id,
        amount,
        previous_balance: user.amacoins,
        new_balance: newBalance,
        transaction_type: amount > 0 ? 'credit' : 'debit',
        created_at: new Date()
      });

      await trx.commit();
      return newBalance;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  // Método seguro para transferir AmaCoins entre usuários
  static async transferAmacoins(fromUserId, toUserId, amount, description = '') {
    if (amount <= 0) {
      throw new Error('Valor de transferência deve ser positivo');
    }

    const trx = await db.transaction();
    
    try {
      // Buscar usuários com lock
      const fromUser = await trx('users')
        .where({ id: fromUserId })
        .forUpdate()
        .first();
        
      const toUser = await trx('users')
        .where({ id: toUserId })
        .forUpdate()
        .first();

      if (!fromUser || !toUser) {
        throw new Error('Usuário não encontrado');
      }

      if (fromUser.amacoins < amount) {
        throw new Error('Saldo insuficiente');
      }

      // Atualizar saldos
      await trx('users')
        .where({ id: fromUserId })
        .update({ 
          amacoins: fromUser.amacoins - amount,
          updated_at: new Date()
        });

      await trx('users')
        .where({ id: toUserId })
        .update({ 
          amacoins: toUser.amacoins + amount,
          updated_at: new Date()
        });

      // Registrar transações
      await trx('amacoin_transactions').insert([
        {
          user_id: fromUserId,
          amount: -amount,
          previous_balance: fromUser.amacoins,
          new_balance: fromUser.amacoins - amount,
          transaction_type: 'transfer_out',
          related_user_id: toUserId,
          description,
          created_at: new Date()
        },
        {
          user_id: toUserId,
          amount: amount,
          previous_balance: toUser.amacoins,
          new_balance: toUser.amacoins + amount,
          transaction_type: 'transfer_in',
          related_user_id: fromUserId,
          description,
          created_at: new Date()
        }
      ]);

      await trx.commit();
      
      return {
        fromUserBalance: fromUser.amacoins - amount,
        toUserBalance: toUser.amacoins + amount
      };
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  // Verifica senha com proteção contra timing attacks
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      // Log do erro mas retorna false para não vazar informações
      console.error('Erro na verificação de senha:', error);
      return false;
    }
  }

  // Deleção (soft delete recomendado)
  static async delete(id) {
    // Soft delete - marca como deletado mas mantém dados
    await db('users').where({ id }).update({ 
      deleted_at: new Date(),
      updated_at: new Date()
    });
    return true;
  }

  // Hard delete (apenas para uso administrativo)
  static async hardDelete(id) {
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
      .orderBy('created_at', 'desc');
  }

  // Atualizar preferências de notificação
  static async updateNotificationPreferences(userId, preferences) {
    await db('users')
      .where({ id: userId })
      .update({ 
        notification_preferences: JSON.stringify(preferences),
        updated_at: new Date()
      });
      
    return this.findById(userId);
  }

  // Obter estatísticas do usuário
  static async getUserStats(userId) {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const stats = await db.raw(`
      SELECT 
        (SELECT COUNT(*) FROM visits WHERE user_id = ? AND status = 'verified') as total_visits,
        (SELECT COUNT(*) FROM quiz_attempts WHERE user_id = ? AND status = 'completed') as completed_quizzes,
        (SELECT COUNT(*) FROM redemptions WHERE user_id = ?) as total_redemptions,
        (SELECT SUM(amacoins_earned) FROM visits WHERE user_id = ? AND status = 'verified') as total_amacoins_earned,
        (SELECT SUM(amacoins_spent) FROM redemptions WHERE user_id = ?) as total_amacoins_spent
    `, [userId, userId, userId, userId, userId]);

    return {
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        amacoins: user.amacoins,
        quiz_points: user.quiz_points
      },
      statistics: stats[0]
    };
  }

  // Verificar se usuário está ativo (não deletado)
  static async isActive(userId) {
    const user = await db('users')
      .where({ id: userId })
      .whereNull('deleted_at')
      .first();
    
    return !!user;
  }
}

module.exports = User;