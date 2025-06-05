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

// Validação para resposta de quiz
export const validateQuizAnswer = [
  body('question_id')
    .notEmpty().withMessage('O ID da pergunta é obrigatório')
    .isInt({ min: 1 }).withMessage('ID de pergunta inválido'),
  
  body('answer')
    .notEmpty().withMessage('A resposta é obrigatória'),
  
  validateRequest
];
