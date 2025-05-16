const { app, request, setupTestDB, teardownTestDB, generateTestToken } = require('./setup');

describe('Testes de Integração - Conectividade', () => {
  let db;
  let userToken;
  let testSpotId;

  // Configurar banco de dados antes de todos os testes
  beforeAll(async () => {
    db = await setupTestDB();
    
    // Gerar token para testes
    userToken = await generateTestToken('user');
    
    // Verificar se temos spots para testar
    const spots = await db('connectivity_spots').select('id').limit(1);
    if (spots.length > 0) {
      testSpotId = spots[0].id;
    } else {
      // Inserir um spot de teste se não existir
      const [spotId] = await db('connectivity_spots').insert({
        name: 'Spot de Teste',
        location_type: 'public',
        address: 'Endereço de Teste',
        latitude: -1.4500,
        longitude: -48.4800,
        wifi_speed: 'medium',
        wifi_reliability: 7,
        is_free: true,
        password_required: false,
        opening_hours: '24 horas',
        created_at: new Date(),
        updated_at: new Date()
      });
      testSpotId = spotId;
    }
  });

  // Limpar banco após todos os testes
  afterAll(async () => {
    await teardownTestDB();
  });

  describe('GET /api/connectivity/spots', () => {
    it('deve listar pontos de conectividade', async () => {
      const res = await request(app)
        .get('/api/connectivity/spots');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('spots');
      expect(Array.isArray(res.body.data.spots)).toBeTruthy();
      expect(res.body.data).toHaveProperty('pagination');
    });

    it('deve filtrar pontos por disponibilidade gratuita', async () => {
      const res = await request(app)
        .get('/api/connectivity/spots')
        .query({ is_free: 'true' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      
      // Verificar que todos os pontos retornados são gratuitos
      if (res.body.data.spots.length > 0) {
        res.body.data.spots.forEach(spot => {
          expect(spot.is_free).toBe(true);
        });
      }
    });

    it('deve filtrar pontos por velocidade de Wi-Fi', async () => {
      const res = await request(app)
        .get('/api/connectivity/spots')
        .query({ wifi_speed: 'fast' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      
      // Verificar que todos os pontos retornados têm velocidade rápida
      if (res.body.data.spots.length > 0) {
        res.body.data.spots.forEach(spot => {
          expect(spot.wifi_speed).toBe('fast');
        });
      }
    });
  });

  describe('GET /api/connectivity/spots/nearby', () => {
    it('deve encontrar pontos de conectividade próximos', async () => {
      const res = await request(app)
        .get('/api/connectivity/spots/nearby')
        .query({
          latitude: -1.4500,
          longitude: -48.4800,
          radius: 10
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('spots');
      expect(Array.isArray(res.body.data.spots)).toBeTruthy();
    });

    it('deve validar parâmetros de coordenadas', async () => {
      // Testando sem latitude
      const res = await request(app)
        .get('/api/connectivity/spots/nearby')
        .query({
          longitude: -48.4800
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('obrigatórios');
    });
  });

  describe('POST /api/connectivity/spots/:id/report', () => {
    it('deve permitir reportar informações sobre ponto de conectividade', async () => {
      const reportData = {
        wifi_speed: 'fast',
        wifi_reliability: 8,
        is_working: true,
        comment: 'Excelente sinal e velocidade'
      };
      
      const res = await request(app)
        .post(`/api/connectivity/spots/${testSpotId}/report`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(reportData);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('report');
      expect(res.body.data.report.spot_id).toBe(testSpotId);
      expect(res.body.data.report.wifi_speed).toBe('fast');
    });

    it('deve rejeitar report sem autenticação', async () => {
      const res = await request(app)
        .post(`/api/connectivity/spots/${testSpotId}/report`)
        .send({
          wifi_speed: 'medium',
          is_working: true
        });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('error');
    });

    it('deve validar dados do relatório', async () => {
      // Enviando valor inválido para wifi_speed
      const res = await request(app)
        .post(`/api/connectivity/spots/${testSpotId}/report`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          wifi_speed: 'super_fast', // Valor inválido
          wifi_reliability: 8
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
    });
  });

  describe('GET /api/connectivity/heatmap', () => {
    it('deve retornar dados para mapa de calor de qualidade de sinal', async () => {
      const res = await request(app)
        .get('/api/connectivity/heatmap');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('heatmap');
      expect(Array.isArray(res.body.data.heatmap)).toBeTruthy();
      
      // Verificar estrutura dos dados do mapa de calor
      if (res.body.data.heatmap.length > 0) {
        const heatmapItem = res.body.data.heatmap[0];
        expect(heatmapItem).toHaveProperty('latitude');
        expect(heatmapItem).toHaveProperty('longitude');
        expect(heatmapItem).toHaveProperty('intensity');
      }
    });
  });
});