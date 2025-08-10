import userService from '../../src/services/userService.js';
import User from '../../src/models/User.js';

// Mock do modelo User
jest.mock('../../src/models/User.js');

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('deve retornar o perfil do usuário sem a senha', async () => {
      // Mock do usuário retornado
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password', // Não deve ser retornado
        role: 'user',
        amacoins: 100,
        quiz_points: 50,
        notification_preferences: JSON.stringify({
          events: true,
          rewards: true,
          quizzes: false,
          emergency: true
        }),
        created_at: new Date()
      };

      // Mock da função findById
      User.findById.mockResolvedValue(mockUser);

      // Executar o método
      const result = await userService.getProfile(1);

      // Verificações
      expect(User.findById).toHaveBeenCalledWith(1);
      expect(result).not.toHaveProperty('password'); // A senha não deve ser retornada
      expect(result).toHaveProperty('name', 'Test User');
      expect(result).toHaveProperty('email', 'test@example.com');
      expect(result).toHaveProperty('amacoins', 100);
      expect(result).toHaveProperty('notification_preferences');
      expect(typeof result.notification_preferences).toBe('object'); // Deve ser um objeto, não uma string JSON
    });

    it('deve lançar erro se o usuário não for encontrado', async () => {
      // Mock da função findById retornando null
      User.findById.mockResolvedValue(null);

      // Executar o método e verificar se o erro é lançado
      await expect(userService.getProfile(999)).rejects.toThrow('Usuário não encontrado');
      expect(User.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('updateProfile', () => {
    it('deve atualizar corretamente os campos permitidos', async () => {
      // Mock do usuário existente
      const existingUser = {
        id: 1,
        name: 'Old Name',
        email: 'test@example.com',
        nationality: 'Old Nationality',
        password: 'hashed_password',
        role: 'user',
        amacoins: 100
      };

      // Dados para atualização
      const updateData = {
        name: 'New Name',
        nationality: 'New Nationality'
      };

      // Mock da função findById
      User.findById.mockResolvedValue(existingUser);

      // Mock da função update
      User.update.mockResolvedValue({
        ...existingUser,
        ...updateData
      });

      // Executar o método
      const result = await userService.updateProfile(1, updateData);

      // Verificações
      expect(User.findById).toHaveBeenCalledWith(1);
      expect(User.update).toHaveBeenCalledWith(1, updateData);
      expect(result).toHaveProperty('name', 'New Name');
      expect(result).toHaveProperty('nationality', 'New Nationality');
      expect(result).not.toHaveProperty('password'); // A senha não deve ser retornada
    });

    it('deve rejeitar campos não permitidos para atualização', async () => {
      // Mock do usuário existente
      const existingUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        amacoins: 100
      };

      // Dados para atualização com campos não permitidos
      const updateData = {
        name: 'New Name',
        email: 'new@example.com', // Não deve ser permitido
        role: 'admin', // Não deve ser permitido
        amacoins: 500 // Não deve ser permitido
      };

      // Mock da função findById
      User.findById.mockResolvedValue(existingUser);

      // Executar o método e verificar se o erro é lançado
      await expect(userService.updateProfile(1, updateData)).rejects.toThrow('Não é permitido atualizar alguns dos campos fornecidos');
      expect(User.findById).toHaveBeenCalledWith(1);
      expect(User.update).not.toHaveBeenCalled();
    });
  });
});