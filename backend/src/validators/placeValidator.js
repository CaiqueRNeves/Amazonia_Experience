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

// Validação para check-in em locais
exports.validatePlaceCheckin = [
  body('place_id')
    .notEmpty().withMessage('O ID do local é obrigatório')
    .isInt({ min: 1 }).withMessage('ID de local inválido'),
  
  validateRequest
];