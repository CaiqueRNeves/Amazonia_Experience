/**
 * Utilitários para controle de permissões baseadas em funções de usuário
 * Permite verificar se um usuário tem permissão para acessar recursos
 */
import { USER_ROLES } from './constants';

/**
 * Verifica se o usuário tem uma função específica
 * @param {Object} user - Objeto do usuário
 * @param {string|Array} role - Função ou array de funções a verificar
 * @returns {boolean} True se o usuário tiver a função específica
 */
export const hasRole = (user, role) => {
  if (!user || !user.role) return false;
  
  if (Array.isArray(role)) {
    return role.includes(user.role);
  }
  
  return user.role === role;
};

/**
 * Verifica se o usuário é um administrador
 * @param {Object} user - Objeto do usuário
 * @returns {boolean} True se o usuário for administrador
 */
export const isAdmin = (user) => {
  return hasRole(user, USER_ROLES.ADMIN);
};

/**
 * Verifica se o usuário é um parceiro
 * @param {Object} user - Objeto do usuário
 * @returns {boolean} True se o usuário for parceiro
 */
export const isPartner = (user) => {
  return hasRole(user, USER_ROLES.PARTNER);
};

/**
 * Verifica se o usuário é um usuário comum
 * @param {Object} user - Objeto do usuário
 * @returns {boolean} True se o usuário for usuário comum
 */
export const isRegularUser = (user) => {
  return hasRole(user, USER_ROLES.USER);
};

/**
 * Verifica se o usuário pode editar um recurso (admin ou dono do recurso)
 * @param {Object} user - Objeto do usuário
 * @param {Object} resource - Recurso a ser editado
 * @param {string} ownerField - Campo que indica o proprietário do recurso (padrão: 'user_id')
 * @returns {boolean} True se o usuário puder editar o recurso
 */
export const canEdit = (user, resource, ownerField = 'user_id') => {
  if (!user || !resource) return false;
  
  // Administradores podem editar qualquer recurso
  if (isAdmin(user)) return true;
  
  // Usuários podem editar seus próprios recursos
  return resource[ownerField] === user.id;
};

/**
 * Verifica se o usuário pode gerenciar parceiros (admin ou parceiro)
 * @param {Object} user - Objeto do usuário
 * @returns {boolean} True se o usuário puder gerenciar parceiros
 */
export const canManagePartners = (user) => {
  return hasRole(user, [USER_ROLES.ADMIN, USER_ROLES.PARTNER]);
};

/**
 * Verifica se o usuário pode verificar check-ins (admin ou parceiro)
 * @param {Object} user - Objeto do usuário
 * @returns {boolean} True se o usuário puder verificar check-ins
 */
export const canVerifyCheckIns = (user) => {
  return hasRole(user, [USER_ROLES.ADMIN, USER_ROLES.PARTNER]);
};

/**
 * Verifica se o usuário pode criar eventos (admin ou parceiro)
 * @param {Object} user - Objeto do usuário
 * @returns {boolean} True se o usuário puder criar eventos
 */
export const canCreateEvents = (user) => {
  return hasRole(user, [USER_ROLES.ADMIN, USER_ROLES.PARTNER]);
};

/**
 * Verifica se o usuário pode criar recompensas (admin ou parceiro)
 * @param {Object} user - Objeto do usuário
 * @returns {boolean} True se o usuário puder criar recompensas
 */
export const canCreateRewards = (user) => {
  return hasRole(user, [USER_ROLES.ADMIN, USER_ROLES.PARTNER]);
};

/**
 * Verifica se o usuário pode gerenciar quizzes (apenas admin)
 * @param {Object} user - Objeto do usuário
 * @returns {boolean} True se o usuário puder gerenciar quizzes
 */
export const canManageQuizzes = (user) => {
  return isAdmin(user);
};

/**
 * Verifica se o usuário pode gerenciar serviços de emergência (apenas admin)
 * @param {Object} user - Objeto do usuário
 * @returns {boolean} True se o usuário puder gerenciar serviços de emergência
 */
export const canManageEmergencyServices = (user) => {
  return isAdmin(user);
};

/**
 * Verifica se o usuário tem AmaCoins suficientes para resgatar uma recompensa
 * @param {Object} user - Objeto do usuário
 * @param {Object|number} reward - Objeto da recompensa ou custo em AmaCoins
 * @returns {boolean} True se o usuário tiver AmaCoins suficientes
 */
export const hasEnoughAmacoins = (user, reward) => {
  if (!user) return false;
  
  const cost = typeof reward === 'object' ? reward.amacoins_cost : reward;
  
  return user.amacoins >= cost;
};

export default {
  hasRole,
  isAdmin,
  isPartner,
  isRegularUser,
  canEdit,
  canManagePartners,
  canVerifyCheckIns,
  canCreateEvents,
  canCreateRewards,
  canManageQuizzes,
  canManageEmergencyServices,
  hasEnoughAmacoins
};