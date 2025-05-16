const User = require('../models/User');
const { ValidationError, NotFoundError, ForbiddenError } = require('../middleware/error');

/**
 * Serviço responsável por operações relacionadas a usuários
 */
class UserService {
  /**
   * Obtém perfil do usuário
   * @param {number} userId - ID do usuário
   * @returns {Object} - Perfil do usuário
   */
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    // Não retornar a senha
    const { password, ...userWithoutPassword } = user;
    
    // Converter preferências de notificação para objeto, se for string
    if (typeof userWithoutPassword.notification_preferences === 'string') {
      try {
        userWithoutPassword.notification_preferences = JSON.parse(userWithoutPassword.notification_preferences);
      } catch (error) {
        console.error('Erro ao desserializar preferências de notificação:', error);
        userWithoutPassword.notification_preferences = {
          events: true,
          rewards: true,
          quizzes: true,
          emergency: true
        };
      }
    }
    
    return userWithoutPassword;
  }

  /**
   * Atualiza perfil do usuário
   * @param {number} userId - ID do usuário
   * @param {Object} userData - Novos dados do usuário
   * @returns {Object} - Perfil atualizado
   */
  async updateProfile(userId, userData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    // Campos que o usuário não pode alterar diretamente
    const forbiddenFields = ['email', 'password', 'role', 'amacoins', 'quiz_points'];
    const hasAttemptedForbiddenFields = Object.keys(userData).some(field => forbiddenFields.includes(field));
    
    if (hasAttemptedForbiddenFields) {
      throw new ForbiddenError('Não é permitido atualizar alguns dos campos fornecidos');
    }

    // Campos válidos para atualização
    const validFields = ['name', 'nationality'];
    const updateData = {};
    
    // Filtrar campos válidos
    for (const field of validFields) {
      if (userData[field] !== undefined) {
        updateData[field] = userData[field];
      }
    }
    
    const updatedUser = await User.update(userId, updateData);
    
    // Não retornar a senha
    const { password, ...userWithoutPassword } = updatedUser;
    
    return userWithoutPassword;
  }

  /**
   * Obtém saldo de AmaCoins do usuário
   * @param {number} userId - ID do usuário
   * @returns {Object} - Saldo de AmaCoins
   */
  async getAmacoins(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    return {
      amacoins: user.amacoins
    };
  }

  /**
   * Obtém histórico de visitas do usuário
   * @param {number} userId - ID do usuário
   * @param {number} page - Página atual
   * @param {number} limit - Limite por página
   * @returns {Array} - Histórico de visitas
   */
  async getVisitHistory(userId, page = 1, limit = 10) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    return User.getVisitHistory(userId, page, limit);
  }

  /**
   * Atualiza preferências de notificação do usuário
   * @param {number} userId - ID do usuário
   * @param {Object} preferences - Novas preferências
   * @returns {Object} - Preferências atualizadas
   */
  async updateNotificationPreferences(userId, preferences) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    // Validar preferências
    const validPreferences = ['events', 'rewards', 'quizzes', 'emergency'];
    const invalidKeys = Object.keys(preferences).filter(key => !validPreferences.includes(key));
    
    if (invalidKeys.length > 0) {
      throw new ValidationError(`Preferências inválidas: ${invalidKeys.join(', ')}`);
    }

    // Buscar preferências atuais para mesclar
    let currentPreferences = {};
    
    if (typeof user.notification_preferences === 'string') {
      try {
        currentPreferences = JSON.parse(user.notification_preferences);
      } catch (error) {
        console.error('Erro ao desserializar preferências de notificação:', error);
        currentPreferences = {
          events: true,
          rewards: true,
          quizzes: true,
          emergency: true
        };
      }
    } else if (typeof user.notification_preferences === 'object') {
      currentPreferences = user.notification_preferences;
    }
    
    // Mesclar preferências atuais com as novas
    const updatedPreferences = {
      ...currentPreferences,
      ...preferences
    };

    await User.updateNotificationPreferences(userId, updatedPreferences);

    return {
      notification_preferences: updatedPreferences
    };
  }

  /**
   * Obtém alertas do usuário
   * @param {number} userId - ID do usuário
   * @param {number} page - Página atual
   * @param {number} limit - Limite por página
   * @param {boolean} includeRead - Incluir alertas já lidos
   * @returns {Array} - Lista de alertas
   */
  async getAlerts(userId, page = 1, limit = 10, includeRead = false) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    return User.getAlerts(userId, page, limit, includeRead);
  }

  /**
   * Marca um alerta como lido
   * @param {number} userId - ID do usuário
   * @param {number} alertId - ID do alerta
   * @returns {boolean} - Sucesso da operação
   */
  async markAlertAsRead(userId, alertId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    // Verificar se o alerta existe e pertence ao usuário
    const alert = await db('user_alerts').where({ id: alertId, user_id: userId }).first();
    if (!alert) {
      throw new NotFoundError('Alerta não encontrado');
    }

    // Marcar como lido
    await db('user_alerts').where({ id: alertId }).update({ is_read: true });

    return true;
  }

  /**
   * Obtém histórico de resgates de recompensas do usuário
   * @param {number} userId - ID do usuário
   * @param {number} page - Página atual
   * @param {number} limit - Limite por página
   * @returns {Array} - Histórico de resgates
   */
  async getRedemptionHistory(userId, page = 1, limit = 10) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    return User.getRedemptionHistory(userId, page, limit);
  }

  /**
   * Lista todos os usuários (admin)
   * @param {number} page - Página atual
   * @param {number} limit - Limite por página
   * @returns {Array} - Lista de usuários
   */
  async getAllUsers(page = 1, limit = 10) {
    return User.findAll(page, limit);
  }

  /**
   * Atualiza função de um usuário (admin)
   * @param {number} userId - ID do usuário
   * @param {string} role - Nova função
   * @returns {Object} - Usuário atualizado
   */
  async updateUserRole(userId, role) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    // Validar função
    const validRoles = ['user', 'partner', 'admin'];
    if (!validRoles.includes(role)) {
      throw new ValidationError('Função inválida');
    }

    const updatedUser = await User.update(userId, { role });
    
    // Não retornar a senha
    const { password, ...userWithoutPassword } = updatedUser;
    
    return userWithoutPassword;
  }
}

module.exports = new UserService();