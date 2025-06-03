const request = require('supertest');
const app = require('../../src/app');

describe('Event Routes', () => {
  let authToken;
  
  // Obter token de autenticação antes dos testes
  beforeAll(async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@amazonia-experience.com',
        password: 'admin123'
      });
    
    authToken = response.body.data.token;
  });

  describe('GET /api/events', () => {
    it('should get events list', async () => {
      const response = await request(app).get('/api/events');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('events');
      expect(response.body.data).toHaveProperty('pagination');
    });
    
    it('should filter events by type', async () => {
      const response = await request(app)
        .get('/api/events')
        .query({ event_type: 'conference' });
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      
      // Verificar se todos os eventos retornados são do tipo solicitado
      if (response.body.data.events.length > 0) {
        const allConferenceType = response.body.data.events.every(
          event => event.event_type === 'conference'
        );
        expect(allConferenceType).toBe(true);
      }
    });
  });

  describe('GET /api/events/nearby', () => {
    it('should require latitude and longitude parameters', async () => {
      const response = await request(app).get('/api/events/nearby');
      
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
    
    it('should get nearby events with valid coordinates', async () => {
      const response = await request(app)
        .get('/api/events/nearby')
        .query({
          latitude: -1.4500,
          longitude: -48.4800,
          radius: 5
        });
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('events');
    });
  });

  describe('GET /api/events/ongoing', () => {
    it('should get ongoing events', async () => {
      const response = await request(app).get('/api/events/ongoing');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('events');
    });
  });

  describe('GET /api/events/:id', () => {
    it('should return 404 for non-existent event', async () => {
      const response = await request(app).get('/api/events/9999');
      
      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });
    
    it('should get event details for valid ID', async () => {
      // Primeiro, obter um ID de evento válido da lista
      const listResponse = await request(app).get('/api/events');
      const eventId = listResponse.body.data.events[0]?.id;
      
      if (eventId) {
        const response = await request(app).get(`/api/events/${eventId}`);
        
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.event.id).toBe(eventId);
      } else {
        // Pular teste se não houver eventos
        console.log('Skipping test: No events available');
      }
    });
  });

  describe('POST /api/events/checkin', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/events/checkin')
        .send({ event_id: 1 });
      
      expect(response.status).toBe(401);
    });
    
    it('should validate event_id', async () => {
      const response = await request(app)
        .post('/api/events/checkin')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});
      
      expect(response.status).toBe(400);
    });
    
    // Teste adicional: realizar check-in com sucesso
    // Observe que isto depende de dados específicos, pode ser necessário ajustar
    it('should allow check-in with valid event_id', async () => {
      // Procurar um evento válido para check-in
      const eventsResponse = await request(app).get('/api/events');
      const eventId = eventsResponse.body.data.events[0]?.id;
      
      if (eventId) {
        const response = await request(app)
          .post('/api/events/checkin')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ event_id: eventId });
        
        // Pode ser 201 para check-in bem-sucedido ou 400 se já fez check-in
        expect([201, 400]).toContain(response.status);
      } else {
        console.log('Skipping test: No events available for check-in');
      }
    });
  });
});