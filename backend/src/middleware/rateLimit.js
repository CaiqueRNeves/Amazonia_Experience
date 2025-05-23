const rateLimit = require('express-rate-limit');

// Configuração padrão de rate limit para API
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Muitas requisições, tente novamente mais tarde'
  }
});

// Rate limit mais rigoroso para autenticação (prevenir brute force)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // limite de 10 tentativas por hora
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Muitas tentativas de login, tente novamente mais tarde'
  }
});

// Rate limit para check-ins
const checkinLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 10, // limite de 10 check-ins por 5 minutos
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Muitos check-ins em pouco tempo, tente novamente mais tarde'
  }
});

// Rate limit para chat
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 20, // limite de 20 mensagens por minuto
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Muitas mensagens em pouco tempo, tente novamente mais tarde'
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  checkinLimiter,
  chatLimiter
};