import express from 'express';
import dotenv from 'dotenv';
import app from './src/app.js';
import db from './src/config/database.js';

// Carrega variáveis de ambiente
dotenv.config();

const PORT = process.env.PORT || 3000;

// Função para testar conexão com banco de dados
const testDatabaseConnection = async () => {
  try {
    await db.raw('SELECT 1');
    console.log('✅ Conexão com banco de dados estabelecida com sucesso');
  } catch (error) {
    console.error('❌ Erro ao conectar com banco de dados:', error.message);
    process.exit(1);
  }
};

// Função para iniciar o servidor
const startServer = async () => {
  try {
    // Testar conexão com banco
    await testDatabaseConnection();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(` Servidor rodando na porta ${PORT}`);
      console.log(` Documentação Swagger disponível em: http://localhost:${PORT}/api-docs`);
      console.log(` API Status: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(' Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Tratar encerramento gracioso
process.on('SIGTERM', async () => {
  console.log(' Recebido SIGTERM, encerrando servidor...');
  await db.destroy();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log(' Recebido SIGINT, encerrando servidor...');
  await db.destroy();
  process.exit(0);
});

// Iniciar aplicação
startServer();