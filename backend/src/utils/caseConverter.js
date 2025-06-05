/**
 * Utilitários para conversão entre camelCase e snake_case
 * Permite manter compatibilidade entre frontend (camelCase) e backend (snake_case)
 */

/**
 * Converte string de camelCase para snake_case
 * @param {string} str - String em camelCase
 * @returns {string} String em snake_case
 */
export const camelToSnake = (str) => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

/**
 * Converte string de snake_case para camelCase
 * @param {string} str - String em snake_case
 * @returns {string} String em camelCase
 */
export const snakeToCamel = (str) => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Converte recursivamente as chaves de um objeto de snake_case para camelCase
 * @param {Object|Array} obj - Objeto ou array a ser convertido
 * @returns {Object|Array} Objeto ou array com chaves convertidas
 */
export const objectToCamelCase = (obj) => {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => objectToCamelCase(item));
  }

  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = snakeToCamel(key);
    acc[camelKey] = objectToCamelCase(obj[key]);
    return acc;
  }, {});
};

/**
 * Converte recursivamente as chaves de um objeto de camelCase para snake_case
 * @param {Object|Array} obj - Objeto ou array a ser convertido
 * @returns {Object|Array} Objeto ou array com chaves convertidas
 */
export const objectToSnakeCase = (obj) => {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => objectToSnakeCase(item));
  }

  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = camelToSnake(key);
    acc[snakeKey] = objectToSnakeCase(obj[key]);
    return acc;
  }, {});
};

/**
 * Converte parâmetros de consulta de camelCase para snake_case
 * @param {Object} params - Parâmetros em camelCase
 * @returns {Object} Parâmetros em snake_case
 */
export const convertQueryParams = (params) => {
  if (!params || typeof params !== 'object') {
    return params;
  }

  return Object.keys(params).reduce((acc, key) => {
    const value = params[key];
    if (value !== undefined && value !== null) {
      acc[camelToSnake(key)] = value;
    }
    return acc;
  }, {});
};

/**
 * Middleware para converter automaticamente requests e responses
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const caseConversionMiddleware = (req, res, next) => {
  // Converter query params de camelCase para snake_case
  if (req.query) {
    req.query = convertQueryParams(req.query);
  }
  
  // Converter body de camelCase para snake_case
  if (req.body) {
    req.body = objectToSnakeCase(req.body);
  }
  
  // Interceptar res.json para converter responses de snake_case para camelCase
  const originalJson = res.json;
  res.json = function(data) {
    if (data && typeof data === 'object') {
      data = objectToCamelCase(data);
    }
    return originalJson.call(this, data);
  };
  
  next();
};