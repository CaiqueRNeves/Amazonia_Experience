import Reward from '../models/Reward.js';
import Redemption from '../models/Redemption.js';
import User from '../models/User.js';
import { NotFoundError, ValidationError } from '../middleware/error.js';

class RewardService {
  async getRewards(page = 1, limit = 10, filters = {}) {
    return Reward.findAll(page, limit, filters);
  }

  async redeemReward(userId, rewardId) {
    const reward = await Reward.findById(rewardId);
    if (!reward) {
      throw new NotFoundError('Recompensa não encontrada');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    if (reward.stock <= 0) {
      throw new ValidationError('Recompensa esgotada');
    }

    if (user.amacoins < reward.amacoins_cost) {
      throw new ValidationError('Saldo de AmaCoins insuficiente');
    }

    await Reward.decrementStock(rewardId);
    await User.updateAmacoins(userId, -reward.amacoins_cost);

    const redemption = await Redemption.create({
      user_id: userId,
      reward_id: rewardId,
      amacoins_spent: reward.amacoins_cost
    });

    return {
      redemption,
      reward: {
        name: reward.name,
        type: reward.reward_type,
        cost: reward.amacoins_cost
      },
      user: {
        new_balance: user.amacoins - reward.amacoins_cost
      }
    };
  }
}

export default new RewardService();
