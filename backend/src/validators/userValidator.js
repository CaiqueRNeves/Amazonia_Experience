const { body, validationResult } = require('express-validator');
const { ValidationError } = require('../middleware/error');

// Middleware para verificar se há erros de validação
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    throw new ValidationError(errorMessages.join(', '));
  }
  next();
};

// Validação para atualização de perfil
exports.validateUpdateProfile = [
  body('name')
    .optional()
    .isLength({ min: 3, max: 50 }).withMessage('O nome deve ter entre 3 e 50 caracteres'),
  
  body('nationality')
    .optional()
    .isLength({ min: 2, max: 50 }).withMessage('A nacionalidade deve ter entre 2 e 50 caracteres'),
  
  validateRequest
];

// Validação para preferências de notificação
exports.validateNotificationPreferences = [
  body('events')
    .optional()
    .isBoolean().withMessage('O valor para eventos deve ser um booleano'),
  
  body('rewards')
    .optional()
    .isBoolean().withMessage('O valor para recompensas deve ser um booleano'),
  
  body('quizzes')
    .optional()
    .isBoolean().withMessage('O valor para quizzes deve ser um booleano'),
  
  body('emergency')
    .optional()
    .isBoolean().withMessage('O valor para emergências deve ser um booleano'),
  
  validateRequest
];