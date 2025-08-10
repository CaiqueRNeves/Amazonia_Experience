// tests/unit/reward.test.js
import rewardService from '../../src/services/rewardService.js';
import Reward from '../../src/models/Reward.js';
import Redemption from '../../src/models/Redemption.js';
import User from '../../src/models/User.js';

// Mock dos modelos
jest.mock('../../src/models/Reward.js');
jest.mock('../../src/models/Redemption.js');
jest.mock('../../src/models/User.js');

describe('RewardService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRewards', () => {
    it('deve retornar recompensas com paginação', async () => {
      const mockRewards = [
        { id: 1, name: 'Camiseta COP30' },
        { id: 2, name: 'Desconto em Tour' }
      ];

      // Mock da função findAll
      Reward.findAll.mockResolvedValue(mockRewards);

      // Executar o método
      const result = await rewardService.getRewards(1, 10, {});

      // Verificações
      expect(Reward.findAll).toHaveBeenCalledWith(1, 10, {});
      expect(result).toEqual(mockRewards);
    });

    it('deve aplicar filtros corretamente', async () => {
      const mockRewards = [{ id: 1, name: 'Camiseta COP30' }];
      const filters = { 
        rewardType: 'physical_product', 
        maxCost: 200, 
        inStock: true
      };

      // Mock da função findAll
      Reward.findAll.mockResolvedValue(mockRewards);

      // Executar o método
      const result = await rewardService.getRewards(1, 10, filters);

      // Verificações
      expect(Reward.findAll).toHaveBeenCalledWith(1, 10, filters);
      expect(result).toEqual(mockRewards);
    });
  });

  describe('redeemReward', () => {
    it('deve resgatar uma recompensa com sucesso', async () => {
      const userId = 1;
      const rewardId = 2;

      // Mock dos dados
      const mockReward = {
        id: rewardId,
        name: 'Camiseta COP30',
        amacoins_cost: 150,
        stock: 10,
        reward_type: 'physical_product'
      };

      const mockUser = {
        id: userId,
        name: 'Test User',
        amacoins: 200
      };

      const mockRedemption = {
        id: 1,
        user_id: userId,
        reward_id: rewardId,
        amacoins_spent: 150,
        status: 'pending'
      };

      // Mock das funções
      Reward.findById.mockResolvedValue(mockReward);
      User.findById.mockResolvedValue(mockUser);
      Redemption.create.mockResolvedValue(mockRedemption);

      // Executar o método
      const result = await rewardService.redeemReward(userId, rewardId);

      // Verificações
      expect(Reward.findById).toHaveBeenCalledWith(rewardId);
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(Reward.decrementStock).toHaveBeenCalledWith(rewardId);
      expect(User.updateAmacoins).toHaveBeenCalledWith(userId, -150);
      expect(Redemption.create).toHaveBeenCalled();
      
      expect(result).toEqual({
        redemption: mockRedemption,
        reward: {
          name: 'Camiseta COP30',
          type: 'physical_product',
          cost: 150
        },
        user: {
          new_balance: 50 // 200 - 150
        }
      });
    });

    it('deve lançar erro se o usuário não tiver AmaCoins suficientes', async () => {
      const userId = 1;
      const rewardId = 2;

      // Mock dos dados
      const mockReward = {
        id: rewardId,
        name: 'Camiseta COP30',
        amacoins_cost: 150,
        stock: 10
      };

      const mockUser = {
        id: userId,
        name: 'Test User',
        amacoins: 100 // Menos do que o custo da recompensa
      };

      // Mock das funções
      Reward.findById.mockResolvedValue(mockReward);
      User.findById.mockResolvedValue(mockUser);

      // Executar o método e verificar se o erro é lançado
      await expect(rewardService.redeemReward(userId, rewardId))
        .rejects.toThrow('Saldo de AmaCoins insuficiente');
      
      expect(Reward.findById).toHaveBeenCalledWith(rewardId);
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(Reward.decrementStock).not.toHaveBeenCalled();
      expect(User.updateAmacoins).not.toHaveBeenCalled();
      expect(Redemption.create).not.toHaveBeenCalled();
    });

    it('deve lançar erro se a recompensa estiver esgotada', async () => {
      const userId = 1;
      const rewardId = 2;

      // Mock dos dados
      const mockReward = {
        id: rewardId,
        name: 'Camiseta COP30',
        amacoins_cost: 150,
        stock: 0 // Sem estoque
      };

      const mockUser = {
        id: userId,
        name: 'Test User',
        amacoins: 200
      };

      // Mock das funções
      Reward.findById.mockResolvedValue(mockReward);
      User.findById.mockResolvedValue(mockUser);

      // Executar o método e verificar se o erro é lançado
      await expect(rewardService.redeemReward(userId, rewardId))
        .rejects.toThrow('Recompensa esgotada');
      
      expect(Reward.findById).toHaveBeenCalledWith(rewardId);
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(Reward.decrementStock).not.toHaveBeenCalled();
      expect(User.updateAmacoins).not.toHaveBeenCalled();
      expect(Redemption.create).not.toHaveBeenCalled();
    });
  });
});
