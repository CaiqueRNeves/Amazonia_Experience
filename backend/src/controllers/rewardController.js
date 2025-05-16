const Reward = require('../models/Reward');
const Redemption = require('../models/Redemption');
const User = require('../models/User');
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

// Resgatar uma recompensa
exports.redeemReward = async (req, res, next) => {
  try {
    const rewardId = req.params.id;
    const userId = req.user.id;
    
    // Verificar se a recompensa existe
    const reward = await Reward.findById(rewardId);
    if (!reward) {
      throw new NotFoundError('Recompensa não encontrada');
    }
    
    // Verificar se há estoque disponível
    if (reward.stock <= 0) {
      throw new ValidationError('Recompensa esgotada');
    }
    
    // Verificar se o usuário tem AmaCoins suficientes
    const user = await User.findById(userId);
    if (user.amacoins < reward.amacoins_cost) {
      throw new ValidationError('Saldo de AmaCoins insuficiente');
    }
    
    // Criar registro de resgate
    const redemption = await Redemption.create({
      user_id: userId,
      reward_id: rewardId,
      amacoins_spent: reward.amacoins_cost
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        redemption,
        reward: {
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
    next(error);
  }
};

// Obter histórico de resgates do usuário
exports.getRedemptions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const redemptions = await Redemption.getByUserId(userId, page, limit);
    
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