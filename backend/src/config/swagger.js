const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API AmazôniaExperience',
      version: '0.1.0',
      description: 'Documentação da API da plataforma AmazôniaExperience para a COP30',
      contact: {
        name: 'Equipe de Desenvolvimento',
        email: 'dev@amazonia-experience.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Servidor de Desenvolvimento'
      },
      {
        url: 'https://api.amazonia-experience.com/api',
        description: 'Servidor de Produção'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/models/*.js',
    './src/app.js'
  ]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Função para configurar o Swagger no app Express
const setupSwagger = (app) => {
  // Rota para documentação Swagger
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }'
  }));

  // Rota para JSON do Swagger
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('Documentação Swagger disponível em /api-docs');
};

module.exports = setupSwagger;