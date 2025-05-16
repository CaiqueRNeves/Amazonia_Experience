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

// Validação para relatório de ponto de conectividade
exports.validateConnectivityReport = [
  body('wifi_speed')
    .optional()
    .isIn(['slow', 'medium', 'fast']).withMessage('Velocidade Wi-Fi inválida'),
  
  body('wifi_reliability')
    .optional()
    .isInt({ min: 1, max: 10 }).withMessage('A confiabilidade deve ser entre 1 e 10'),
  
  body('is_working')
    .optional()
    .isBoolean().withMessage('O valor para "em funcionamento" deve ser um booleano'),
  
  body('comment')
    .optional()
    .isLength({ max: 200 }).withMessage('O comentário deve ter no máximo 200 caracteres'),
  
  validateRequest
];