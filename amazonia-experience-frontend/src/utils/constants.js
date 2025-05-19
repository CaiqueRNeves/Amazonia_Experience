/**
 * Constantes utilizadas na aplicação
 * Centraliza valores que podem ser utilizados em múltiplos componentes
 */

/**
 * Configurações gerais da aplicação
 */
export const APP_CONFIG = {
  NAME: 'AmazôniaExperience',
  VERSION: '0.1.0',
  COPYRIGHT: `© ${new Date().getFullYear()} AmazôniaExperience - Todos os direitos reservados`,
  DEFAULT_LANGUAGE: 'pt-BR',
  SUPPORTED_LANGUAGES: ['pt-BR', 'en-US', 'es-ES', 'fr-FR']
};

/**
 * Tipos de eventos disponíveis
 */
export const EVENT_TYPES = {
  CONFERENCE: 'conference',
  PANEL: 'panel',
  WORKSHOP: 'workshop',
  EXHIBITION: 'exhibition',
  CULTURAL: 'cultural',
  SOCIAL: 'social'
};

/**
 * Mapeamento de tipos de eventos para suas traduções
 */
export const EVENT_TYPE_NAMES = {
  [EVENT_TYPES.CONFERENCE]: 'Conferência',
  [EVENT_TYPES.PANEL]: 'Painel',
  [EVENT_TYPES.WORKSHOP]: 'Workshop',
  [EVENT_TYPES.EXHIBITION]: 'Exposição',
  [EVENT_TYPES.CULTURAL]: 'Evento Cultural',
  [EVENT_TYPES.SOCIAL]: 'Evento Social'
};

/**
 * Tipos de locais disponíveis
 */
export const PLACE_TYPES = {
  TOURIST_SPOT: 'tourist_spot',
  RESTAURANT: 'restaurant',
  SHOP: 'shop',
  CULTURAL_VENUE: 'cultural_venue'
};

/**
 * Mapeamento de tipos de locais para suas traduções
 */
export const PLACE_TYPE_NAMES = {
  [PLACE_TYPES.TOURIST_SPOT]: 'Ponto Turístico',
  [PLACE_TYPES.RESTAURANT]: 'Restaurante',
  [PLACE_TYPES.SHOP]: 'Loja',
  [PLACE_TYPES.CULTURAL_VENUE]: 'Espaço Cultural'
};

/**
 * Tipos de recompensas disponíveis
 */
export const REWARD_TYPES = {
  PHYSICAL_PRODUCT: 'physical_product',
  DIGITAL_SERVICE: 'digital_service',
  DISCOUNT_COUPON: 'discount_coupon',
  EXPERIENCE: 'experience'
};

/**
 * Mapeamento de tipos de recompensas para suas traduções
 */
export const REWARD_TYPE_NAMES = {
  [REWARD_TYPES.PHYSICAL_PRODUCT]: 'Produto Físico',
  [REWARD_TYPES.DIGITAL_SERVICE]: 'Serviço Digital',
  [REWARD_TYPES.DISCOUNT_COUPON]: 'Cupom de Desconto',
  [REWARD_TYPES.EXPERIENCE]: 'Experiência'
};

/**
 * Dificuldades de quiz disponíveis
 */
export const QUIZ_DIFFICULTIES = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

/**
 * Mapeamento de dificuldades para suas traduções
 */
export const QUIZ_DIFFICULTY_NAMES = {
  [QUIZ_DIFFICULTIES.EASY]: 'Fácil',
  [QUIZ_DIFFICULTIES.MEDIUM]: 'Médio',
  [QUIZ_DIFFICULTIES.HARD]: 'Difícil'
};

/**
 * Tipos de serviços de emergência
 */
export const EMERGENCY_SERVICE_TYPES = {
  HOSPITAL: 'hospital',
  PHARMACY: 'pharmacy',
  POLICE: 'police',
  FIRE_DEPARTMENT: 'fire_department',
  EMBASSY: 'embassy',
  TOURIST_POLICE: 'tourist_police'
};

/**
 * Mapeamento de tipos de serviços de emergência para suas traduções
 */
export const EMERGENCY_SERVICE_TYPE_NAMES = {
  [EMERGENCY_SERVICE_TYPES.HOSPITAL]: 'Hospital',
  [EMERGENCY_SERVICE_TYPES.PHARMACY]: 'Farmácia',
  [EMERGENCY_SERVICE_TYPES.POLICE]: 'Delegacia',
  [EMERGENCY_SERVICE_TYPES.FIRE_DEPARTMENT]: 'Corpo de Bombeiros',
  [EMERGENCY_SERVICE_TYPES.EMBASSY]: 'Embaixada/Consulado',
  [EMERGENCY_SERVICE_TYPES.TOURIST_POLICE]: 'Polícia Turística'
};

/**
 * Números de telefone de emergência padrão
 */
export const EMERGENCY_PHONE_NUMBERS = {
  POLICE: '190',
  AMBULANCE: '192',
  FIRE: '193',
  CIVIL_DEFENSE: '199'
};

/**
 * Velocidades de WiFi disponíveis
 */
export const WIFI_SPEEDS = {
  SLOW: 'slow',
  MEDIUM: 'medium',
  FAST: 'fast'
};

/**
 * Mapeamento de velocidades de WiFi para suas traduções
 */
export const WIFI_SPEED_NAMES = {
  [WIFI_SPEEDS.SLOW]: 'Lento',
  [WIFI_SPEEDS.MEDIUM]: 'Médio',
  [WIFI_SPEEDS.FAST]: 'Rápido'
};

/**
 * Funções de usuário disponíveis
 */
export const USER_ROLES = {
  USER: 'user',
  PARTNER: 'partner',
  ADMIN: 'admin'
};

/**
 * Mapeamento de funções de usuário para suas traduções
 */
export const USER_ROLE_NAMES = {
  [USER_ROLES.USER]: 'Usuário',
  [USER_ROLES.PARTNER]: 'Parceiro',
  [USER_ROLES.ADMIN]: 'Administrador'
};

/**
 * Tipos de contexto para o chatbot
 */
export const CHAT_CONTEXT_TYPES = {
  GENERAL: 'general',
  EVENT: 'event',
  PLACE: 'place',
  EMERGENCY: 'emergency',
  CONNECTIVITY: 'connectivity'
};

/**
 * Status de tentativas de quiz
 */
export const QUIZ_ATTEMPT_STATUS = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  EXPIRED: 'expired'
};

/**
 * Mapeamento de status de tentativas para suas traduções
 */
export const QUIZ_ATTEMPT_STATUS_NAMES = {
  [QUIZ_ATTEMPT_STATUS.IN_PROGRESS]: 'Em Andamento',
  [QUIZ_ATTEMPT_STATUS.COMPLETED]: 'Concluído',
  [QUIZ_ATTEMPT_STATUS.EXPIRED]: 'Expirado'
};

/**
 * Tipos de mensagens para o sistema de notificações
 */
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

/**
 * Mapeia tipos de alertas do usuário
 */
export const USER_ALERT_TYPES = {
  EVENT_REMINDER: 'event_reminder',
  QUIZ_AVAILABLE: 'quiz_available',
  SYSTEM_NOTIFICATION: 'system_notification',
  EMERGENCY_ALERT: 'emergency_alert'
};

/**
 * Tipos de modais disponíveis na aplicação
 */
export const MODAL_TYPES = {
  CONFIRMATION: 'confirmation',
  ALERT: 'alert',
  FORM: 'form',
  IMAGE: 'image',
  CHECKIN: 'checkin',
  QUIZ_RESULT: 'quiz_result',
  REDEMPTION: 'redemption'
};

export default {
  APP_CONFIG,
  EVENT_TYPES,
  EVENT_TYPE_NAMES,
  PLACE_TYPES,
  PLACE_TYPE_NAMES,
  REWARD_TYPES,
  REWARD_TYPE_NAMES,
  QUIZ_DIFFICULTIES,
  QUIZ_DIFFICULTY_NAMES,
  EMERGENCY_SERVICE_TYPES,
  EMERGENCY_SERVICE_TYPE_NAMES,
  EMERGENCY_PHONE_NUMBERS,
  WIFI_SPEEDS,
  WIFI_SPEED_NAMES,
  USER_ROLES,
  USER_ROLE_NAMES,
  CHAT_CONTEXT_TYPES,
  QUIZ_ATTEMPT_STATUS,
  QUIZ_ATTEMPT_STATUS_NAMES,
  NOTIFICATION_TYPES,
  USER_ALERT_TYPES,
  MODAL_TYPES
};