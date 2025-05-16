const User = require('../models/User');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { ValidationError, UnauthorizedError } = require('../middleware/error');

// Registrar novo usuário
exports.register = async (req, res, next) => {
  try {
    const { email, password, name, nationality } = req.body;

    // Verificar se o email já está em uso
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new ValidationError('Este email já está registrado');
    }

    // Criar novo usuário
    const newUser = await User.create({
      email,
      password,
      name,
      nationality,
      role: 'user', // Por padrão, todos os registros são usuários comuns
      amacoins: 0,
      quiz_points: 0
    });

    // Gerar token JWT
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role
    });

    // Gerar refresh token
    const refreshToken = generateRefreshToken({
      id: newUser.id
    });

    // Retornar dados do usuário e tokens
    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          nationality: newUser.nationality,
          role: newUser.role,
          amacoins: newUser.amacoins
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login de usuário
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

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

    // Gerar token JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    // Gerar refresh token
    const refreshToken = generateRefreshToken({
      id: user.id
    });

    // Retornar dados do usuário e tokens
    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          nationality: user.nationality,
          role: user.role,
          amacoins: user.amacoins
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obter dados do usuário atual
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new UnauthorizedError('Usuário não encontrado');
    }

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          nationality: user.nationality,
          role: user.role,
          amacoins: user.amacoins,
          quiz_points: user.quiz_points,
          notification_preferences: JSON.parse(user.notification_preferences),
          created_at: user.created_at
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Atualizar token de acesso usando refresh token
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
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

    res.json({
      status: 'success',
      data: {
        token: newToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// Alterar senha
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

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

    res.json({
      status: 'success',
      message: 'Senha atualizada com sucesso'
    });
  } catch (error) {
    next(error);
  }
};