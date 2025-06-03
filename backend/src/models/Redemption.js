const db = require('../config/database');
const User = require('./User');
const Reward = require('./Reward');
const { ValidationError } = require('../middleware/error');

class Redemption {
  // Métodos de busca
  static findById(id) {
    return db('redemptions').where({ id }).first();
  }

  // Criar resgate
  static async create(redemptionData) {
    // Verificar se o usuário existe
    const user = await User.findById(redemptionData.user_id);
    if (!user) {
      throw new ValidationError('Usuário não encontrado');
    }

    // Verificar se a recompensa existe
    const reward = await Reward.findById(redemptionData.reward_id);
    if (!reward) {
      throw new ValidationError('Recompensa não encontrada');
    }

    // Verificar se o usuário tem AmaCoins suficientes
    if (user.amacoins < reward.amacoins_cost) {
      throw new ValidationError('Saldo de AmaCoins insuficiente');
    }

    // Verificar estoque
    if (reward.stock <= 0) {
      throw new ValidationError('Recompensa esgotada');
    }

    const [id] = await db('redemptions').insert({
      ...redemptionData,
      redeemed_at: redemptionData.redeemed_at || new Date(),
      status: redemptionData.status || 'pending'
    });

    return this.findById(id);
  }

  // Atualizar status de um resgate
  static async updateStatus(id, status) {
    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      throw new ValidationError('Status inválido');
    }

    await db('redemptions').where({ id }).update({ status });
    return this.findById(id);
  }

  // Listar resgates por usuário
  static getByUserId(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    return db('redemptions')
      .where({ user_id: userId })
      .join('rewards', 'redemptions.reward_id', '=', 'rewards.id')
      .select(
        'redemptions.*',
        'rewards.name as reward_name',
        'rewards.reward_type',
        'rewards.image_url'
      )
      .limit(limit)
      .offset(offset)
      .orderBy('redemptions.redeemed_at', 'desc');
  }

  // Listar resgates por parceiro
  static getByPartnerId(partnerId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    return db('redemptions')
      .join('rewards', 'redemptions.reward_id', '=', 'rewards.id')
      .join('users', 'redemptions.user_id', '=', 'users.id')
      .where('rewards.partner_id', partnerId)
      .select(
        'redemptions.*',
        'rewards.name as reward_name',
        'rewards.reward_type',
        'users.name as user_name',
        'users.email as user_email'
      )
      .limit(limit)
      .offset(offset)
      .orderBy('redemptions.redeemed_at', 'desc');
  }
}

module.exports = Redemption;
