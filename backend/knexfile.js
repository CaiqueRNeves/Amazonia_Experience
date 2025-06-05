import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  development: {
    client: 'sqlite3',
    connection: {
      filename: join(__dirname, './src/database/dev.sqlite3')
    },
    useNullAsDefault: true,
    migrations: {
      directory: join(__dirname, './src/database/migrations')
    },
    seeds: {
      directory: join(__dirname, './src/database/seeds')
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
      directory: join(__dirname, './src/database/migrations')
    },
    seeds: {
      directory: join(__dirname, './src/database/seeds')
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
      filename: join(__dirname, './data/production.sqlite3')
    },
    useNullAsDefault: true,
    migrations: {
      directory: join(__dirname, './src/database/migrations')
    },
    seeds: {
      directory: join(__dirname, './src/database/seeds')
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