import jwt from 'jsonwebtoken';
import authService from '../../src/services/authService.js';
import User from '../../src/models/User.js';

// Mock do modelo User
jest.mock('../../src/models/User.js');

// Mock do módulo jwt
jest.mock('jsonwebtoken');

// Mock do módulo bcrypt
jest.mock('bcrypt');


describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      // Mock de dados
      const userData = {
        name: 'Teste User',
        email: 'teste@example.com',
        password: 'password123',
        nationality: 'Brasil'
      };

      // Mock da função findByEmail retornando null (usuário não existe)
      User.findByEmail.mockResolvedValue(null);

      // Mock da função create retornando o usuário criado
      User.create.mockResolvedValue({
        id: 1,
        ...userData,
        password: 'hashed_password', // A senha real estaria hashed
        role: 'user',
        amacoins: 0,
        quiz_points: 0
      });

      // Mock do jwt.sign
      jwt.sign.mockReturnValueOnce('mock_token');
      jwt.sign.mockReturnValueOnce('mock_refresh_token');

      // Executar o método
      const result = await authService.register(userData);

      // Verificações
      expect(User.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(User.create).toHaveBeenCalledWith({
        ...userData,
        role: 'user',
        amacoins: 0,
        quiz_points: 0
      });
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token', 'mock_token');
      expect(result).toHaveProperty('refreshToken', 'mock_refresh_token');
      expect(result.user).not.toHaveProperty('password'); // A senha não deve ser retornada
    });

    it('deve lançar erro se o email já estiver em uso', async () => {
      // Mock de dados
      const userData = {
        name: 'Teste User',
        email: 'existing@example.com',
        password: 'password123'
      };

      // Mock da função findByEmail retornando um usuário existente
      User.findByEmail.mockResolvedValue({
        id: 1,
        email: 'existing@example.com'
      });

      // Executar o método e verificar se o erro é lançado
      await expect(authService.register(userData)).rejects.toThrow('Este email já está registrado');
      expect(User.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(User.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('deve fazer login com sucesso com credenciais válidas', async () => {
      // Mock de dados
      const email = 'user@example.com';
      const password = 'password123';

      // Mock da função findByEmail retornando um usuário
      User.findByEmail.mockResolvedValue({
        id: 1,
        email,
        password: 'hashed_password',
        role: 'user',
        name: 'Test User'
      });

      // Mock da função verifyPassword retornando true
      User.verifyPassword.mockResolvedValue(true);

      // Mock do jwt.sign
      jwt.sign.mockReturnValueOnce('mock_token');
      jwt.sign.mockReturnValueOnce('mock_refresh_token');

      // Executar o método
      const result = await authService.login(email, password);

      // Verificações
      expect(User.findByEmail).toHaveBeenCalledWith(email);
      expect(User.verifyPassword).toHaveBeenCalledWith(password, 'hashed_password');
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token', 'mock_token');
      expect(result).toHaveProperty('refreshToken', 'mock_refresh_token');
      expect(result.user).not.toHaveProperty('password'); // A senha não deve ser retornada
    });

    it('deve lançar erro se o usuário não existir', async () => {
      // Mock da função findByEmail retornando null
      User.findByEmail.mockResolvedValue(null);

      // Executar o método e verificar se o erro é lançado
      await expect(authService.login('nonexistent@example.com', 'password123')).rejects.toThrow('Email ou senha incorretos');
      expect(User.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
      expect(User.verifyPassword).not.toHaveBeenCalled();
    });

    it('deve lançar erro se a senha estiver incorreta', async () => {
      // Mock da função findByEmail retornando um usuário
      User.findByEmail.mockResolvedValue({
        id: 1,
        email: 'user@example.com',
        password: 'hashed_password'
      });

      // Mock da função verifyPassword retornando false
      User.verifyPassword.mockResolvedValue(false);

      // Executar o método e verificar se o erro é lançado
      await expect(authService.login('user@example.com', 'wrong_password')).rejects.toThrow('Email ou senha incorretos');
      expect(User.findByEmail).toHaveBeenCalledWith('user@example.com');
      expect(User.verifyPassword).toHaveBeenCalledWith('wrong_password', 'hashed_password');
    });
  });
});