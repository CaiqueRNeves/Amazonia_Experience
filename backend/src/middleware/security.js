import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { body, query, param, validationResult } from 'express-validator';
import { ValidationError } from './error.js';

/**
 * Middleware de segurança aprimorado para proteção da API
 */

// Rate limiting diferenciado por tipo de endpoint
const createRateLimit = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message
  },
  // Função personalizada para gerar chave (pode incluir user ID se autenticado)
  keyGenerator: (req) => {
    return req.user?.id ? `${req.ip}-${req.user.id}` : req.ip;
  }
});

// Rate limits específicos
export const rateLimits = {
  // Autenticação - muito restritivo
  auth: createRateLimit(
    15 * 60 * 1000, // 15 minutos
    5, // 5 tentativas
    'Muitas tentativas de login. Tente novamente em 15 minutos.'
  ),
  
  // API geral - moderado
  general: createRateLimit(
    15 * 60 * 1000, // 15 minutos
    100, // 100 requisições
    'Muitas requisições. Tente novamente mais tarde.'
  ),
  
  // Check-ins - moderado (para evitar spam)
  checkin: createRateLimit(
    5 * 60 * 1000, // 5 minutos
    10, // 10 check-ins
    'Muitos check-ins em pouco tempo. Aguarde um momento.'
  ),
  
  // Chat - moderado
  chat: createRateLimit(
    60 * 1000, // 1 minuto
    20, // 20 mensagens
    'Muitas mensagens enviadas. Aguarde um momento.'
  ),
  
  // Emergência - mais permissivo (não deve bloquear emergências reais)
  emergency: createRateLimit(
    60 * 1000, // 1 minuto
    50, // 50 requisições
    'Limite temporário atingido.'
  ),
  
  // Upload de arquivos - mais restritivo
  upload: createRateLimit(
    60 * 60 * 1000, // 1 hora
    10, // 10 uploads
    'Muitos uploads. Tente novamente mais tarde.'
  )
};

/**
 * Configuração de segurança com Helmet
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", process.env.API_URL || "http://localhost:3000"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      workerSrc: ["'self'", "blob:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Necessário para alguns recursos do PWA
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

/**
 * Sanitização de entrada para prevenir XSS e injection
 */
export const sanitizeInput = (value) => {
  if (typeof value !== 'string') return value;
  
  return value
    .trim()
    // Remove scripts
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove eventos JavaScript
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove javascript: URLs
    .replace(/javascript:/gi, '')
    // Remove data: URLs suspeitas
    .replace(/data:(?!image\/[a-z]+;base64,)[^;]+;/gi, '')
    // Limita comprimento
    .substring(0, 10000);
};

/**
 * Middleware para sanitização automática
 */
export const sanitizeRequest = (req, res, next) => {
  // Sanitizar query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeInput(req.query[key]);
      }
    });
  }
  
  // Sanitizar body (exceto uploads de arquivo)
  if (req.body && req.headers['content-type']?.includes('application/json')) {
    const sanitizeObject = (obj) => {
      if (typeof obj !== 'object' || obj === null) return obj;
      
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      
      const sanitized = {};
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string') {
          sanitized[key] = sanitizeInput(obj[key]);
        } else if (typeof obj[key] === 'object') {
          sanitized[key] = sanitizeObject(obj[key]);
        } else {
          sanitized[key] = obj[key];
        }
      });
      
      return sanitized;
    };
    
    req.body = sanitizeObject(req.body);
  }
  
  next();
};

/**
 * Validadores comuns para proteção de entrada
 */
export const commonValidators = {
  // Validação de ID
  validateId: param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número inteiro positivo'),
  
  // Validação de coordenadas
  validateCoordinates: [
    query('latitude')
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude deve estar entre -90 e 90'),
    query('longitude')
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude deve estar entre -180 e 180')
  ],
  
  // Validação de paginação
  validatePagination: [
    query('page')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Página deve ser entre 1 e 1000'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limite deve ser entre 1 e 100')
  ],
  
  // Validação de texto livre (busca, comentários)
  validateText: (field, maxLength = 500) => 
    body(field)
      .optional()
      .isLength({ max: maxLength })
      .withMessage(`${field} deve ter no máximo ${maxLength} caracteres`)
      .customSanitizer(sanitizeInput),
  
  // Validação de email
  validateEmail: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  
  // Middleware para verificar resultados de validação
  checkValidation: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors.array().map(error => error.msg);
      throw new ValidationError(messages.join(', '));
    }
    next();
  }
};

/**
 * Middleware para log de segurança
 */
export const securityLogger = (req, res, next) => {
  // Detectar potenciais ataques
  const suspiciousPatterns = [
    /(\<script[^>]*\>.*\<\/script\>)/gi,
    /(union.*select|select.*from|insert.*into|delete.*from)/gi,
    /(eval\(|setTimeout\(|setInterval\()/gi,
    /(\.\.\/)|(\.\.\\)/gi
  ];
  
  const logSuspicious = (source, data) => {
    suspiciousPatterns.forEach(pattern => {
      if (pattern.test(JSON.stringify(data))) {
        console.warn('Suspicious request detected:', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          url: req.originalUrl,
          source,
          timestamp: new Date().toISOString()
        });
      }
    });
  };
  
  // Verificar query parameters
  if (req.query) logSuspicious('query', req.query);
  
  // Verificar body
  if (req.body) logSuspicious('body', req.body);
  
  next();
};

/**
 * Middleware para proteção CSRF simples
 */
export const csrfProtection = (req, res, next) => {
  // Para métodos que modificam dados, verificar origem
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const origin = req.get('Origin') || req.get('Referer');
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.ADMIN_URL,
      'http://localhost:3000',
      'http://localhost:3001'
    ].filter(Boolean);
    
    if (origin && !allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: Invalid origin'
      });
    }
  }
  
  next();
};

/**
 * Middleware para proteção contra enumeração de usuários
 */
export const preventUserEnumeration = (req, res, next) => {
  // Adicionar delay aleatório pequeno para mascarar timing
  const delay = Math.floor(Math.random() * 100) + 50;
  setTimeout(() => next(), delay);
};