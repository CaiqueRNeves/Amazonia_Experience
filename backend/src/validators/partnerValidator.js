import { body, validationResult } from 'express-validator';
import { ValidationError } from '../middleware/error.js';

// Middleware para verificar se há erros de validação
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    throw new ValidationError(errorMessages.join(', '));
  }
  next();
};

// Validação para verificação de código de visita
export const validateVerifyCode = [
  body('verification_code')
    .notEmpty().withMessage('O código de verificação é obrigatório')
    .isLength({ min: 8, max: 8 }).withMessage('O código de verificação deve ter 8 caracteres'),
  
  validateRequest
];