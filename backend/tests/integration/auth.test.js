import { app, request, setupTestDB, teardownTestDB } from './setup.js';
import jwt from 'jsonwebtoken';

describe('Testes de Integração - Autenticação', () => {
  let db;

  // Configurar banco de dados antes de todos os testes
  beforeAll(async () => {
    // Configurar variáveis de ambiente para teste
    process.env.JWT_SECRET = 'test_secret';
    process.env.JWT_EXPIRES_IN = '1h';
    process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
    process.env.JWT_REFRESH_EXPIRES_IN = '1d';
    
    db = await setupTestDB();
  });

  // Limpar banco após todos os testes
  afterAll(async () => {
    await teardownTestDB();
  });

  describe('POST /api/auth/register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Novo Usuário',
          email: 'novo@example.com',
          password: 'senha123',
          nationality: 'Brasil'
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user.email).toBe('novo@example.com');
      expect(res.body.data.user.role).toBe('user');
      // Verificar que não retorna a senha
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('deve retornar erro ao registrar com email já existente', async () => {
      // Primeiro, inserir um usuário no banco
        const passwordHash = 'hashed_testpassword';
      await db('users').insert({
        name: 'Usuário Existente',
        email: 'existente@example.com',
        password: passwordHash,
        role: 'user'
      });
      
      // Tentar registrar com o mesmo email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Outro Usuário',
          email: 'existente@example.com',
          password: 'senha123'
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('já está registrado');
    });

    it('deve validar campos obrigatórios no registro', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          // Faltando name e password
          email: 'incompleto@example.com'
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Limpar usuários antes de cada teste
      await db('users').where('email', 'login@example.com').delete();
      
      // Inserir usuário para teste de login
      const passwordHash = 'hashed_senha123';
      await db('users').insert({
        name: 'Usuário Login',
        email: 'login@example.com',
        password: passwordHash,
        role: 'user'
      });
    });

    it('deve fazer login com sucesso', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'senha123'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user.email).toBe('login@example.com');
    });

    it('deve rejeitar login com credenciais inválidas', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'senha_errada'
        });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('Email ou senha incorretos');
    });
  });

  describe('GET /api/auth/me', () => {
    let token;
    
    beforeEach(async () => {
      // Limpar usuários antes de cada teste
      await db('users').where('email', 'me@example.com').delete();
      
      // Inserir usuário para teste
      const passwordHash = 'hashed_senha123';
      await db('users').insert({
        id: 999,
        name: 'Usuário Me',
        email: 'me@example.com',
        password: passwordHash,
        role: 'user'
      });
      
      // Gerar token para o usuário
      token = jwt.sign(
        { id: 999, email: 'me@example.com', role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
    });

    it('deve retornar dados do usuário autenticado', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user.email).toBe('me@example.com');
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('deve rejeitar acesso sem token', async () => {
      const res = await request(app)
        .get('/api/auth/me');
      
      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('error');
    });

    it('deve rejeitar acesso com token inválido', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer token_invalido');
      
      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('error');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken;
    
    beforeEach(async () => {
      // Gerar refresh token para teste
      refreshToken = jwt.sign(
        { id: 2 },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
      );
    });

    it('deve gerar novo token de acesso com refresh token válido', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('token');
    });

    it('deve rejeitar refresh token inválido', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'token_invalido' });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('error');
    });
  });
});