const jwt = require('jsonwebtoken');
const { ValidationError, UnauthorizedError } = require('../middleware/error');
const bcrypt = require('bcrypt');
const User = require('../models/User');

/**
 * Serviço para gerenciamento de autenticação
 * Gerencia tokens, autenticação e autorização
 */
const authService = {
  /**
   * Gera um token JWT para autenticação
   * @param {Object} payload - Dados a serem incluídos no token
   * @returns {string} Token JWT
   */
  generateToken(payload) {
    return jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  },

  /**
   * Gera um token de refresh para renovar a autenticação
   * @param {Object} payload - Dados a serem incluídos no token
   * @returns {string} Token de refresh
   */
  generateRefreshToken(payload) {
    return jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );
  },

  /**
   * Verifica a validade de um token JWT
   * @param {string} token - Token JWT a ser verificado
   * @returns {Object|null} Payload decodificado ou null se inválido
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return null;
    }
  },

  /**
   * Verifica a validade de um token de refresh
   * @param {string} token - Token de refresh a ser verificado
   * @returns {Object|null} Payload decodificado ou null se inválido
   */
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return null;
    }
  },

  /**
   * Gera hash de senha usando bcrypt
   * @param {string} password - Senha a ser hasheada
   * @returns {Promise<string>} Hash da senha
   */
  async hashPassword(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  },

  /**
   * Verifica se uma senha corresponde ao hash armazenado
   * @param {string} password - Senha a ser verificada
   * @param {string} hash - Hash armazenado
   * @returns {Promise<boolean>} Verdadeiro se a senha corresponder
   */
  async verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
  },

  /**
   * Registra um novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Promise<Object>} Usuário registrado e tokens
   */
  async register(userData) {
    // Verificar se o email já está em uso
    const existingUser = await User.findByEmail(userData.email);
    if (existingUser) {
      throw new ValidationError('Este email já está registrado');
    }

    // Hash da senha
    const hashedPassword = await this.hashPassword(userData.password);

    // Criar novo usuário
    const newUser = await User.create({
      ...userData,
      password: hashedPassword,
      role: 'user', // Por padrão, todos os registros são usuários comuns
      amacoins: 0,
      quiz_points: 0
    });

    // Gerar tokens
    const token = this.generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role
    });

    const refreshToken = this.generateRefreshToken({
      id: newUser.id
    });

    // Não retornar a senha no objeto do usuário
    const { password, ...userWithoutPassword } = newUser;

    return {
      user: userWithoutPassword,
      token,
      refreshToken
    };
  },

  /**
   * Autentica um usuário com email e senha
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @returns {Promise<Object>} Usuário autenticado e tokens
   */
  async login(email, password) {
    // Verificar se o usuário existe
    const user = await User.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Email ou senha incorretos');
    }

    // Verificar senha
    const isPasswordValid = await this.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Email ou senha incorretos');
    }

    // Gerar tokens
    const token = this.generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    const refreshToken = this.generateRefreshToken({
      id: user.id
    });

    // Não retornar a senha no objeto do usuário
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      refreshToken
    };
  },

  /**
   * Atualiza o token de acesso usando o refresh token
   * @param {string} refreshToken - Token de refresh
   * @returns {Promise<Object>} Novo token de acesso
   */
  async refreshAccessToken(refreshToken) {
    // Verificar o refresh token
    const decoded = this.verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new UnauthorizedError('Refresh token inválido ou expirado');
    }

    // Buscar usuário pelo ID
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new UnauthorizedError('Usuário não encontrado');
    }

    // Gerar novo token de acesso
    const newToken = this.generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return { token: newToken };
  },

  /**
   * Altera a senha de um usuário
   * @param {number} userId - ID do usuário
   * @param {string} currentPassword - Senha atual
   * @param {string} newPassword - Nova senha
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async changePassword(userId, currentPassword, newPassword) {
    // Buscar usuário
    const user = await User.findById(userId);
    if (!user) {
      throw new UnauthorizedError('Usuário não encontrado');
    }

    // Verificar senha atual
    const isPasswordValid = await this.verifyPassword(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new ValidationError('Senha atual incorreta');
    }

    // Hash da nova senha
    const hashedPassword = await this.hashPassword(newPassword);

    // Atualizar senha
    await User.update(userId, { password: hashedPassword });

    return true;
  },

  /**
   * Verifica se um usuário tem uma função específica
   * @param {number} userId - ID do usuário
   * @param {string|string[]} roles - Função ou lista de funções a verificar
   * @returns {Promise<boolean>} Verdadeiro se o usuário tiver a função
   */
  async hasRole(userId, roles) {
    const user = await User.findById(userId);
    if (!user) {
      return false;
    }

    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }

    return user.role === roles;
  },

  /**
   * Decodifica um token JWT sem verificar a assinatura
   * Útil para debugging e logging
   * @param {string} token - Token JWT
   * @returns {Object|null} Payload decodificado ou null se inválido
   */
  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  },

  /**
   * Obtém o usuário associado a um token
   * @param {string} token - Token JWT
   * @returns {Promise<Object|null>} Dados do usuário ou null se inválido
   */
  async getUserFromToken(token) {
    const decoded = this.verifyToken(token);
    if (!decoded) {
      return null;
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return null;
    }

    // Não retornar a senha
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
};

module.exports = authService;