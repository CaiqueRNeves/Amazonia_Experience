const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

/**
 * Configuração do servidor Express
 * @param {Object} app - Instância do Express
 */
const setupServer = (app) => {
  // Middlewares essenciais
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Segurança
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", process.env.API_URL, 'https://*.mapbox.com'],
        imgSrc: ["'self'", 'data:', 'https://*.mapbox.com'],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    }
  }));
  
  // CORS
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  
  // Compressão para reduzir tamanho das respostas
  app.use(compression());
  
  // Logging
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }
  
  // Rate limiting para prevenir ataques de força bruta
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // limitar cada IP a 100 requisições por janela
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 'error',
      message: 'Muitas requisições, tente novamente mais tarde'
    }
  });
  
  // Aplicar rate limiting a todas as requisições para API
  app.use('/api', apiLimiter);
  
  // Expor a versão da API
  app.get('/api/version', (req, res) => {
    res.json({
      version: process.env.API_VERSION || '0.1.0',
      environment: process.env.NODE_ENV || 'development'
    });
  });
  
  // Endpoint de health check
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'UP',
      uptime: process.uptime(),
      timestamp: Date.now()
    });
  });
  
  // Configurar cabeçalhos de cache para arquivos estáticos
  const setCache = function (req, res, next) {
    // definir cabeçalho de cache para um dia para arquivos estáticos
    if (process.env.NODE_ENV === 'production') {
      const period = 60 * 60 * 24; // 1 dia
      if (req.method === 'GET') {
        res.set('Cache-control', `public, max-age=${period}`);
      } else {
        // para outros métodos, no cache
        res.set('Cache-control', 'no-store');
      }
    } else {
      // em desenvolvimento, não usar cache
      res.set('Cache-control', 'no-store');
    }
    next();
  };
  
  // Aplicar configurações de cache
  app.use(setCache);
  
  return app;
};

/**
 * Cria e inicia o servidor HTTP
 * @param {Object} app - Instância do Express
 * @param {number} port - Porta do servidor
 * @returns {http.Server} Instância do servidor HTTP
 */
const startServer = (app, port = process.env.PORT || 3000) => {
  const server = http.createServer(app);
  
  server.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  });
  
  // Manipulação de erros de inicialização
  server.on('error', (error) => {
    if (error.syscall !== 'listen') {
      throw error;
    }
    
    const bind = typeof port === 'string' ? `Pipe ${port}` : `Porta ${port}`;
    
    // Mensagens de erro específicas por código
    switch (error.code) {
      case 'EACCES':
        console.error(`${bind} requer privilégios elevados`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`${bind} já está em uso`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  });
  
  // Manipulação de encerramento gracioso
  const gracefulShutdown = () => {
    console.log('Recebido sinal de encerramento. Fechando servidor...');
    server.close(() => {
      console.log('Servidor fechado.');
      process.exit(0);
    });
    
    // Se o servidor não fechar em 10 segundos, forçar saída
    setTimeout(() => {
      console.error('Encerramento não concluído no tempo limite, forçando saída.');
      process.exit(1);
    }, 10000);
  };
  
  // Manipular sinais de encerramento
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
  
  return server;
};

module.exports = {
  setupServer,
  startServer
};