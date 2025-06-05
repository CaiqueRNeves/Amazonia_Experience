import User from '../models/User.js';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { ValidationError, UnauthorizedError } from '../middleware/error.js';

/**
 * Serviço responsável pela autenticação e autorização de usuários
 */
class AuthService {
  /**
   * Registra um novo usuário
   * @param {Object} userData - Dados do usuário a ser registrado
   * @returns {Object} - Usuário registrado e tokens de autenticação
   */
  async register(userData) {
    // Verificar se o email já está em uso
    const existingUser = await User.findByEmail(userData.email);
    if (existingUser) {
      throw new ValidationError('Este email já está registrado');
    }

    // Criar novo usuário
    const newUser = await User.create({
      ...userData,
      role: 'user', // Por padrão, todos os registros são usuários comuns
      amacoins: 0,
      quiz_points: 0
    });

    // Gerar tokens
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role
    });

    const refreshToken = generateRefreshToken({
      id: newUser.id
    });

    // Retornar dados do usuário e tokens (sem senha)
    const { password, ...userWithoutPassword } = newUser;
    
    return {
      user: userWithoutPassword,
      token,
      refreshToken
    };
  }

  /**
   * Autentica um usuário
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @returns {Object} - Usuário autenticado e tokens de autenticação
   */
  async login(email, password) {
    // Verificar se o usuário existe
    const user = await User.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Email ou senha incorretos');
    }

    // Verificar senha
    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Email ou senha incorretos');
    }

    // Gerar tokens
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    const refreshToken = generateRefreshToken({
      id: user.id
    });

    // Retornar dados do usuário e tokens (sem senha)
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      token,
      refreshToken
    };
  }

  /**
   * Obtém dados do usuário atual
   * @param {number} userId - ID do usuário
   * @returns {Object} - Dados do usuário
   */
  async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new UnauthorizedError('Usuário não encontrado');
    }

    // Não retornar a senha
    const { password, ...userWithoutPassword } = user;
    
    return userWithoutPassword;
  }

  /**
   * Renova token de acesso usando refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Object} - Novo token de acesso
   */
  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token não fornecido');
    }

    // Verificar refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new UnauthorizedError('Refresh token inválido ou expirado');
    }

    // Buscar usuário pelo ID decodificado
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new UnauthorizedError('Usuário não encontrado');
    }

    // Gerar novo token de acesso
    const newToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return { token: newToken };
  }

  /**
   * Altera a senha de um usuário
   * @param {number} userId - ID do usuário
   * @param {string} currentPassword - Senha atual
   * @param {string} newPassword - Nova senha
   * @returns {boolean} - Sucesso da operação
   */
  async changePassword(userId, currentPassword, newPassword) {
    // Buscar usuário
    const user = await User.findById(userId);
    if (!user) {
      throw new UnauthorizedError('Usuário não encontrado');
    }

    // Verificar senha atual
    const isPasswordValid = await User.verifyPassword(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new ValidationError('Senha atual incorreta');
    }

    // Atualizar senha
    await User.update(userId, { password: newPassword });

    return true;
  }
}

export default new AuthService();
