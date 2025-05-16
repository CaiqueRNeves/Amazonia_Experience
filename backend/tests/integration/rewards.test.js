const { app, request, setupTestDB, teardownTestDB, generateTestToken } = require('./setup');

describe('Testes de Integração - Recompensas', () => {
  let db;
  let userToken;
  let testRewardId;

  // Configurar banco de dados antes de todos os testes
  beforeAll(async () => {
    db = await setupTestDB();
    
    // Gerar token para testes
    userToken = await generateTestToken('user');
    
    // Garantir que o usuário tem AmaCoins suficientes para testes
    await db('users')
      .where('id', 2) // ID do usuário de teste
      .update({ amacoins: 500 });
    
    // Verificar se temos recompensas para testar
    const rewards = await db('rewards').select('id').limit(1);
    if (rewards.length > 0) {
      testRewardId = rewards[0].id;
    } else {
      // Inserir uma recompensa de teste se não existir
      const [rewardId] = await db('rewards').insert({
        name: 'Recompensa de Teste',
        description: 'Recompensa criada para testes de integração',
        amacoins_cost: 100,
        partner_id: 4, // ID de um parceiro existente
        reward_type: 'physical_product',
        stock: 10,
        created_at: new Date(),
        updated_at: new Date()
      });
      testRewardId = rewardId;
    }
  });

  // Limpar banco após todos os testes
  afterAll(async () => {
    await teardownTestDB();
  });

  describe('GET /api/rewards', () => {
    it('deve listar recompensas com paginação', async () => {
      const res = await request(app)
        .get('/api/rewards')
        .query({ page: 1, limit: 10 });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('rewards');
      expect(Array.isArray(res.body.data.rewards)).toBeTruthy();
      expect(res.body.data).toHaveProperty('pagination');
      expect(res.body.data.pagination).toHaveProperty('page', 1);
      expect(res.body.data.pagination).toHaveProperty('limit', 10);
    });

    it('deve filtrar recompensas por tipo', async () => {
      const res = await request(app)
        .get('/api/rewards')
        .query({ reward_type: 'physical_product' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      
      // Verificar que todas as recompensas retornadas são do tipo 'physical_product'
      if (res.body.data.rewards.length > 0) {
        res.body.data.rewards.forEach(reward => {
          expect(reward.reward_type).toBe('physical_product');
        });
      }
    });

    it('deve filtrar recompensas por custo máximo', async () => {
      const maxCost = 200;
      const res = await request(app)
        .get('/api/rewards')
        .query({ max_cost: maxCost });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      
      // Verificar que todas as recompensas retornadas têm custo menor ou igual ao máximo
      if (res.body.data.rewards.length > 0) {
        res.body.data.rewards.forEach(reward => {
          expect(reward.amacoins_cost).toBeLessThanOrEqual(maxCost);
        });
      }
    });
  });

  describe('GET /api/rewards/physical', () => {
    it('deve listar produtos físicos', async () => {
      const res = await request(app)
        .get('/api/rewards/physical');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('rewards');
      
      // Verificar que todas as recompensas são produtos físicos
      if (res.body.data.rewards.length > 0) {
        res.body.data.rewards.forEach(reward => {
          expect(reward.reward_type).toBe('physical_product');
        });
      }
    });
  });

  describe('GET /api/rewards/digital', () => {
    it('deve listar serviços e produtos digitais', async () => {
      const res = await request(app)
        .get('/api/rewards/digital');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('rewards');
      
      // Verificar que todas as recompensas são digitais
      if (res.body.data.rewards.length > 0) {
        res.body.data.rewards.forEach(reward => {
          expect(['digital_service', 'discount_coupon']).toContain(reward.reward_type);
        });
      }
    });
  });

  describe('GET /api/rewards/:id', () => {
    it('deve retornar detalhes de uma recompensa específica', async () => {
      const res = await request(app)
        .get(`/api/rewards/${testRewardId}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('reward');
      expect(res.body.data.reward.id).toBe(testRewardId);
      expect(res.body.data.reward).toHaveProperty('name');
      expect(res.body.data.reward).toHaveProperty('amacoins_cost');
      expect(res.body.data.reward).toHaveProperty('reward_type');
    });

    it('deve retornar erro para recompensa inexistente', async () => {
      const res = await request(app)
        .get('/api/rewards/9999');
      
      expect(res.statusCode).toBe(404);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('não encontrada');
    });
  });

  describe('POST /api/rewards/:id/redeem', () => {
    it('deve permitir resgatar uma recompensa para usuário autenticado', async () => {
      // Buscar uma recompensa com estoque disponível
      const availableRewards = await db('rewards')
        .where('stock', '>', 0)
        .select('id', 'amacoins_cost')
        .limit(1);
      
      if (availableRewards.length > 0) {
        const rewardToRedeem = availableRewards[0];
        
        // Garantir que o usuário tem AmaCoins suficientes
        await db('users')
          .where('id', 2) // ID do usuário de teste
          .update({ amacoins: rewardToRedeem.amacoins_cost + 100 });
          
        const res = await request(app)
          .post(`/api/rewards/${rewardToRedeem.id}/redeem`)
          .set('Authorization', `Bearer ${userToken}`);
        
        expect(res.statusCode).toBe(201);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('redemption');
        expect(res.body.data).toHaveProperty('reward');
        expect(res.body.data).toHaveProperty('user');
        expect(res.body.data.redemption.reward_id).toBe(rewardToRedeem.id);
        expect(res.body.data.redemption.amacoins_spent).toBe(rewardToRedeem.amacoins_cost);
        expect(res.body.data.user).toHaveProperty('new_balance');
      } else {
        // Skip test if no rewards with stock available
        console.log('Pulando teste - nenhuma recompensa com estoque disponível');
        expect(true).toBeTruthy();
      }
    });

    it('deve rejeitar resgate sem autenticação', async () => {
      const res = await request(app)
        .post(`/api/rewards/${testRewardId}/redeem`);
      
      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('error');
    });

    it('deve validar saldo de AmaCoins suficiente', async () => {
      // Primeiro, encontrar uma recompensa com custo alto
      const expensiveRewards = await db('rewards')
        .where('amacoins_cost', '>', 1000) // Um valor alto
        .select('id')
        .limit(1);
      
      if (expensiveRewards.length > 0) {
        const expensiveRewardId = expensiveRewards[0].id;
        
        // Certificar que o usuário não tem AmaCoins suficientes
        await db('users')
          .where('id', 2) // ID do usuário de teste
          .update({ amacoins: 10 });
        
        const res = await request(app)
          .post(`/api/rewards/${expensiveRewardId}/redeem`)
          .set('Authorization', `Bearer ${userToken}`);
        
        expect(res.statusCode).toBe(400);
        expect(res.body.status).toBe('error');
        expect(res.body.message).toContain('insuficiente');
      } else {
        // Usar a recompensa de teste e ajustar o saldo do usuário
        await db('users')
          .where('id', 2) // ID do usuário de teste
          .update({ amacoins: 10 });
        
        const reward = await db('rewards').where('id', testRewardId).first();
        
        if (reward && reward.amacoins_cost > 10) {
          const res = await request(app)
            .post(`/api/rewards/${testRewardId}/redeem`)
            .set('Authorization', `Bearer ${userToken}`);
          
          expect(res.statusCode).toBe(400);
          expect(res.body.status).toBe('error');
          expect(res.body.message).toContain('insuficiente');
        } else {
          // Skip test if no expensive rewards found
          console.log('Pulando teste - nenhuma recompensa cara encontrada');
          expect(true).toBeTruthy();
        }
      }
    });

    it('deve validar disponibilidade de estoque', async () => {
      // Encontrar ou criar uma recompensa sem estoque
      let noStockRewardId;
      const noStockRewards = await db('rewards')
        .where('stock', 0)
        .select('id')
        .limit(1);
      
      if (noStockRewards.length > 0) {
        noStockRewardId = noStockRewards[0].id;
      } else {
        // Atualizar a recompensa de teste para ficar sem estoque
        await db('rewards')
          .where('id', testRewardId)
          .update({ stock: 0 });
        
        noStockRewardId = testRewardId;
      }
      
      // Garantir que o usuário tem AmaCoins suficientes
      await db('users')
        .where('id', 2) // ID do usuário de teste
        .update({ amacoins: 1000 });
      
      const res = await request(app)
        .post(`/api/rewards/${noStockRewardId}/redeem`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('esgotada');
    });
  });

  describe('GET /api/rewards/redemptions', () => {
    it('deve listar histórico de resgates do usuário', async () => {
      const res = await request(app)
        .get('/api/rewards/redemptions')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('redemptions');
      expect(Array.isArray(res.body.data.redemptions)).toBeTruthy();
    });

    it('deve rejeitar acesso sem autenticação', async () => {
      const res = await request(app)
        .get('/api/rewards/redemptions');
      
      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('error');
    });
  });
});