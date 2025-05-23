const app = require('./src/app');
const dotenv = require('dotenv');
const logger = require('./src/utils/logger');

// Carregar variáveis de ambiente
dotenv.config();

// Porta do servidor
const PORT = process.env.PORT || 3000;

// Iniciar o servidor
app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
  logger.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Documentação Swagger: http://localhost:${PORT}/api-docs`);
});