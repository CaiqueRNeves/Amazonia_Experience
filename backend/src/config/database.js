import knex from 'knex';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Função para garantir que os diretórios existam
const ensureDirectoryExists = (filePath) => {
  const dir = dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Configuração do Knex para diferentes ambientes
const config = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: join(__dirname, '../database/dev.sqlite3')
    },
    useNullAsDefault: true,
    migrations: {
      directory: join(__dirname, '../database/migrations')
    },
    seeds: {
      directory: join(__dirname, '../database/seeds')
    },
    pool: {
      afterCreate: (conn, cb) => {
        conn.run('PRAGMA foreign_keys = ON', cb);
      }
    }
  },
  
  test: {
    client: 'sqlite3',
    connection: ':memory:',
    useNullAsDefault: true,
    migrations: {
      directory: join(__dirname, '../database/migrations')
    },
    seeds: {
      directory: join(__dirname, '../database/seeds')
    },
    pool: {
      afterCreate: (conn, cb) => {
        conn.run('PRAGMA foreign_keys = ON', cb);
      }
    }
  },
  
  production: {
    client: 'sqlite3',
    connection: {
      filename: join(__dirname, '../../data/production.sqlite3')
    },
    useNullAsDefault: true,
    migrations: {
      directory: join(__dirname, '../database/migrations')
    },
    seeds: {
      directory: join(__dirname, '../database/seeds')
    },
    pool: {
      min: 2,
      max: 10,
      afterCreate: (conn, cb) => {
        conn.run('PRAGMA foreign_keys = ON', cb);
      }
    }
  }
};

const environment = process.env.NODE_ENV || 'development';
const currentConfig = config[environment];

// Garantir que o diretório do banco de dados existe
if (currentConfig.connection.filename && currentConfig.connection.filename !== ':memory:') {
  ensureDirectoryExists(currentConfig.connection.filename);
}

const db = knex(currentConfig);

export default db;
export { config };