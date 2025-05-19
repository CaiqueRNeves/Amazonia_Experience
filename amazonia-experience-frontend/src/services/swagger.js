const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const fs = require('fs');
const errorService = require('./errorService');

/**
 * Serviço para configuração e gerenciamento do Swagger
 * Gera documentação da API baseada em comentários JSDoc
 */
const swaggerService = {
  /**
   * Opções de configuração para o Swagger
   */
  options: {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'API AmazôniaExperience',
        version: process.env.API_VERSION || '0.1.0',
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
          url: process.env.NODE_ENV === 'production' 
            ? 'https://api.amazonia-experience.com/api'
            : 'http://localhost:3000/api',
          description: process.env.NODE_ENV === 'production' 
            ? 'Servidor de Produção' 
            : 'Servidor de Desenvolvimento'
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
  },

  /**
   * Gera especificação do Swagger
   * @returns {Object} Especificação do Swagger
   */
  generateSpec() {
    try {
      // Adicionar automáticamente todos os arquivos de rota como APIs
      const routesDir = path.join(__dirname, '../routes');
      
      if (fs.existsSync(routesDir)) {
        const routeFiles = fs.readdirSync(routesDir)
          .filter(file => file.endsWith('.js'))
          .map(file => path.join(routesDir, file));
          
        this.options.apis = [
          ...this.options.apis,
          ...routeFiles
        ];
      }
      
      // Gerar a especificação do Swagger
      return swaggerJsdoc(this.options);
    } catch (error) {
      errorService.logError({
        message: 'Erro ao gerar especificação do Swagger',
        error
      });
      
      // Retornar uma especificação mínima em caso de erro
      return {
        openapi: '3.0.0',
        info: {
          title: 'API AmazôniaExperience (Erro)',
          version: '0.1.0',
          description: 'Ocorreu um erro ao gerar a documentação.'
        },
        paths: {}
      };
    }
  },

  /**
   * Configura o Swagger no aplicativo Express
   * @param {Object} app - Instância do Express
   */
  setup(app) {
    try {
      const swaggerSpec = this.generateSpec();
      
      // Configurar rota para UI do Swagger
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
    } catch (error) {
      errorService.logError({
        message: 'Erro ao configurar Swagger',
        error
      });
      
      console.error('Não foi possível configurar o Swagger:', error.message);
    }
  },

  /**
   * Gera documentação estática do Swagger em JSON
   * @param {string} outputPath - Caminho para o arquivo de saída
   * @returns {boolean} Verdadeiro se a operação foi bem-sucedida
   */
  generateStaticDocs(outputPath = './swagger.json') {
    try {
      const swaggerSpec = this.generateSpec();
      
      fs.writeFileSync(
        outputPath, 
        JSON.stringify(swaggerSpec, null, 2),
        'utf8'
      );
      
      console.log(`Documentação Swagger gerada em ${outputPath}`);
      return true;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao gerar documentação estática do Swagger',
        error
      });
      
      console.error('Não foi possível gerar documentação estática:', error.message);
      return false;
    }
  },

  /**
   * Valida a especificação do Swagger
   * @returns {Object} Resultado da validação
   */
  validateSpec() {
    try {
      const swaggerSpec = this.generateSpec();
      
      // Verificações básicas
      const issues = [];
      
      // Verificar se há pelo menos um path
      if (!swaggerSpec.paths || Object.keys(swaggerSpec.paths).length === 0) {
        issues.push('Não há caminhos (paths) definidos na documentação');
      }
      
      // Verificar componentes requeridos
      if (!swaggerSpec.components || !swaggerSpec.components.securitySchemes) {
        issues.push('Esquemas de segurança não estão definidos');
      }
      
      // Verificar informações
      if (!swaggerSpec.info || !swaggerSpec.info.title || !swaggerSpec.info.version) {
        issues.push('Informações básicas (título, versão) estão incompletas');
      }
      
      return {
        valid: issues.length === 0,
        issues
      };
    } catch (error) {
      errorService.logError({
        message: 'Erro ao validar especificação do Swagger',
        error
      });
      
      return {
        valid: false,
        issues: [error.message],
        error
      };
    }
  }
};

module.exports = swaggerService;