import Reward from '../models/Reward.js';
import Redemption from '../models/Redemption.js';
import User from '../models/User.js';
import db from '../config/database.js';
import { NotFoundError, ValidationError, ForbiddenError } from '../middleware/error.js';

// Listar recompensas
export const getRewards = async (req, res, next) => {
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
export const getPhysicalRewards = async (req, res, next) => {
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
export const getDigitalRewards = async (req, res, next) => {
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
export const getReward = async (req, res, next) => {
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

// Resgatar recompensa com transação completa e verificação de concorrência
export const redeemReward = async (req, res, next) => {
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
export const getRedemptions = async (req, res, next) => {
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
export const cancelRedemption = async (req, res, next) => {
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
  }}