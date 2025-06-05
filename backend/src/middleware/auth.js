import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from './error.js';

/**
 * Middleware de autenticação que verifica o token JWT
 * @param {Object} req - Objeto da requisição
 * @param {Object} res - Objeto da resposta
 * @param {Function} next - Função next do Express
 */
export const authMiddleware = (req, res, next) => {
  try {
    // Obter o cabeçalho de autorização
    const authHeader = req.headers.authorization;
    
    // Verificar se o cabeçalho foi fornecido
    if (!authHeader) {
      throw new UnauthorizedError('Token de autenticação não fornecido');
    }
    
    // Obter o token (formato: "Bearer <token>")
    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
      throw new UnauthorizedError('Formato de token inválido');
    }
    
    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme)) {
      throw new UnauthorizedError('Formato de token inválido');
    }
    
    // Verificar e decodificar o token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          throw new UnauthorizedError('Token expirado');
        }
        throw new UnauthorizedError('Token inválido');
      }
      
      // Adicionar o usuário decodificado à requisição
      req.user = decoded;
      return next();
    });
  } catch (error) {
    // Passar o erro para o middleware de tratamento de erros
    return next(error);
  }
};

/**
 * Middleware para verificar função do usuário
 * @param {Array<string>} roles - Array de funções permitidas
 * @returns {Function} Middleware que verifica a função do usuário
 */
export const checkRole = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Usuário não autenticado');
      }
      
      if (!roles.includes(req.user.role)) {
        throw new ForbiddenError('Acesso não autorizado para esta função');
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};