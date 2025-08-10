import request from 'supertest';
import knex from 'knex';
import app from '../../src/app.js';
import config from '../../knexfile.js';
import jwt from 'jsonwebtoken';

const db = knex(config.test);

export const setupTestDB = async () => {
  try {
    await db.migrate.latest();
    await db.seed.run();
    return db;
  } catch (error) {
    console.error('Erro ao configurar banco de dados de teste:', error);
    throw error;
  }
};

export const teardownTestDB = async () => {
  try {
    await db.migrate.rollback(true);
    await db.destroy();
  } catch (error) {
    console.error('Erro ao limpar banco de dados de teste:', error);
  }
};

export const generateTestToken = async (role = 'user') => {
  return jwt.sign(
    { id: role === 'admin' ? 1 : (role === 'partner' ? 4 : 2), email: 'test@example.com', role },
    process.env.JWT_SECRET || 'test_secret',
    { expiresIn: '1h' }
  );
};

export { app, request };
