const Reward = require('../models/Reward');
const Redemption = require('../models/Redemption');
const User = require('../models/User');
const db = require('../config/database');
const { NotFoundError, ValidationError, ForbiddenError } = require('../middleware/error');

// Listar recompensas
exports.getRewards = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Construir filtros a partir dos query params
    const filters = {};
    
    if (req.query.reward_type) {
      filters.rewardType = req.query.reward_type;
    }
    
    if (req.query.partner_id) {
      filters.partnerId = parseInt(req.query.partner_id);
    }
    
    if (req.query.max_cost) {
      filters.maxCost = parseInt(req.query.max_cost);
    }
    
    if (req.query.in_stock === 'true') {
      filters.inStock = true;
    }
    
    if (req.query.search) {
      filters.search = req.query.search;
    }
    
    const rewards = await Reward.findAll(page, limit, filters);
    
    res.json({
      status: 'success',
      data: {
        rewards,
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

// Listar produtos físicos
exports.getPhysicalRewards = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const filters = {
      rewardType: 'physical_product',
      inStock: true
    };
    
    const rewards = await Reward.findAll(page, limit, filters);
    
    res.json({
      status: 'success',
      data: {
        rewards,
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

// Listar serviços e produtos digitais
exports.getDigitalRewards = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const filters = {
      rewardType: ['digital_service', 'discount_coupon']
    };
    
    const rewards = await Reward.findAll(page, limit, filters);
    
    res.json({
      status: 'success',
      data: {
        rewards,
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

// Obter detalhes de uma recompensa
exports.getReward = async (req, res, next) => {
  try {
    const rewardId = req.params.id;
    const reward = await Reward.findById(rewardId);
    
    if (!reward) {
      throw new NotFoundError('Recompensa não encontrada');
    }
    
    res.json({
      status: 'success',
      data: {
        reward
      }
    });
  } catch (error) {
    next(error);
  }
};

// CORREÇÃO: Resgatar recompensa com transação completa e verificação de concorrência
exports.redeemReward = async (req, res, next) => {
  const trx = await db.transaction();
  
  try {
    const rewardId = req.params.id;
    const userId = req.user.id;
    
    // Buscar recompensa com lock para prevenir condições de corrida
    const reward = await trx('rewards')
      .where({ id: rewardId })
      .forUpdate()
      .first();
      
    if (!reward) {
      await trx.rollback();
      throw new NotFoundError('Recompensa não encontrada');
    }
    
    // Verificar se há estoque disponível
    if (reward.stock <= 0) {
      await trx.rollback();
      throw new ValidationError('Recompensa esgotada');
    }
    
    // Verificar se a recompensa está ativa
    if (!reward.is_active) {
      await trx.rollback();
      throw new ValidationError('Recompensa não está mais disponível');
    }
    
    // Verificar data de expiração
    if (reward.expiration_date && new Date(reward.expiration_date) < new Date()) {
      await trx.rollback();
      throw new ValidationError('Recompensa expirada');
    }
    
    // Buscar usuário com lock
    const user = await trx('users')
      .where({ id: userId })
      .forUpdate()
      .first();
      
    if (!user) {
      await trx.rollback();
      throw new NotFoundError('Usuário não encontrado');
    }
    
    // Verificar se o usuário tem AmaCoins suficientes
    if (user.amacoins < reward.amacoins_cost) {
      await trx.rollback();
      throw new ValidationError('Saldo de AmaCoins insuficiente');
    }
    
    // Verificar limite por usuário (se houver)
    if (reward.max_per_user) {
      const userRedemptions = await trx('redemptions')
        .where({
          user_id: userId,
          reward_id: rewardId,
          status: ['pending', 'completed']
        })
        .count('id as count')
        .first();
        
      if (userRedemptions.count >= reward.max_per_user) {
        await trx.rollback();
        throw new ValidationError(`Você já atingiu o limite de ${reward.max_per_user} resgates para esta recompensa`);
      }
    }
    
    // Gerar código único para resgate
    const redemptionCode = generateRedemptionCode();
    
    // Decrementar estoque da recompensa
    await trx('rewards')
      .where({ id: rewardId })
      .decrement('stock', 1)
      .update({ updated_at: new Date() });
    
    // Debitar AmaCoins do usuário
    await trx('users')
      .where({ id: userId })
      .decrement('amacoins', reward.amacoins_cost)
      .update({ updated_at: new Date() });
    
    // Criar registro de resgate
    const [redemptionId] = await trx('redemptions').insert({
      user_id: userId,
      reward_id: rewardId,
      amacoins_spent: reward.amacoins_cost,
      redemption_code: redemptionCode,
      redeemed_at: new Date(),
      status: 'pending',
      expires_at: getRedemptionExpirationDate(reward.reward_type),
      created_at: new Date(),
      updated_at: new Date()
    });
    
    // Registrar transação de AmaCoins para auditoria
    await trx('amacoin_transactions').insert({
      user_id: userId,
      amount: -reward.amacoins_cost,
      previous_balance: user.amacoins,
      new_balance: user.amacoins - reward.amacoins_cost,
      transaction_type: 'redemption',
      related_entity_type: 'reward',
      related_entity_id: rewardId,
      description: `Resgate de recompensa: ${reward.name}`,
      created_at: new Date()
    });
    
    const redemption = await trx('redemptions')
      .where({ id: redemptionId })
      .first();
    
    await trx.commit();
    
    // Enviar notificação para o usuário (async, não bloquear resposta)
    setImmediate(() => {
      sendRedemptionNotification(userId, reward, redemptionCode);
    });
    
    // Log da atividade
    console.log(`Resgate realizado: User ${userId} resgatou reward ${rewardId} por ${reward.amacoins_cost} AmaCoins`);
    
    res.status(201).json({
      status: 'success',
      data: {
        redemption: {
          id: redemption.id,
          redemption_code: redemptionCode,
          status: redemption.status,
          expires_at: redemption.expires_at,
          redeemed_at: redemption.redeemed_at
        },
        reward: {
          id: reward.id,
          name: reward.name,
          type: reward.reward_type,
          cost: reward.amacoins_cost
        },
        user: {
          new_balance: user.amacoins - reward.amacoins_cost
        }
      }
    });
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

// Obter histórico de resgates do usuário
exports.getRedemptions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status; // Filtro opcional por status
    
    const filters = { user_id: userId };
    if (status) {
      filters.status = status;
    }
    
    const redemptions = await Redemption.getByUserId(userId, page, limit, filters);
    
    res.json({
      status: 'success',
      data: {
        redemptions,
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

// Cancelar resgate (se ainda não foi processado)
exports.cancelRedemption = async (req, res, next) => {
  const trx = await db.transaction();
  
  try {
    const redemptionId = req.params.redemption_id;
    const userId = req.user.id;
    
    // Buscar resgate com lock
    const redemption = await trx('redemptions')
      .where({ id: redemptionId, user_id: userId })
      .forUpdate()
      .first();
      
    if (!redemption) {
      await trx.rollback();
      throw new NotFoundError('Resgate não encontrado');
    }
    
    // Só permite cancelamento se ainda estiver pendente
    if (redemption.status !== 'pending') {
      await trx.rollback();
      throw new ValidationError('Este resgate não pode mais ser cancelado');
    }
    
    // Verificar se não passou do prazo de cancelamento (ex: 1 hora)
    const cancelDeadline = new Date(redemption.redeemed_at);
    cancelDeadline.setHours(cancelDeadline.getHours() + 1);
    
    if (new Date() > cancelDeadline) {
      await trx.rollback();
      throw new ValidationError('Prazo para cancelamento expirado');
    }
    
    // Buscar recompensa
    const reward = await trx('rewards')
      .where({ id: redemption.reward_id })
      .forUpdate()
      .first();
    
    // Reverter transação
    await trx('redemptions')
      .where({ id: redemptionId })
      .update({ 
        status: 'cancelled',
        cancelled_at: new Date(),
        updated_at: new Date()
      });
    
    // Devolver estoque
    await trx('rewards')
      .where({ id: redemption.reward_id })
      .increment('stock', 1)
      .update({ updated_at: new Date() });
    
    // Devolver AmaCoins
    await trx('users')
      .where({ id: userId })
      .increment('amacoins', redemption.amacoins_spent)
      .update({ updated_at: new Date() });
    
    // Registrar transação de estorno
    await trx('amacoin_transactions').insert({
      user_id: userId,
      amount: redemption.amacoins_spent,
      transaction_type: 'refund',
      related_entity_type: 'redemption',
      related_entity_id: redemptionId,
      description: `Cancelamento de resgate: ${reward?.name || 'Recompensa'}`,
      created_at: new Date()
    });
    
    await trx.commit();
    
    res.json({
      status: 'success',
      message: 'Resgate cancelado com sucesso',
      data: {
        refunded_amacoins: redemption.amacoins_spent
      }
    });
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

// Funções auxiliares
function generateRedemptionCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getRedemptionExpirationDate(rewardType) {
  const now = new Date();
  
  switch (rewardType) {
    case 'digital_service':
      // Serviços digitais expiram em 30 dias
      now.setDate(now.getDate() + 30);
      break;
    case 'discount_coupon':
      // Cupons de desconto expiram em 7 dias
      now.setDate(now.getDate() + 7);
      break;
    case 'physical_product':
      // Produtos físicos devem ser retirados em 15 dias
      now.setDate(now.getDate() + 15);
      break;
    default:
      // Padrão: 30 dias
      now.setDate(now.getDate() + 30);
  }
  
  return now;
}

async function sendRedemptionNotification(userId, reward, redemptionCode) {
  try {
    // Aqui seria integrado com serviço de notificações
    // Por exemplo: email, push notification, etc.
    
    // Mock da notificação
    console.log(`Notificação enviada para usuário ${userId}:`, {
      type: 'redemption_success',
      reward_name: reward.name,
      redemption_code: redemptionCode,
      message: `Parabéns! Você resgatou ${reward.name}. Código: ${redemptionCode}`
    });
    
    // Salvar notificação no banco para histórico
    await db('user_notifications').insert({
      user_id: userId,
      type: 'redemption_success',
      title: 'Resgate realizado com sucesso!',
      message: `Você resgatou ${reward.name}. Código de resgate: ${redemptionCode}`,
      data: JSON.stringify({
        reward_id: reward.id,
        redemption_code: redemptionCode
      }),
      created_at: new Date()
    });
  } catch (error) {
    console.error('Erro ao enviar notificação de resgate:', error);
  }
}

// Verificar código de resgate (para parceiros)
exports.verifyRedemptionCode = async (req, res, next) => {
  try {
    const { redemption_code } = req.body;
    const partnerId = req.user.partner_id; // Assumindo que parceiros têm partner_id
    
    if (!partnerId) {
      throw new ForbiddenError('Apenas parceiros podem verificar códigos de resgate');
    }
    
    // Buscar resgate pelo código
    const redemption = await db('redemptions')
      .join('rewards', 'redemptions.reward_id', '=', 'rewards.id')
      .join('users', 'redemptions.user_id', '=', 'users.id')
      .where({
        'redemptions.redemption_code': redemption_code,
        'rewards.partner_id': partnerId
      })
      .select(
        'redemptions.*',
        'rewards.name as reward_name',
        'rewards.reward_type',
        'rewards.description as reward_description',
        'users.name as user_name',
        'users.email as user_email'
      )
      .first();
    
    if (!redemption) {
      throw new NotFoundError('Código de resgate inválido ou não pertence a este parceiro');
    }
    
    // Verificar se o resgate expirou
    if (redemption.expires_at && new Date(redemption.expires_at) < new Date()) {
      throw new ValidationError('Código de resgate expirado');
    }
    
    // Verificar se já foi usado
    if (redemption.status === 'completed') {
      throw new ValidationError('Este código já foi utilizado');
    }
    
    if (redemption.status === 'cancelled') {
      throw new ValidationError('Este código foi cancelado');
    }
    
    res.json({
      status: 'success',
      data: {
        redemption: {
          id: redemption.id,
          code: redemption.redemption_code,
          status: redemption.status,
          redeemed_at: redemption.redeemed_at,
          expires_at: redemption.expires_at
        },
        reward: {
          name: redemption.reward_name,
          type: redemption.reward_type,
          description: redemption.reward_description
        },
        user: {
          name: redemption.user_name,
          email: redemption.user_email
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Confirmar uso do resgate (para parceiros)
exports.confirmRedemption = async (req, res, next) => {
  try {
    const { redemption_code } = req.body;
    const partnerId = req.user.partner_id;
    
    if (!partnerId) {
      throw new ForbiddenError('Apenas parceiros podem confirmar resgates');
    }
    
    const trx = await db.transaction();
    
    try {
      // Buscar e bloquear resgate
      const redemption = await trx('redemptions')
        .join('rewards', 'redemptions.reward_id', '=', 'rewards.id')
        .where({
          'redemptions.redemption_code': redemption_code,
          'rewards.partner_id': partnerId,
          'redemptions.status': 'pending'
        })
        .forUpdate()
        .select('redemptions.*')
        .first();
      
      if (!redemption) {
        await trx.rollback();
        throw new NotFoundError('Código inválido, já usado ou não pertence a este parceiro');
      }
      
      // Marcar como completado
      await trx('redemptions')
        .where({ id: redemption.id })
        .update({
          status: 'completed',
          completed_at: new Date(),
          completed_by_partner_id: partnerId,
          updated_at: new Date()
        });
      
      await trx.commit();
      
      // Enviar confirmação para o usuário
      setImmediate(() => {
        sendRedemptionConfirmation(redemption.user_id, redemption_code);
      });
      
      res.json({
        status: 'success',
        message: 'Resgate confirmado com sucesso',
        data: {
          redemption_id: redemption.id,
          completed_at: new Date()
        }
      });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

async function sendRedemptionConfirmation(userId, redemptionCode) {
  try {
    await db('user_notifications').insert({
      user_id: userId,
      type: 'redemption_confirmed',
      title: 'Resgate confirmado!',
      message: `Seu resgate com código ${redemptionCode} foi confirmado pelo parceiro.`,
      data: JSON.stringify({ redemption_code: redemptionCode }),
      created_at: new Date()
    });
  } catch (error) {
    console.error('Erro ao enviar confirmação de resgate:', error);
  }
}