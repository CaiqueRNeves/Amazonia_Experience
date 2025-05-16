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

// Validação para registro de usuário
exports.validateRegister = [
  body('name')
    .notEmpty().withMessage('O nome é obrigatório')
    .isLength({ min: 3, max: 50 }).withMessage('O nome deve ter entre 3 e 50 caracteres'),
  
  body('email')
    .notEmpty().withMessage('O email é obrigatório')
    .isEmail().withMessage('Formato de email inválido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('A senha é obrigatória')
    .isLength({ min: 6 }).withMessage('A senha deve ter no mínimo 6 caracteres'),
  
  body('nationality')
    .optional()
    .isLength({ min: 2, max: 50 }).withMessage('A nacionalidade deve ter entre 2 e 50 caracteres'),
  
  validateRequest
];

// Validação para login
exports.validateLogin = [
  body('email')
    .notEmpty().withMessage('O email é obrigatório')
    .isEmail().withMessage('Formato de email inválido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('A senha é obrigatória'),
  
  validateRequest
];

// Validação para alteração de senha
exports.validateChangePassword = [
  body('currentPassword')
    .notEmpty().withMessage('A senha atual é obrigatória'),
  
  body('newPassword')
    .notEmpty().withMessage('A nova senha é obrigatória')
    .isLength({ min: 6 }).withMessage('A nova senha deve ter no mínimo 6 caracteres')
    .not().equals(body('currentPassword')).withMessage('A nova senha deve ser diferente da senha atual'),
  
  validateRequest
];