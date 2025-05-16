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

// Validação para criação de local
exports.validateCreatePlace = [
  body('name')
    .notEmpty().withMessage('O nome é obrigatório')
    .isLength({ min: 3, max: 100 }).withMessage('O nome deve ter entre 3 e 100 caracteres'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 }).withMessage('A descrição deve ter no máximo 1000 caracteres'),
  
  body('address')
    .notEmpty().withMessage('O endereço é obrigatório')
    .isLength({ min: 5, max: 200 }).withMessage('O endereço deve ter entre 5 e 200 caracteres'),
  
  body('latitude')
    .notEmpty().withMessage('A latitude é obrigatória')
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude inválida'),
  
  body('longitude')
    .notEmpty().withMessage('A longitude é obrigatória')
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude inválida'),
  
  body('type')
    .notEmpty().withMessage('O tipo é obrigatório')
    .isIn(['tourist_spot', 'restaurant', 'shop', 'cultural_venue']).withMessage('Tipo inválido'),
  
  body('amacoins_value')
    .notEmpty().withMessage('O valor em AmaCoins é obrigatório')
    .isInt({ min: 1, max: 100 }).withMessage('O valor deve estar entre 1 e 100 AmaCoins'),
  
  body('partner_id')
    .optional()
    .isInt({ min: 1 }).withMessage('ID de parceiro inválido'),
  
  body('opening_hours')
    .optional()
    .isLength({ max: 100 }).withMessage('O horário de funcionamento deve ter no máximo 100 caracteres'),
  
  body('wifi_available')
    .optional()
    .isBoolean().withMessage('O valor para disponibilidade de Wi-Fi deve ser um booleano'),
  
  validateRequest
];

// Validação para atualização de local
exports.validateUpdatePlace = [
  body('name')
    .optional()
    .isLength({ min: 3, max: 100 }).withMessage('O nome deve ter entre 3 e 100 caracteres'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 }).withMessage('A descrição deve ter no máximo 1000 caracteres'),
  
  body('address')
    .optional()
    .isLength({ min: 5, max: 200 }).withMessage('O endereço deve ter entre 5 e 200 caracteres'),
  
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude inválida'),
  
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude inválida'),
  
  body('type')
    .optional()
    .isIn(['tourist_spot', 'restaurant', 'shop', 'cultural_venue']).withMessage('Tipo inválido'),
  
  body('amacoins_value')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('O valor deve estar entre 1 e 100 AmaCoins'),
  
  body('partner_id')
    .optional()
    .isInt({ min: 1 }).withMessage('ID de parceiro inválido'),
  
  validateRequest
];

// Validação para criação de parceiro
exports.validateCreatePartner = [
  body('user_id')
    .notEmpty().withMessage('O ID do usuário é obrigatório')
    .isInt({ min: 1 }).withMessage('ID de usuário inválido'),
  
  body('business_name')
    .notEmpty().withMessage('O nome do negócio é obrigatório')
    .isLength({ min: 3, max: 100 }).withMessage('O nome do negócio deve ter entre 3 e 100 caracteres'),
  
  body('business_type')
    .notEmpty().withMessage('O tipo de negócio é obrigatório')
    .isIn(['event_organizer', 'tourist_spot', 'shop', 'restaurant', 'app_service']).withMessage('Tipo de negócio inválido'),
  
  body('address')
    .notEmpty().withMessage('O endereço é obrigatório')
    .isLength({ min: 5, max: 200 }).withMessage('O endereço deve ter entre 5 e 200 caracteres'),
  
  body('contact_phone')
    .optional()
    .isLength({ min: 8, max: 20 }).withMessage('O telefone deve ter entre 8 e 20 caracteres'),
  
  validateRequest
];

// Validação para atualização de função de usuário
exports.validateUpdateRole = [
  body('role')
    .notEmpty().withMessage('A função é obrigatória')
    .isIn(['user', 'partner', 'admin']).withMessage('Função inválida'),
  
  validateRequest
];

// Validação para criação de quiz
exports.validateCreateQuiz = [
  body('title')
    .notEmpty().withMessage('O título é obrigatório')
    .isLength({ min: 3, max: 100 }).withMessage('O título deve ter entre 3 e 100 caracteres'),
  
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('A descrição deve ter no máximo 500 caracteres'),
  
  body('difficulty')
    .notEmpty().withMessage('A dificuldade é obrigatória')
    .isIn(['easy', 'medium', 'hard']).withMessage('Dificuldade inválida'),
  
  body('topic')
    .notEmpty().withMessage('O tópico é obrigatório')
    .isLength({ min: 3, max: 50 }).withMessage('O tópico deve ter entre 3 e 50 caracteres'),
  
  body('amacoins_reward')
    .notEmpty().withMessage('A recompensa em AmaCoins é obrigatória')
    .isInt({ min: 10, max: 500 }).withMessage('A recompensa deve estar entre 10 e 500 AmaCoins'),
  
  body('questions')
    .isArray({ min: 1 }).withMessage('O quiz deve ter pelo menos uma pergunta'),
  
  body('questions.*.question_text')
    .notEmpty().withMessage('O texto da pergunta é obrigatório'),
  
  body('questions.*.question_type')
    .notEmpty().withMessage('O tipo da pergunta é obrigatório')
    .isIn(['multiple_choice', 'true_false', 'open_ended']).withMessage('Tipo de pergunta inválido'),
  
  body('questions.*.options')
    .if(body('questions.*.question_type').equals('multiple_choice'))
    .isArray({ min: 2, max: 5 }).withMessage('Perguntas de múltipla escolha devem ter entre 2 e 5 opções'),
  
  body('questions.*.correct_answer')
    .notEmpty().withMessage('A resposta correta é obrigatória'),
  
  validateRequest
];

// Outras validações do admin...
exports.validateUpdateQuiz = [
  // Semelhante ao validateCreateQuiz, mas com campos opcionais
];

exports.validateAddEmergencyService = [
  body('name')
    .notEmpty().withMessage('O nome é obrigatório')
    .isLength({ min: 3, max: 100 }).withMessage('O nome deve ter entre 3 e 100 caracteres'),
  
  body('service_type')
    .notEmpty().withMessage('O tipo de serviço é obrigatório')
    .isIn(['hospital', 'pharmacy', 'police', 'fire_department', 'embassy', 'tourist_police']).withMessage('Tipo de serviço inválido'),
  
  body('address')
    .notEmpty().withMessage('O endereço é obrigatório')
    .isLength({ min: 5, max: 200 }).withMessage('O endereço deve ter entre 5 e 200 caracteres'),
  
  body('latitude')
    .notEmpty().withMessage('A latitude é obrigatória')
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude inválida'),
  
  body('longitude')
    .notEmpty().withMessage('A longitude é obrigatória')
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude inválida'),
  
  body('phone_number')
    .notEmpty().withMessage('O número de telefone é obrigatório')
    .isLength({ min: 8, max: 20 }).withMessage('O telefone deve ter entre 8 e 20 caracteres'),
  
  validateRequest
];

exports.validateUpdateConnectivitySpot = [
  body('id')
    .notEmpty().withMessage('O ID do ponto de conectividade é obrigatório')
    .isInt({ min: 1 }).withMessage('ID inválido'),
  
  body('verified')
    .optional()
    .isBoolean().withMessage('O valor para verificado deve ser um booleano'),
  
  body('wifi_speed')
    .optional()
    .isIn(['slow', 'medium', 'fast']).withMessage('Velocidade Wi-Fi inválida'),
  
  validateRequest
];