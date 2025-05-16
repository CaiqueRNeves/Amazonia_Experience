const { validationResult } = require('express-validator');
const { ValidationError } = require('./error');

/**
 * Middleware para verificar erros de validação
 * Deve ser usado após os validadores do express-validator
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    throw new ValidationError(errorMessages.join(', '));
  }
  
  next();
};

/**
 * Valida um objeto com base em um esquema Joi
 * @param {Object} schema - Esquema Joi
 * @param {string} source - Fonte dos dados ('body', 'query', 'params')
 */
const validateJoi = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[source]);
    
    if (error) {
      throw new ValidationError(error.details.map(detail => detail.message).join(', '));
    }
    
    next();
  };
};

/**
 * Valida um ID como um número inteiro positivo
 */
const validateId = (req, res, next) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id) || id <= 0) {
    throw new ValidationError('ID inválido');
  }
  
  req.params.id = id; // Converte para número
  next();
};

/**
 * Valida coordenadas de geolocalização (latitude e longitude)
 */
const validateCoordinates = (req, res, next) => {
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
  
  // Converter para números e continuar
  req.query.latitude = lat;
  req.query.longitude = lng;
  next();
};

/**
 * Valida parâmetros de paginação
 */
const validatePagination = (req, res, next) => {
  let { page, limit } = req.query;
  
  if (page) {
    page = parseInt(page);
    if (isNaN(page) || page < 1) {
      throw new ValidationError('Página inválida');
    }
    req.query.page = page;
  }
  
  if (limit) {
    limit = parseInt(limit);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      throw new ValidationError('Limite inválido (deve estar entre 1 e 100)');
    }
    req.query.limit = limit;
  }
  
  next();
};

/**
 * Valida que uma string contém somente caracteres alfanuméricos e espaços
 */
const validateAlphanumericWithSpaces = (value) => {
  if (!/^[a-zA-Z0-9\s]+$/.test(value)) {
    throw new ValidationError('O valor deve conter apenas letras, números e espaços');
  }
  return true;
};

/**
 * Valida um código de verificação (formato específico)
 */
const validateVerificationCode = (req, res, next) => {
  const { verification_code } = req.body;
  
  if (!verification_code) {
    throw new ValidationError('Código de verificação é obrigatório');
  }
  
  if (!/^[A-Z0-9]{8}$/.test(verification_code)) {
    throw new ValidationError('Código de verificação inválido (deve ter 8 caracteres alfanuméricos)');
  }
  
  next();
};

/**
 * Valida que a data está no formato ISO
 */
const validateISODate = (value) => {
  try {
    if (!Boolean(new Date(value).toISOString())) {
      throw new Error();
    }
  } catch (e) {
    throw new ValidationError('Data inválida (deve estar no formato ISO)');
  }
  return true;
};

/**
 * Sanitiza uma string para prevenir SQL injection
 * Não é um substituto para prepared statements!
 */
const sanitizeSQLInput = (str) => {
  if (!str) return str;
  return String(str)
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\');
};

/**
 * Sanitiza uma string para uso em HTML (prevenir XSS)
 */
const sanitizeHtmlInput = (str) => {
  if (!str) return str;
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

module.exports = {
  validateRequest,
  validateJoi,
  validateId,
  validateCoordinates,
  validatePagination,
  validateAlphanumericWithSpaces,
  validateVerificationCode,
  validateISODate,
  sanitizeSQLInput,
  sanitizeHtmlInput
};