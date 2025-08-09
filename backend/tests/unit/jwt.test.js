import jwt from 'jsonwebtoken';
import { generateToken, generateRefreshToken, verifyToken, verifyRefreshToken } from '../../src/utils/jwt.js';

// Mock do módulo jsonwebtoken
jest.mock('jsonwebtoken');

describe('JWT Utility', () => {
  // Restaurar todos os mocks antes de cada teste
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configurar variáveis de ambiente para testes
    process.env.JWT_SECRET = 'test_jwt_secret';
    process.env.JWT_EXPIRES_IN = '1h';
    process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  });

  describe('generateToken', () => {
    it('deve chamar jwt.sign com os parâmetros corretos', () => {
      // Configurar o mock
      jwt.sign.mockReturnValue('mocked_token');
      
      // Payload de teste
      const payload = { id: 1, email: 'test@example.com', role: 'user' };
      
      // Executar a função
      const token = generateToken(payload);
      
      // Verificar o resultado
      expect(token).toBe('mocked_token');
      expect(jwt.sign).toHaveBeenCalledWith(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
    });
  });

  describe('generateRefreshToken', () => {
    it('deve chamar jwt.sign com os parâmetros corretos para refresh token', () => {
      // Configurar o mock
      jwt.sign.mockReturnValue('mocked_refresh_token');
      
      // Payload de teste
      const payload = { id: 1 };
      
      // Executar a função
      const refreshToken = generateRefreshToken(payload);
      
      // Verificar o resultado
      expect(refreshToken).toBe('mocked_refresh_token');
      expect(jwt.sign).toHaveBeenCalledWith(
        payload,
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
      );
    });
  });

  describe('verifyToken', () => {
    it('deve retornar o payload decodificado para um token válido', () => {
      // Payload de teste decodificado
      const decodedPayload = { 
        id: 1, 
        email: 'test@example.com', 
        role: 'user',
        iat: 1625097600,
        exp: 1625101200
      };
      
      // Configurar o mock para retornar o payload decodificado
      jwt.verify.mockReturnValue(decodedPayload);
      
      // Token de teste
      const token = 'valid_token';
      
      // Executar a função
      const result = verifyToken(token);
      
      // Verificar o resultado
      expect(result).toEqual(decodedPayload);
      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
    });

    it('deve retornar null para um token inválido', () => {
      // Configurar o mock para lançar um erro
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      // Token de teste inválido
      const token = 'invalid_token';
      
      // Executar a função
      const result = verifyToken(token);
      
      // Verificar o resultado
      expect(result).toBeNull();
      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
    });
  });

  describe('verifyRefreshToken', () => {
    it('deve retornar o payload decodificado para um refresh token válido', () => {
      // Payload de teste decodificado
      const decodedPayload = { 
        id: 1,
        iat: 1625097600,
        exp: 1625704800
      };
      
      // Configurar o mock para retornar o payload decodificado
      jwt.verify.mockReturnValue(decodedPayload);
      
      // Refresh token de teste
      const refreshToken = 'valid_refresh_token';
      
      // Executar a função
      const result = verifyRefreshToken(refreshToken);
      
      // Verificar o resultado
      expect(result).toEqual(decodedPayload);
      expect(jwt.verify).toHaveBeenCalledWith(refreshToken, process.env.JWT_REFRESH_SECRET);
    });

    it('deve retornar null para um refresh token inválido', () => {
      // Configurar o mock para lançar um erro
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid refresh token');
      });
      
      // Refresh token de teste inválido
      const refreshToken = 'invalid_refresh_token';
      
      // Executar a função
      const result = verifyRefreshToken(refreshToken);
      
      // Verificar o resultado
      expect(result).toBeNull();
      expect(jwt.verify).toHaveBeenCalledWith(refreshToken, process.env.JWT_REFRESH_SECRET);
    });
  });
});