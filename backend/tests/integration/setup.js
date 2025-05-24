const request = require('supertest');
const knex = require('knex');
const app = require('../../src/app');
const config = require('../../knexfile');

// Configuração do banco de dados de teste (in-memory SQLite)
const db = knex(config.test);

// Função para setup antes de todos os testes
const setupTestDB = async () => {
  try {
    // Executar migrations em um banco de dados em memória
    await db.migrate.latest();
    
    // Executar seeds para dados de teste
    await db.seed.run();
    
    return db;
  } catch (error) {
    console.error('Erro ao configurar banco de dados de teste:', error);
    throw error;
  }
};

// Função para limpar o banco após os testes
const teardownTestDB = async () => {
  try {
    // Reverter migrations
    await db.migrate.rollback(true);
    
    // Fechar conexão
    await db.destroy();
  } catch (error) {
    console.error('Erro ao limpar banco de dados de teste:', error);
  }
};

// Helper para gerar um token de teste
const generateTestToken = async (role = 'user') => {
  const jwt = require('jsonwebtoken');
  
  // Gerar um token com o papel especificado para testes
  return jwt.sign(
    { id: role === 'admin' ? 1 : (role === 'partner' ? 4 : 2), email: 'test@example.com', role },
    process.env.JWT_SECRET || 'test_secret',
    { expiresIn: '1h' }
  );
};

module.exports = {
  app,
  request,
  setupTestDB,
  teardownTestDB,
  generateTestToken
};