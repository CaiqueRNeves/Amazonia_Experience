import { app, request, setupTestDB, teardownTestDB, generateTestToken } from './setup.js';

describe('Testes de Integração - Admin', () => {
  let db;
  let adminToken;
  let userToken;

  // Configurar banco de dados antes de todos os testes
  beforeAll(async () => {
    db = await setupTestDB();
    
    // Gerar tokens para testes
    adminToken = await generateTestToken('admin');
    userToken = await generateTestToken('user');
  });

  // Limpar banco após todos os testes
  afterAll(async () => {
    await teardownTestDB();
  });

  describe('POST /api/admin/places', () => {
    it('deve permitir que admin crie um local', async () => {
      const res = await request(app)
        .post('/api/admin/places')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Novo Local de Teste',
          description: 'Local criado para testes de integração',
          address: 'Rua de Teste, 123',
          latitude: -1.4500,
          longitude: -48.4800,
          type: 'tourist_spot',
          amacoins_value: 20,
          opening_hours: 'Segunda a Domingo: 9h às 18h',
          wifi_available: true
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('place');
      expect(res.body.data.place.name).toBe('Novo Local de Teste');
    });

    it('deve rejeitar criação sem autenticação de admin', async () => {
      const res = await request(app)
        .post('/api/admin/places')
        .set('Authorization', `Bearer ${userToken}`) // Token de usuário comum
        .send({
          name: 'Local Não Autorizado',
          description: 'Este local não deve ser criado',
          address: 'Rua Não Autorizada, 456',
          latitude: -1.4600,
          longitude: -48.4900,
          type: 'tourist_spot',
          amacoins_value: 15
        });
      
      expect(res.statusCode).toBe(403);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('não autorizado');
    });

    it('deve validar dados do local', async () => {
      const res = await request(app)
        .post('/api/admin/places')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          // Faltando campos obrigatórios
          name: 'Local Incompleto'
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
    });
  });

  describe('PUT /api/admin/places/:id', () => {
    let testPlaceId;
    
    beforeEach(async () => {
      // Buscar ou criar um local para testar a atualização
      const places = await db('places').select('id').limit(1);
      
      if (places.length > 0) {
        testPlaceId = places[0].id;
      } else {
        // Criar um local para testar
        const [placeId] = await db('places').insert({
          name: 'Local para Atualização',
          description: 'Local criado para testar atualização',
          address: 'Rua de Teste, 789',
          latitude: -1.4700,
          longitude: -48.5000,
          type: 'tourist_spot',
          amacoins_value: 25,
          created_at: new Date(),
          updated_at: new Date()
        });
        testPlaceId = placeId;
      }
    });

    it('deve permitir que admin atualize um local', async () => {
      const res = await request(app)
        .put(`/api/admin/places/${testPlaceId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Local Atualizado',
          description: 'Descrição atualizada para testes',
          amacoins_value: 30
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('place');
      expect(res.body.data.place.name).toBe('Local Atualizado');
      expect(res.body.data.place.amacoins_value).toBe(30);
    });

    it('deve rejeitar atualização sem autenticação de admin', async () => {
      const res = await request(app)
        .put(`/api/admin/places/${testPlaceId}`)
        .set('Authorization', `Bearer ${userToken}`) // Token de usuário comum
        .send({
          name: 'Tentativa de Atualização',
          amacoins_value: 5
        });
      
      expect(res.statusCode).toBe(403);
      expect(res.body.status).toBe('error');
    });

    it('deve retornar erro para local inexistente', async () => {
      const res = await request(app)
        .put('/api/admin/places/9999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Local Inexistente',
          description: 'Tentativa de atualizar local inexistente'
        });
      
      expect(res.statusCode).toBe(404);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('não encontrado');
    });
  });

  describe('POST /api/admin/partners', () => {
    let testUserId;
    
    beforeEach(async () => {
      // Buscar ou criar um usuário para testar a criação de parceiro
      const regularUsers = await db('users')
        .where({ role: 'user' })
        .whereNotIn('id', function() {
          this.select('user_id').from('partners');
        })
        .select('id')
        .limit(1);
      
      if (regularUsers.length > 0) {
        testUserId = regularUsers[0].id;
      } else {
        // Criar um usuário para testar
        const [userId] = await db('users').insert({
          name: 'Usuário para Parceria',
          email: 'parceiro.teste@example.com',
          password: 'senha_hash',
          role: 'user',
          created_at: new Date(),
          updated_at: new Date()
        });
        testUserId = userId;
      }
    });

    it('deve permitir que admin crie um parceiro', async () => {
      const res = await request(app)
        .post('/api/admin/partners')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          user_id: testUserId,
          business_name: 'Novo Parceiro de Teste',
          business_type: 'restaurant',
          address: 'Av. dos Parceiros, 123',
          contact_phone: '(91) 99999-8888'
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('partner');
      expect(res.body.data.partner.business_name).toBe('Novo Parceiro de Teste');
      expect(res.body.data.partner.user_id).toBe(testUserId);
    });

    it('deve rejeitar criação de parceiro com usuário inexistente', async () => {
      const res = await request(app)
        .post('/api/admin/partners')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          user_id: 9999, // ID inexistente
          business_name: 'Parceiro Inválido',
          business_type: 'shop',
          address: 'Rua Inexistente, 456'
        });
      
      expect(res.statusCode).toBe(404);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('não encontrado');
    });

    it('deve validar dados do parceiro', async () => {
      const res = await request(app)
        .post('/api/admin/partners')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          // Faltando user_id
          business_name: 'Parceiro Incompleto',
          business_type: 'app_service'
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
    });
  });

  describe('PUT /api/admin/users/:id/role', () => {
    let testRegularUserId;
    
    beforeEach(async () => {
      // Buscar ou criar um usuário regular para testar
      const regularUsers = await db('users')
        .where({ role: 'user' })
        .select('id')
        .limit(1);
      
      if (regularUsers.length > 0) {
        testRegularUserId = regularUsers[0].id;
      } else {
        // Criar um usuário para testar
        const [userId] = await db('users').insert({
          name: 'Usuário para Mudança de Função',
          email: 'role.teste@example.com',
          password: 'senha_hash',
          role: 'user',
          created_at: new Date(),
          updated_at: new Date()
        });
        testRegularUserId = userId;
      }
    });

    it('deve permitir que admin altere função de usuário', async () => {
      const res = await request(app)
        .put(`/api/admin/users/${testRegularUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: 'partner'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user.id).toBe(testRegularUserId);
      expect(res.body.data.user.role).toBe('partner');
    });

    it('deve rejeitar alteração sem autenticação de admin', async () => {
      const res = await request(app)
        .put(`/api/admin/users/${testRegularUserId}/role`)
        .set('Authorization', `Bearer ${userToken}`) // Token de usuário comum
        .send({
          role: 'admin'
        });
      
      expect(res.statusCode).toBe(403);
      expect(res.body.status).toBe('error');
    });

    it('deve validar função válida', async () => {
      const res = await request(app)
        .put(`/api/admin/users/${testRegularUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: 'invalid_role' // Função inválida
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('inválida');
    });
  });

  describe('POST /api/admin/emergency/services', () => {
    it('deve permitir que admin adicione serviço de emergência', async () => {
      const res = await request(app)
        .post('/api/admin/emergency/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Nova Farmácia 24h',
          service_type: 'pharmacy',
          address: 'Av. Central, 789',
          latitude: -1.4600,
          longitude: -48.4850,
          phone_number: '(91) 3333-4444',
          opening_hours: '24 horas',
          is_24h: true,
          languages_spoken: ['pt-BR', 'en-US']
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('service');
      expect(res.body.data.service.name).toBe('Nova Farmácia 24h');
      expect(res.body.data.service.service_type).toBe('pharmacy');
    });

    it('deve validar tipo de serviço', async () => {
      const res = await request(app)
        .post('/api/admin/emergency/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Serviço Inválido',
          service_type: 'invalid_type', // Tipo inválido
          address: 'Rua do Teste, 123',
          latitude: -1.4700,
          longitude: -48.4950,
          phone_number: '(91) 5555-6666'
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('inválido');
    });
  });

  describe('PUT /api/admin/connectivity/spots', () => {
    let testSpotId;
    
    beforeEach(async () => {
      // Buscar ou criar um ponto de conectividade para testar
      const spots = await db('connectivity_spots').select('id').limit(1);
      
      if (spots.length > 0) {
        testSpotId = spots[0].id;
      } else {
        // Criar um spot para testar
        const [spotId] = await db('connectivity_spots').insert({
          name: 'Spot para Atualização',
          location_type: 'public',
          address: 'Endereço de Teste',
          latitude: -1.4500,
          longitude: -48.4800,
          wifi_speed: 'medium',
          wifi_reliability: 7,
          is_free: true,
          password_required: false,
          verified: false,
          created_at: new Date(),
          updated_at: new Date()
        });
        testSpotId = spotId;
      }
    });

    it('deve permitir que admin atualize spot de conectividade', async () => {
      const res = await request(app)
        .put('/api/admin/connectivity/spots')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          id: testSpotId,
          wifi_speed: 'fast',
          is_verified: true
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('spot');
      expect(res.body.data.spot.id).toBe(testSpotId);
      expect(res.body.data.spot.wifi_speed).toBe('fast');
      expect(res.body.data.spot.is_verified).toBe(true);
    });

    it('deve validar ID do spot', async () => {
      const res = await request(app)
        .put('/api/admin/connectivity/spots')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          // Faltando ID
          wifi_speed: 'fast',
          is_verified: true
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
    });
  });
});