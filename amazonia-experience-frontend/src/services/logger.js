/**
 * Serviço para gerenciamento de logs da aplicação
 * Fornece funções para geração de logs em diferentes níveis
 */

// Definição de níveis de log
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

// Nomes dos níveis de log
const LOG_LEVEL_NAMES = {
  [LOG_LEVELS.ERROR]: 'ERROR',
  [LOG_LEVELS.WARN]: 'WARN',
  [LOG_LEVELS.INFO]: 'INFO',
  [LOG_LEVELS.DEBUG]: 'DEBUG',
  [LOG_LEVELS.TRACE]: 'TRACE'
};

// Determinar o nível baseado no ambiente
const getCurrentLogLevel = () => {
  const env = process.env.NODE_ENV || 'development';
  const configuredLevel = process.env.LOG_LEVEL;
  
  // Se um nível estiver explicitamente configurado, use-o
  if (configuredLevel && LOG_LEVELS[configuredLevel.toUpperCase()] !== undefined) {
    return LOG_LEVELS[configuredLevel.toUpperCase()];
  }
  
  // Caso contrário, use o nível padrão para o ambiente
  switch (env) {
    case 'production':
      return LOG_LEVELS.INFO;
    case 'test':
      return LOG_LEVELS.ERROR;
    default: // development
      return LOG_LEVELS.DEBUG;
  }
};

// Nível atual de log
const currentLogLevel = getCurrentLogLevel();

// Formatação de timestamp
const getTimestamp = () => {
  return new Date().toISOString();
};

const loggerService = {
  /**
   * Níveis de log disponíveis
   */
  levels: LOG_LEVELS,

  /**
   * Função base para geração de logs
   * @param {number} level - Nível do log
   * @param {string} message - Mensagem a ser logada
   * @param {Object} meta - Metadados adicionais
   */
  log(level, message, meta = {}) {
    // Ignorar logs de níveis superiores ao configurado
    if (level > currentLogLevel) {
      return;
    }
    
    const logEntry = {
      timestamp: getTimestamp(),
      level: LOG_LEVEL_NAMES[level] || 'UNKNOWN',
      message,
      ...meta
    };
    
    // Adicionar stacktrace para erros
    if (level === LOG_LEVELS.ERROR && meta.error && meta.error.stack) {
      logEntry.stack = meta.error.stack;
    }
    
    // Determinar o método de console a ser utilizado
    let consoleMethod;
    
    switch (level) {
      case LOG_LEVELS.ERROR:
        consoleMethod = console.error;
        break;
      case LOG_LEVELS.WARN:
        consoleMethod = console.warn;
        break;
      case LOG_LEVELS.INFO:
        consoleMethod = console.info;
        break;
      case LOG_LEVELS.DEBUG:
      case LOG_LEVELS.TRACE:
      default:
        consoleMethod = console.log;
        break;
    }
    
    // Em produção, formatar como JSON para facilitar a análise por ferramentas
    if (process.env.NODE_ENV === 'production') {
      consoleMethod(JSON.stringify(logEntry));
    } else {
      // Em ambientes de desenvolvimento, formatar para melhor legibilidade
      const { timestamp, level, message, ...rest } = logEntry;
      consoleMethod(`[${timestamp}] ${level}: ${message}`, 
        Object.keys(rest).length ? rest : '');
    }
    
    // Integração com serviços externos de log (opcional)
    this.sendToExternalLogService(logEntry);
  },

  /**
   * Loga uma mensagem de erro
   * @param {string} message - Mensagem de erro
   * @param {Error|Object} error - Objeto de erro ou metadados
   */
  error(message, error = {}) {
    this.log(LOG_LEVELS.ERROR, message, { error });
  },

  /**
   * Loga uma mensagem de aviso
   * @param {string} message - Mensagem de aviso
   * @param {Object} meta - Metadados adicionais
   */
  warn(message, meta = {}) {
    this.log(LOG_LEVELS.WARN, message, meta);
  },

  /**
   * Loga uma mensagem informativa
   * @param {string} message - Mensagem informativa
   * @param {Object} meta - Metadados adicionais
   */
  info(message, meta = {}) {
    this.log(LOG_LEVELS.INFO, message, meta);
  },

  /**
   * Loga uma mensagem de debug
   * @param {string} message - Mensagem de debug
   * @param {Object} meta - Metadados adicionais
   */
  debug(message, meta = {}) {
    this.log(LOG_LEVELS.DEBUG, message, meta);
  },

  /**
   * Loga uma mensagem de trace (maior nível de detalhe)
   * @param {string} message - Mensagem de trace
   * @param {Object} meta - Metadados adicionais
   */
  trace(message, meta = {}) {
    this.log(LOG_LEVELS.TRACE, message, meta);
  },

  /**
   * Loga informações sobre uma requisição HTTP
   * @param {Object} req - Objeto de requisição
   * @param {Object} res - Objeto de resposta
   */
  logRequest(req, res) {
    // Skip logging para health checks e outros endpoints de monitoramento
    if (req.originalUrl === '/health' || req.originalUrl === '/favicon.ico') {
      return;
    }
    
    this.info(`${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userId: req.user?.id,
      userAgent: req.get('User-Agent'),
      contentLength: req.get('Content-Length'),
      referrer: req.get('Referrer'),
      requestId: req.id
    });
  },

  /**
   * Loga informações sobre uma resposta HTTP
   * @param {Object} req - Objeto de requisição
   * @param {Object} res - Objeto de resposta
   * @param {number} responseTime - Tempo de resposta em ms
   */
  logResponse(req, res, responseTime) {
    // Skip logging para health checks e outros endpoints de monitoramento
    if (req.originalUrl === '/health' || req.originalUrl === '/favicon.ico') {
      return;
    }
    
    const logLevel = res.statusCode >= 500 
      ? LOG_LEVELS.ERROR 
      : (res.statusCode >= 400 ? LOG_LEVELS.WARN : LOG_LEVELS.INFO);
    
    this.log(logLevel, `${req.method} ${req.originalUrl} ${res.statusCode} - ${responseTime}ms`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime,
      requestId: req.id
    });
  },

  /**
   * Cria um middleware Express para logging de requisições
   * @returns {Function} Middleware do Express
   */
  requestLogger() {
    return (req, res, next) => {
      // Adicionar ID único para a requisição
      req.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
      
      // Registrar início da requisição
      const start = Date.now();
      this.logRequest(req, res);
      
      // Interceptar finalização da resposta
      res.on('finish', () => {
        const duration = Date.now() - start;
        this.logResponse(req, res, duration);
      });
      
      next();
    };
  },

  /**
   * Envia logs para um serviço externo (opcional)
   * @param {Object} logEntry - Entrada de log
   * @private
   */
  sendToExternalLogService(logEntry) {
    // Implemente integração com serviços como CloudWatch, LogDNA, Papertrail, etc.
    // Esta é uma implementação de exemplo que só será executada se configurada
    if (process.env.EXTERNAL_LOGGING_ENABLED === 'true' && process.env.EXTERNAL_LOGGING_URL) {
      // Evitar chamadas de rede síncronas que poderiam bloquear
      setTimeout(() => {
        try {
          fetch(process.env.EXTERNAL_LOGGING_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': process.env.EXTERNAL_LOGGING_API_KEY
            },
            body: JSON.stringify({
              ...logEntry,
              app: process.env.APP_NAME || 'amazonia-experience-api',
              environment: process.env.NODE_ENV || 'development',
              version: process.env.API_VERSION || '0.1.0'
            }),
            // Não bloqueiar a aplicação esperando a resposta
            keepalive: true
          }).catch(() => {
            // Silencioso para não criar loops infinitos de log
          });
        } catch (e) {
          // Ignorar erros ao enviar logs para não impactar a aplicação
        }
      }, 0);
    }
  }
};

module.exports = loggerService;