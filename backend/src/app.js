const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./middleware/error');
const setupSwagger = require('./config/swagger');

// Importação das rotas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const placeRoutes = require('./routes/placeRoutes');
const rewardRoutes = require('./routes/rewardRoutes');
const quizRoutes = require('./routes/quizRoutes');
const chatRoutes = require('./routes/chatRoutes');
const connectivityRoutes = require('./routes/connectivityRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middleware básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(morgan('dev'));

// CORREÇÃO: Rate limiting consistente
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Muitas requisições, tente novamente mais tarde'
  }
});
app.use(limiter);

// Configurar Swagger
setupSwagger(app);

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/connectivity', connectivityRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/admin', adminRoutes);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Verificação básica de status da API
 *     description: Retorna informações básicas sobre a API, como versão e status
 *     tags: [Status]
 *     responses:
 *       200:
 *         description: Resposta de sucesso com informações da API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Bem-vindo à API da AmazôniaExperience
 *                 version:
 *                   type: string
 *                   example: 0.1.0
 *                 status:
 *                   type: string
 *                   example: online
 */
// Rota padrão
app.get('/', (req, res) => {
  res.json({
    message: 'Bem-vindo à API da AmazôniaExperience',
    version: '0.1.0',
    status: 'online'
  });
});

// Middleware de tratamento de erro
app.use(errorHandler);

/**
 * @swagger
 * /404:
 *   get:
 *     summary: Rota não encontrada
 *     description: Exemplo de resposta para rotas não encontradas
 *     tags: [Errors]
 *     responses:
 *       404:
 *         description: Rota não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Rota não encontrada
 */
// Middleware para rotas não encontradas
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'Rota não encontrada'
  });
});

module.exports = app;