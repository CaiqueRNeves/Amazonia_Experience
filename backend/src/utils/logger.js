/**
 * Sistema de logging para a aplicação
 */

// Níveis de log
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Nível de log atual (baseado no ambiente)
const currentLogLevel = (() => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return LOG_LEVELS.INFO;
    case 'test':
      return LOG_LEVELS.ERROR;
    default: // development
      return LOG_LEVELS.DEBUG;
  }
})();

// Formatação do timestamp
const getTimestamp = () => {
  return new Date().toISOString();
};

// Função base de log
const log = (level, message, data = {}) => {
  if (level > currentLogLevel) return;
  
  const logEntry = {
    timestamp: getTimestamp(),
    level: Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === level),
    message,
    ...data
  };
  
  // Em produção, podemos enviar para um serviço de logs
  // Por enquanto, apenas console.log
  console.log(JSON.stringify(logEntry));
};

// Métodos específicos para cada nível
const error = (message, data = {}) => {
  log(LOG_LEVELS.ERROR, message, data);
};

const warn = (message, data = {}) => {
  log(LOG_LEVELS.WARN, message, data);
};

const info = (message, data = {}) => {
  log(LOG_LEVELS.INFO, message, data);
};

const debug = (message, data = {}) => {
  log(LOG_LEVELS.DEBUG, message, data);
};

// Middleware para logging de requisições
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    info('API Request', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  });
  
  next();
};

module.exports = {
  error,
  warn,
  info,
  debug,
  requestLogger
};