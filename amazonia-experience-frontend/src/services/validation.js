const { validationResult } = require('express-validator');
const { ValidationError } = require('../middleware/error');
const errorService = require('./errorService');

/**
 * Serviço para validação de dados de entrada
 * Fornece utilitários e middlewares para validação
 */
const validationService = {
  /**
   * Middleware para verificar erros de validação do express-validator
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  validate(req, res, next) {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      const error = new ValidationError(errorMessages.join(', '));
      
      // Registrar erro de validação
      errorService.logError({
        message: 'Erro de validação',
        error: {
          messages: errorMessages,
          body: req.body,
          params: req.params,
          query: req.query
        },
        category: errorService.categories.VALIDATION
      });
      
      throw error;
    }
    
    next();
  },

  /**
   * Valida um objeto com base em um esquema Joi
   * @param {Object} schema - Esquema Joi
   * @param {string} source - Fonte dos dados ('body', 'query', 'params')
   * @returns {Function} Middleware do Express
   */
  validateJoi(schema, source = 'body') {
    return (req, res, next) => {
      try {
        const { error, value } = schema.validate(req[source], { abortEarly: false });
        
        if (error) {
          const messages = error.details.map(detail => detail.message);
          const validationError = new ValidationError(messages.join(', '));
          
          // Registrar erro de validação
          errorService.logError({
            message: 'Erro de validação Joi',
            error: {
              messages,
              source,
              data: req[source]
            },
            category: errorService.categories.VALIDATION
          });
          
          throw validationError;
        }
        
        // Atualizar com valores validados e convertidos
        req[source] = value;
        next();
      } catch (error) {
        if (error instanceof ValidationError) {
          throw error;
        }
        
        // Outros erros não esperados
        errorService.logError({
          message: 'Erro inesperado durante validação Joi',
          error,
          category: errorService.categories.VALIDATION
        });
        
        throw new ValidationError('Erro de validação');
      }
    };
  },

  /**
   * Valida um ID como número inteiro positivo
   * @param {string} paramName - Nome do parâmetro a ser validado
   * @returns {Function} Middleware do Express
   */
  validateId(paramName = 'id') {
    return (req, res, next) => {
      const id = parseInt(req.params[paramName]);
      
      if (isNaN(id) || id <= 0) {
        const error = new ValidationError(`${paramName} inválido`);
        
        errorService.logError({
          message: `ID inválido: ${req.params[paramName]}`,
          error: {
            paramName,
            value: req.params[paramName]
          },
          category: errorService.categories.VALIDATION
        });
        
        throw error;
      }
      
      // Converter para número
      req.params[paramName] = id;
      next();
    };
  },

  /**
   * Valida coordenadas de geolocalização
   * @returns {Function} Middleware do Express
   */
  validateCoordinates() {
    return (req, res, next) => {
      const { latitude, longitude } = req.query;
      
      if (!latitude || !longitude) {
        throw new ValidationError('Latitude e longitude são obrigatórios');
      }
      
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      if (isNaN(lat) || lat < -90 || lat > 90) {
        throw new ValidationError('Latitude inválida');
      }
      
      if (isNaN(lng) || lng < -180 || lng > 180) {
        throw new ValidationError('Longitude inválida');
      }
      
      // Converter para números
      req.query.latitude = lat;
      req.query.longitude = lng;
      
      next();
    };
  },

  /**
   * Valida parâmetros de paginação
   * @param {number} defaultLimit - Limite padrão de itens por página
   * @param {number} maxLimit - Limite máximo de itens por página
   * @returns {Function} Middleware do Express
   */
  validatePagination(defaultLimit = 10, maxLimit = 100) {
    return (req, res, next) => {
      let { page, limit } = req.query;
      
      // Validar página
      if (page !== undefined) {
        page = parseInt(page);
        
        if (isNaN(page) || page < 1) {
          throw new ValidationError('Página inválida');
        }
        
        req.query.page = page;
      } else {
        // Definir página padrão
        req.query.page = 1;
      }
      
      // Validar limite
      if (limit !== undefined) {
        limit = parseInt(limit);
        
        if (isNaN(limit) || limit < 1) {
          throw new ValidationError('Limite inválido');
        }
        
        // Aplicar limite máximo
        if (limit > maxLimit) {
          req.query.limit = maxLimit;
        } else {
          req.query.limit = limit;
        }
      } else {
        // Definir limite padrão
        req.query.limit = defaultLimit;
      }
      
      next();
    };
  },

  /**
   * Valida um código de verificação
   * @returns {Function} Middleware do Express
   */
  validateVerificationCode() {
    return (req, res, next) => {
      const { verification_code } = req.body;
      
      if (!verification_code) {
        throw new ValidationError('Código de verificação é obrigatório');
      }
      
      if (!/^[A-Z0-9]{8}$/.test(verification_code)) {
        throw new ValidationError('Código de verificação inválido (deve ter 8 caracteres alfanuméricos)');
      }
      
      next();
    };
  },

  /**
   * Verifica se a data está no formato ISO
   * @param {string} dateString - String de data a ser validada
   * @returns {boolean} Verdadeiro se a data for válida
   */
  isValidISODate(dateString) {
    try {
      if (!Boolean(new Date(dateString).toISOString())) {
        return false;
      }
      
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Verifica se uma string contém apenas caracteres alfanuméricos e espaços
   * @param {string} value - String a ser validada
   * @returns {boolean} Verdadeiro se a string for válida
   */
  isAlphanumericWithSpaces(value) {
    return /^[a-zA-Z0-9\s]+$/.test(value);
  },

  /**
   * Sanitiza uma string para prevenir SQL Injection
   * @param {string} str - String a ser sanitizada
   * @returns {string} String sanitizada
   */
  sanitizeSQLInput(str) {
    if (!str) return str;
    
    return String(str)
      .replace(/'/g, "''")
      .replace(/\\/g, '\\\\');
  },

  /**
   * Sanitiza uma string para uso em HTML (prevenir XSS)
   * @param {string} str - String a ser sanitizada
   * @returns {string} String sanitizada
   */
  sanitizeHtmlInput(str) {
    if (!str) return str;
    
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  /**
   * Valida um email
   * @param {string} email - Email a ser validado
   * @returns {boolean} Verdadeiro se o email for válido
   */
  isValidEmail(email) {
    // Expressão regular para validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Valida uma senha
   * @param {string} password - Senha a ser validada
   * @param {Object} options - Opções de validação
   * @returns {Object} Resultado da validação
   */
  validatePassword(password, options = {}) {
    const defaultOptions = {
      minLength: 6,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecial: false
    };
    
    // Mesclar opções padrão com as fornecidas
    const validationOptions = { ...defaultOptions, ...options };
    
    const result = {
      isValid: true,
      errors: []
    };
    
    // Verificar comprimento mínimo
    if (password.length < validationOptions.minLength) {
      result.isValid = false;
      result.errors.push(`A senha deve ter pelo menos ${validationOptions.minLength} caracteres`);
    }
    
    // Verificar letra maiúscula
    if (validationOptions.requireUppercase && !/[A-Z]/.test(password)) {
      result.isValid = false;
      result.errors.push('A senha deve conter pelo menos uma letra maiúscula');
    }
    
    // Verificar letra minúscula
    if (validationOptions.requireLowercase && !/[a-z]/.test(password)) {
      result.isValid = false;
      result.errors.push('A senha deve conter pelo menos uma letra minúscula');
    }
    
    // Verificar números
    if (validationOptions.requireNumbers && !/[0-9]/.test(password)) {
      result.isValid = false;
      result.errors.push('A senha deve conter pelo menos um número');
    }
    
    // Verificar caracteres especiais
    if (validationOptions.requireSpecial && !/[^A-Za-z0-9]/.test(password)) {
      result.isValid = false;
      result.errors.push('A senha deve conter pelo menos um caractere especial');
    }
    
    return result;
  },

  /**
   * Verifica se um objeto tem todas as propriedades requeridas
   * @param {Object} obj - Objeto a ser verificado
   * @param {string[]} requiredProps - Lista de propriedades requeridas
   * @returns {boolean} Verdadeiro se o objeto tiver todas as propriedades
   */
  hasRequiredProperties(obj, requiredProps) {
    return requiredProps.every(prop => 
      obj.hasOwnProperty(prop) && obj[prop] !== null && obj[prop] !== undefined
    );
  }
};

module.exports = validationService;