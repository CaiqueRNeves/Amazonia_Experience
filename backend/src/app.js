import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/error.js';
import setupSwagger from './config/swagger.js';

// Importação das rotas
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import placeRoutes from './routes/placeRoutes.js';
import rewardRoutes from './routes/rewardRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import connectivityRoutes from './routes/connectivityRoutes.js';
import emergencyRoutes from './routes/emergencyRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

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

// Rate limiting consistente
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

export default app;