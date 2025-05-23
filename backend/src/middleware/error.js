// Tratamento centralizado de erros
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Status HTTP padrão é 500 (erro interno do servidor)
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Erro interno do servidor';

  // Customização de erros conhecidos
  if (err.name === 'ValidationError') {
    statusCode = 400; // Bad Request
    message = err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401; // Unauthorized
    message = 'Acesso não autorizado';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403; // Forbidden
    message = 'Acesso proibido';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404; // Not Found
    message = err.message || 'Recurso não encontrado';
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Classe para geração de erros personalizados
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Erros específicos da aplicação
class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Não autorizado') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Acesso proibido') {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Recurso não encontrado') {
    super(message, 404);
  }
}

module.exports = {
  errorHandler,
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError
};
