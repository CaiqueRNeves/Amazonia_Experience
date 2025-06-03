const { body, validationResult } = require('express-validator');
const { ValidationError } = require('../middleware/error');
const rateLimit = require('express-rate-limit');

// Middleware para verificar se há erros de validação
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    throw new ValidationError(errorMessages.join(', '));
  }
  next();
};

// Rate limiting específico para autenticação
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas por IP
  message: {
    status: 'error',
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Sanitização de entrada
const sanitizeInput = (value) => {
  if (typeof value !== 'string') return value;
  return value.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

// Validação para registro de usuário - MELHORADA
exports.validateRegister = [
  authLimiter,
  
  body('name')
    .notEmpty().withMessage('O nome é obrigatório')
    .isLength({ min: 2, max: 50 }).withMessage('O nome deve ter entre 2 e 50 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/).withMessage('Nome deve conter apenas letras e espaços')
    .customSanitizer(sanitizeInput),
  
  body('email')
    .notEmpty().withMessage('O email é obrigatório')
    .isEmail().withMessage('Formato de email inválido')
    .isLength({ max: 100 }).withMessage('Email muito longo')
    .normalizeEmail()
    .customSanitizer(sanitizeInput),
  
  body('password')
    .notEmpty().withMessage('A senha é obrigatória')
    .isLength({ min: 8, max: 128 }).withMessage('A senha deve ter entre 8 e 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('A senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial'),
  
  // CORREÇÃO: Adicionada validação de confirmação de senha
  body('confirmPassword')
    .notEmpty().withMessage('A confirmação de senha é obrigatória')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('As senhas não coincidem');
      }
      return true;
    }),
  
  body('nationality')
    .optional()
    .isLength({ min: 2, max: 50 }).withMessage('A nacionalidade deve ter entre 2 e 50 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/).withMessage('Nacionalidade deve conter apenas letras e espaços')
    .customSanitizer(sanitizeInput),
  
  // Validação de termos de uso
  body('acceptTerms')
    .isBoolean().withMessage('Aceitação dos termos deve ser verdadeiro ou falso')
    .equals('true').withMessage('Você deve aceitar os termos de uso'),
  
  validateRequest
];

// Validação para login - MELHORADA
exports.validateLogin = [
  authLimiter,
  
  body('email')
    .notEmpty().withMessage('O email é obrigatório')
    .isEmail().withMessage('Formato de email inválido')
    .normalizeEmail()
    .customSanitizer(sanitizeInput),
  
  body('password')
    .notEmpty().withMessage('A senha é obrigatória')
    .isLength({ min: 1, max: 128 }).withMessage('Senha inválida'),
  
  // Proteção contra ataques de timing
  body('email').custom(async (email) => {
    // Simular delay consistente para prevenir timing attacks
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
    return true;
  }),
  
  validateRequest
];

// Validação para alteração de senha - MELHORADA
exports.validateChangePassword = [
  body('currentPassword')
    .notEmpty().withMessage('A senha atual é obrigatória')
    .isLength({ min: 1, max: 128 }).withMessage('Senha atual inválida'),
  
  body('newPassword')
    .notEmpty().withMessage('A nova senha é obrigatória')
    .isLength({ min: 8, max: 128 }).withMessage('A nova senha deve ter entre 8 e 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('A nova senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('A nova senha deve ser diferente da senha atual');
      }
      return true;
    }),
  
  // CORREÇÃO: Adicionada confirmação da nova senha
  body('confirmNewPassword')
    .notEmpty().withMessage('A confirmação da nova senha é obrigatória')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('As novas senhas não coincidem');
      }
      return true;
    }),
  
  validateRequest
];

// Validação para recuperação de senha
exports.validateForgotPassword = [
  authLimiter,
  
  body('email')
    .notEmpty().withMessage('O email é obrigatório')
    .isEmail().withMessage('Formato de email inválido')
    .normalizeEmail()
    .customSanitizer(sanitizeInput),
  
  validateRequest
];

// Validação para redefinição de senha
exports.validateResetPassword = [
  body('token')
    .notEmpty().withMessage('Token de recuperação é obrigatório')
    .isLength({ min: 32, max: 128 }).withMessage('Token inválido'),
  
  body('password')
    .notEmpty().withMessage('A nova senha é obrigatória')
    .isLength({ min: 8, max: 128 }).withMessage('A senha deve ter entre 8 e 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('A senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial'),
  
  body('confirmPassword')
    .notEmpty().withMessage('A confirmação de senha é obrigatória')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('As senhas não coincidem');
      }
      return true;
    }),
  
  validateRequest
];

// Exportar também o rate limiter para uso em rotas específicas
exports.authLimiter = authLimiter;