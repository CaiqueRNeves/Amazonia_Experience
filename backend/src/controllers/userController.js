const User = require('../models/User');
const { ValidationError, NotFoundError, ForbiddenError } = require('../middleware/error');

// Obter perfil do usuário
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
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

// Atualizar perfil do usuário
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, nationality } = req.body;

    // Campos que o usuário não pode alterar diretamente
    const forbiddenFields = ['email', 'password', 'role', 'amacoins', 'quiz_points'];
    const hasAttemptedForbiddenFields = Object.keys(req.body).some(field => forbiddenFields.includes(field));
    
    if (hasAttemptedForbiddenFields) {
      throw new ForbiddenError('Não é permitido atualizar alguns dos campos fornecidos');
    }

    const updatedUser = await User.update(userId, { name, nationality });

    res.json({
      status: 'success',
      data: {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          nationality: updatedUser.nationality,
          role: updatedUser.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obter saldo de AmaCoins
exports.getAmacoins = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    res.json({
      status: 'success',
      data: {
        amacoins: user.amacoins
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obter histórico de visitas do usuário
exports.getVisits = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const visits = await User.getVisitHistory(userId, page, limit);

    res.json({
      status: 'success',
      data: {
        visits,
        pagination: {
          page,
          limit
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Atualizar preferências de notificação
exports.updateNotificationPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const preferences = req.body;

    // Validar preferências
    const validPreferences = ['events', 'rewards', 'quizzes', 'emergency'];
    const invalidKeys = Object.keys(preferences).filter(key => !validPreferences.includes(key));
    
    if (invalidKeys.length > 0) {
      throw new ValidationError(`Preferências inválidas: ${invalidKeys.join(', ')}`);
    }

    // Buscar preferências atuais para mesclar
    const user = await User.findById(userId);
    const currentPreferences = JSON.parse(user.notification_preferences);
    
    // Mesclar preferências atuais com as novas
    const updatedPreferences = {
      ...currentPreferences,
      ...preferences
    };

    await User.updateNotificationPreferences(userId, updatedPreferences);

    res.json({
      status: 'success',
      data: {
        notification_preferences: updatedPreferences
      }
    });
  } catch (error) {
    next(error);
  }
};