const { app, request, setupTestDB, teardownTestDB, generateTestToken } = require('./setup');

describe('Testes de Integração - Chatbot', () => {
  let db;
  let userToken;
  let testMessageId;

  // Configurar banco de dados antes de todos os testes
  beforeAll(async () => {
    db = await setupTestDB();
    
    // Gerar token para testes
    userToken = await generateTestToken('user');
  });

  // Limpar banco após todos os testes
  afterAll(async () => {
    await teardownTestDB();
  });

  describe('POST /api/chat/message', () => {
    it('deve processar mensagem e retornar resposta do chatbot', async () => {
      const res = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          message: 'Como funcionam os AmaCoins?',
          context_type: 'general'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('userMessage');
      expect(res.body.data).toHaveProperty('botMessage');
      expect(res.body.data.userMessage.message).toBe('Como funcionam os AmaCoins?');
      expect(res.body.data.botMessage.is_from_user).toBe(false);
      
      // Guardar ID da mensagem do bot para testes de feedback
      testMessageId = res.body.data.botMessage.id;
    });

    it('deve rejeitar mensagem sem autenticação', async () => {
      const res = await request(app)
        .post('/api/chat/message')
        .send({
          message: 'Mensagem sem autenticação',
          context_type: 'general'
        });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('error');
    });

    it('deve validar dados da mensagem', async () => {
      // Enviando mensagem vazia
      const res = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          message: '',
          context_type: 'general'
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
    });

    it('deve processar contexto específico', async () => {
      // Verificar se há eventos para usar como contexto
      const events = await db('events').select('id').limit(1);
      
      if (events.length > 0) {
        const eventId = events[0].id;
        
        const res = await request(app)
          .post('/api/chat/message')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            message: 'Detalhes deste evento?',
            context_type: 'event',
            context_id: eventId
          });
        
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.userMessage.context_type).toBe('event');
        expect(res.body.data.userMessage.context_id).toBe(eventId);
      } else {
        // Skip test if no events found
        console.log('Pulando teste de contexto - nenhum evento encontrado');
        expect(true).toBeTruthy();
      }
    });
  });

  describe('GET /api/chat/history', () => {
    it('deve retornar histórico de mensagens do usuário', async () => {
      const res = await request(app)
        .get('/api/chat/history')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('messages');
      expect(Array.isArray(res.body.data.messages)).toBeTruthy();
      expect(res.body.data).toHaveProperty('pagination');
    });

    it('deve filtrar histórico por tipo de contexto', async () => {
      const res = await request(app)
        .get('/api/chat/history')
        .set('Authorization', `Bearer ${userToken}`)
        .query({ context_type: 'general' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      
      // Verificar que todas as mensagens têm o contexto correto
      if (res.body.data.messages.length > 0) {
        res.body.data.messages.forEach(message => {
          expect(message.context_type).toBe('general');
        });
      }
    });

    it('deve rejeitar acesso sem autenticação', async () => {
      const res = await request(app)
        .get('/api/chat/history');
      
      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('error');
    });
  });

  describe('GET /api/chat/context/:entity_type/:entity_id', () => {
    it('deve retornar informações contextuais para um evento', async () => {
      // Verificar se há eventos para testar
      const events = await db('events').select('id').limit(1);
      
      if (events.length > 0) {
        const eventId = events[0].id;
        
        const res = await request(app)
          .get(`/api/chat/context/event/${eventId}`)
          .set('Authorization', `Bearer ${userToken}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('context');
        expect(res.body.data.context).toHaveProperty('name');
        expect(res.body.data.context).toHaveProperty('type', 'event');
      } else {
        // Skip test if no events found
        console.log('Pulando teste de contexto - nenhum evento encontrado');
        expect(true).toBeTruthy();
      }
    });

    it('deve retornar erro para tipo de entidade inválido', async () => {
      const res = await request(app)
        .get('/api/chat/context/invalid_type/1')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('inválido');
    });

    it('deve retornar erro para entidade inexistente', async () => {
      const res = await request(app)
        .get('/api/chat/context/event/9999')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.statusCode).toBe(404);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('não encontrado');
    });
  });

  describe('POST /api/chat/feedback', () => {
    it('deve enviar feedback sobre resposta do chatbot', async () => {
      // Verificar se temos um ID de mensagem para testar
      if (!testMessageId) {
        // Criar uma mensagem para testar
        const chatRes = await request(app)
          .post('/api/chat/message')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            message: 'Mensagem para feedback',
            context_type: 'general'
          });
        
        testMessageId = chatRes.body.data.botMessage.id;
      }
      
      const res = await request(app)
        .post('/api/chat/feedback')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          message_id: testMessageId,
          is_helpful: true,
          feedback_text: 'Resposta muito útil e clara'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.message).toContain('sucesso');
    });

    it('deve validar ID da mensagem', async () => {
      const res = await request(app)
        .post('/api/chat/feedback')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          message_id: 9999, // ID inexistente
          is_helpful: true,
          feedback_text: 'Feedback para mensagem inexistente'
        });
      
      expect(res.statusCode).toBe(404);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('não encontrada');
    });

    it('deve rejeitar feedback para mensagem do usuário', async () => {
      // Buscar uma mensagem do usuário
      const userMessages = await db('chat_messages')
        .where({ is_from_user: true })
        .select('id')
        .limit(1);
      
      if (userMessages.length > 0) {
        const userMessageId = userMessages[0].id;
        
        const res = await request(app)
          .post('/api/chat/feedback')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            message_id: userMessageId,
            is_helpful: true,
            feedback_text: 'Este feedback não deveria funcionar'
          });
        
        expect(res.statusCode).toBe(400);
        expect(res.body.status).toBe('error');
        expect(res.body.message).toContain('mensagens do chatbot');
      } else {
        // Skip test if no user messages found
        console.log('Pulando teste - nenhuma mensagem de usuário encontrada');
        expect(true).toBeTruthy();
      }
    });
  });
});