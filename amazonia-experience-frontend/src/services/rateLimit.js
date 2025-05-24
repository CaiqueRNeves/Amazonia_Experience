const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const errorService = require('./errorService');
const loggerService = require('./logger');

/**
 * Serviço para gerenciamento de limitação de taxa de requisições
 * Fornece configurações para diferentes tipos de limitação
 */
const rateLimitService = {
  /**
   * Armazenamento para a limitação de taxa
   * Pode ser em memória (padrão) ou Redis (para ambientes distribuídos)
   * @private
   */
  store: null,

  /**
   * Inicializa o serviço de limitação de taxa
   * @returns {Object} Instância do serviço
   */
  init() {
    try {
      // Verificar se deve usar Redis para armazenamento
      if (process.env.RATE_LIMIT_USE_REDIS === 'true' && process.env.REDIS_URL) {
        // Criar store do Redis
        const Redis = require('ioredis');
        const client = new Redis(process.env.REDIS_URL);
        
        this.store = new RedisStore({
          // Conexão Redis
          sendCommand: (...args) => client.call(...args),
          // Prefixo para as chaves
          prefix: 'ratelimit:'
        });
        
        loggerService.info('Rate limit configurado com armazenamento Redis');
      } else {
        // Usar armazenamento em memória (padrão)
        this.store = null;
        
        loggerService.info('Rate limit configurado com armazenamento em memória');
      }
      
      return this;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao inicializar serviço de rate limit',
        error
      });
      
      // Em caso de erro, usar armazenamento em memória
      this.store = null;
      return this;
    }
  },

  /**
   * Configuração para limitação de API geral
   * @returns {Function} Middleware do Express
   */
  getApiLimiter() {
    return rateLimit({
      windowMs: (process.env.RATE_LIMIT_API_WINDOW || 15) * 60 * 1000, // 15 minutos por padrão
      max: process.env.RATE_LIMIT_API_MAX || 100, // 100 requisições por janela
      standardHeaders: true,
      legacyHeaders: false,
      store: this.store,
      message: {
        status: 'error',
        message: 'Muitas requisições, tente novamente mais tarde',
        code: 'RATE_LIMIT_EXCEEDED'
      },
      keyGenerator: (req) => {
        // Por padrão, usa o IP do cliente
        return req.ip;
      },
      skip: (req) => {
        // Ignorar health checks e outras rotas de monitoramento
        return req.path === '/health' || req.path === '/favicon.ico';
      },
      handler: (req, res, next, options) => {
        // Logar tentativas de exceder o limite
        loggerService.warn('Limite de taxa excedido', {
          ip: req.ip,
          url: req.originalUrl,
          method: req.method,
          userAgent: req.get('User-Agent')
        });
        
        // Responder com erro 429
        res.status(429).json(options.message);
      }
    });
  },

  /**
   * Configuração para limitação de autenticação
   * Mais restritivo para prevenir ataques de força bruta
   * @returns {Function} Middleware do Express
   */
  getAuthLimiter() {
    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hora
      max: process.env.RATE_LIMIT_AUTH_MAX || 10, // 10 tentativas por hora
      standardHeaders: true,
      legacyHeaders: false,
      store: this.store,
      message: {
        status: 'error',
        message: 'Muitas tentativas de login, tente novamente mais tarde',
        code: 'AUTH_RATE_LIMIT_EXCEEDED'
      },
      keyGenerator: (req) => {
        // Usar email + IP como chave para melhor proteção
        return `${req.body.email || 'unknown'}_${req.ip}`;
      },
      handler: (req, res, next, options) => {
        // Logar tentativas de exceder o limite
        loggerService.warn('Limite de tentativas de autenticação excedido', {
          ip: req.ip,
          email: req.body.email || 'unknown',
          url: req.originalUrl,
          method: req.method
        });
        
        // Responder com erro 429
        res.status(429).json(options.message);
      }
    });
  },

  /**
   * Configuração para limitação de check-ins
   * @returns {Function} Middleware do Express
   */
  getCheckinLimiter() {
    return rateLimit({
      windowMs: 5 * 60 * 1000, // 5 minutos
      max: process.env.RATE_LIMIT_CHECKIN_MAX || 10, // 10 check-ins por 5 minutos
      standardHeaders: true,
      legacyHeaders: false,
      store: this.store,
      message: {
        status: 'error',
        message: 'Muitos check-ins em pouco tempo, tente novamente mais tarde',
        code: 'CHECKIN_RATE_LIMIT_EXCEEDED'
      },
      keyGenerator: (req) => {
        // Usar ID do usuário + IP para evitar abusos
        return req.user ? `${req.user.id}_${req.ip}` : req.ip;
      }
    });
  },

  /**
   * Configuração para limitação de mensagens de chat
   * @returns {Function} Middleware do Express
   */
  getChatLimiter() {
    return rateLimit({
      windowMs: 60 * 1000, // 1 minuto
      max: process.env.RATE_LIMIT_CHAT_MAX || 20, // 20 mensagens por minuto
      standardHeaders: true,
      legacyHeaders: false,
      store: this.store,
      message: {
        status: 'error',
        message: 'Muitas mensagens em pouco tempo, tente novamente mais tarde',
        code: 'CHAT_RATE_LIMIT_EXCEEDED'
      },
      keyGenerator: (req) => {
        // Usar ID do usuário + IP
        return req.user ? `${req.user.id}_${req.ip}` : req.ip;
      }
    });
  },

  /**
   * Configuração para limitação de criação de conta
   * @returns {Function} Middleware do Express
   */
  getRegistrationLimiter() {
    return rateLimit({
      windowMs: 24 * 60 * 60 * 1000, // 24 horas
      max: process.env.RATE_LIMIT_REGISTER_MAX || 5, // 5 registros por dia
      standardHeaders: true,
      legacyHeaders: false,
      store: this.store,
      message: {
        status: 'error',
        message: 'Muitas contas criadas recentemente, tente novamente mais tarde',
        code: 'REGISTRATION_RATE_LIMIT_EXCEEDED'
      },
      keyGenerator: (req) => {
        // Usar IP para limitar registros
        return req.ip;
      },
      handler: (req, res, next, options) => {
        // Logar tentativas de exceder o limite
        loggerService.warn('Limite de registros excedido', {
          ip: req.ip,
          email: req.body.email || 'unknown'
        });
        
        // Responder com erro 429
        res.status(429).json(options.message);
      }
    });
  },

  /**
   * Configuração para limitação de resgates de recompensas
   * @returns {Function} Middleware do Express
   */
  getRedemptionLimiter() {
    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hora
      max: process.env.RATE_LIMIT_REDEMPTION_MAX || 10, // 10 resgates por hora
      standardHeaders: true,
      legacyHeaders: false,
      store: this.store,
      message: {
        status: 'error',
        message: 'Muitos resgates em pouco tempo, tente novamente mais tarde',
        code: 'REDEMPTION_RATE_LIMIT_EXCEEDED'
      },
      keyGenerator: (req) => {
        // Usar ID do usuário
        return req.user ? `${req.user.id}` : req.ip;
      }
    });
  },

  /**
   * Cria um limitador customizado
   * @param {Object} options - Opções de configuração
   * @returns {Function} Middleware do Express
   */
  createCustomLimiter(options = {}) {
    const defaultOptions = {
      windowMs: 60 * 1000, // 1 minuto
      max: 60, // 60 requisições por minuto
      standardHeaders: true,
      legacyHeaders: false,
      store: this.store,
      message: {
        status: 'error',
        message: 'Limite de requisições excedido, tente novamente mais tarde',
        code: 'RATE_LIMIT_EXCEEDED'
      }
    };
    
    // Mesclar opções padrão com as fornecidas
    const limiterOptions = { ...defaultOptions, ...options };
    
    return rateLimit(limiterOptions);
  },

  /**
   * Verifica se um IP está na lista de permitidos (whitelist)
   * @param {string} ip - Endereço IP a ser verificado
   * @returns {boolean} Verdadeiro se o IP estiver na whitelist
   */
  isWhitelisted(ip) {
    try {
      if (!process.env.RATE_LIMIT_WHITELIST) {
        return false;
      }
      
      const whitelist = process.env.RATE_LIMIT_WHITELIST.split(',')
        .map(item => item.trim());
      
      return whitelist.includes(ip);
    } catch (error) {
      errorService.logError({
        message: 'Erro ao verificar IP na whitelist',
        error
      });
      
      return false;
    }
  },

  /**
   * Middleware para ignorar limitação em IPs na whitelist
   * @returns {Function} Middleware do Express
   */
  whitelistMiddleware() {
    return (req, res, next) => {
      if (this.isWhitelisted(req.ip)) {
        // Define uma propriedade para outros middlewares de rateLimit identificarem
        req.isRateLimitWhitelisted = true;
      }
      
      next();
    };
  }
};

// Inicializa o serviço
rateLimitService.init();

module.exports = rateLimitService;