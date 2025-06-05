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

// Validação para mensagem de chat
export const validateChatMessage = [
  body('message')
    .notEmpty().withMessage('A mensagem é obrigatória')
    .isLength({ min: 1, max: 500 }).withMessage('A mensagem deve ter entre 1 e 500 caracteres'),
  
  body('context_type')
    .optional()
    .isIn(['general', 'event', 'place', 'emergency', 'connectivity']).withMessage('Tipo de contexto inválido'),
  
  body('context_id')
    .optional()
    .if(body('context_type').exists().not().equals('general'))
    .isInt({ min: 1 }).withMessage('ID de contexto inválido'),
  
  validateRequest
];