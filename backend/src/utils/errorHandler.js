/**
 * Utilitários para tratamento de erros
 */

// Criar erro padrão para API
const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Formatar erro para resposta da API
const formatError = (error, includeStack = false) => {
  const response = {
    status: 'error',
    message: error.message || 'Erro interno do servidor'
  };
  
  if (includeStack && error.stack) {
    response.stack = error.stack;
  }
  
  return response;
};

// Tratar erros assíncronos
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Logger de erros
const logError = (error) => {
  console.error(`[${new Date().toISOString()}] ERROR:`, {
    message: error.message,
    stack: error.stack,
    name: error.name
  });
};

module.exports = {
  createError,
  formatError,
  asyncHandler,
  logError
};