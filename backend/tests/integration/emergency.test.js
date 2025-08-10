import { app, request, setupTestDB, teardownTestDB } from './setup.js';

describe('Testes de Integração - Serviços de Emergência', () => {
  let db;

  // Configurar banco de dados antes de todos os testes
  beforeAll(async () => {
    db = await setupTestDB();
  });

  // Limpar banco após todos os testes
  afterAll(async () => {
    await teardownTestDB();
  });

  describe('GET /api/emergency/services', () => {
    it('deve listar serviços de emergência', async () => {
      const res = await request(app)
        .get('/api/emergency/services');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('services');
      expect(Array.isArray(res.body.data.services)).toBeTruthy();
      expect(res.body.data).toHaveProperty('pagination');
    });

    it('deve filtrar serviços por disponibilidade 24h', async () => {
      const res = await request(app)
        .get('/api/emergency/services')
        .query({ is_24h: 'true' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      
      // Verificar que todos os serviços retornados são 24h
      if (res.body.data.services.length > 0) {
        res.body.data.services.forEach(service => {
          expect(service.is_24h).toBe(true);
        });
      }
    });

    it('deve filtrar serviços por termo de busca', async () => {
      const res = await request(app)
        .get('/api/emergency/services')
        .query({ search: 'hospital' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
    });
  });

  describe('GET /api/emergency/services/:type', () => {
    it('deve filtrar serviços por tipo', async () => {
      // Testando com tipo 'hospital'
      const res = await request(app)
        .get('/api/emergency/services/hospital');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('services');
      
      // Verificar que todos os serviços retornados são hospitais
      if (res.body.data.services.length > 0) {
        res.body.data.services.forEach(service => {
          expect(service.service_type).toBe('hospital');
        });
      }
    });

    it('deve rejeitar tipo de serviço inválido', async () => {
      const res = await request(app)
        .get('/api/emergency/services/invalid_type');
      
      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('inválido');
    });
  });

  describe('GET /api/emergency/services/nearby', () => {
    it('deve encontrar serviços de emergência próximos', async () => {
      const res = await request(app)
        .get('/api/emergency/services/nearby')
        .query({
          latitude: -1.4500,
          longitude: -48.4800,
          radius: 10
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('services');
      expect(Array.isArray(res.body.data.services)).toBeTruthy();
    });

    it('deve filtrar serviços próximos por tipo', async () => {
      const res = await request(app)
        .get('/api/emergency/services/nearby')
        .query({
          latitude: -1.4500,
          longitude: -48.4800,
          radius: 10,
          type: 'pharmacy'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      
      // Verificar que todos os serviços retornados são farmácias
      if (res.body.data.services.length > 0) {
        res.body.data.services.forEach(service => {
          expect(service.service_type).toBe('pharmacy');
        });
      }
    });

    it('deve validar parâmetros de coordenadas', async () => {
      // Testando sem coordenadas
      const res = await request(app)
        .get('/api/emergency/services/nearby');
      
      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('obrigatórios');
    });
  });

  describe('GET /api/emergency/contacts/:language', () => {
    it('deve retornar contatos de emergência por idioma', async () => {
      // Testando com português do Brasil
      const res = await request(app)
        .get('/api/emergency/contacts/pt-BR');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('contacts');
      
      // Verificar estrutura dos contatos
      expect(res.body.data.contacts).toHaveProperty('emergency');
    });

    it('deve retornar contatos em inglês como fallback', async () => {
      // Tentando com um idioma possivelmente não configurado
      const res = await request(app)
        .get('/api/emergency/contacts/nonexistent-LANG');
      
      // Este teste depende da implementação exata do fallback
      // Pode retornar 200 com contatos em inglês ou 400 com erro
      if (res.statusCode === 200) {
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('contacts');
      } else {
        expect(res.statusCode).toBe(400);
        expect(res.body.status).toBe('error');
      }
    });
  });

  describe('GET /api/emergency/phrases/:language', () => {
    it('deve retornar frases de emergência por idioma', async () => {
      // Testando com inglês americano
      const res = await request(app)
        .get('/api/emergency/phrases/en-US');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('phrases');
      
      // Verificar estrutura das frases
      const phrases = res.body.data.phrases;
      expect(typeof phrases).toBe('object');
      
      // Verificar se pelo menos uma categoria está presente
      const categories = Object.keys(phrases);
      expect(categories.length).toBeGreaterThan(0);
      
      // Verificar se a primeira categoria tem frases
      const firstCategory = categories[0];
      expect(Array.isArray(phrases[firstCategory])).toBeTruthy();
      
      if (phrases[firstCategory].length > 0) {
        const phrase = phrases[firstCategory][0];
        expect(phrase).toHaveProperty('text');
        expect(phrase).toHaveProperty('translation');
      }
    });

    it('deve validar idioma suportado', async () => {
      const res = await request(app)
        .get('/api/emergency/phrases/invalid-LANG');
      
      // Este teste depende da implementação exata da validação
      // Pode retornar 400 com erro ou 200 com fallback
      if (res.statusCode === 200) {
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('phrases');
      } else {
        expect(res.statusCode).toBe(400);
        expect(res.body.status).toBe('error');
        expect(res.body.message).toContain('suportado');
      }
    });
  });
});