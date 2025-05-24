const jest = require('jest');

// Configuração do ambiente de teste
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.QUIZ_MAX_ATTEMPTS_PER_DAY = '5';
process.env.QUIZ_DEFAULT_TIMEOUT_MINUTES = '15';

// Configurações do Jest
const jestConfig = {
  testEnvironment: 'node',
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  testTimeout: 10000,
  setupFilesAfterEnv: ['./jest.setup.js']
};

// Executar testes
jest.run(['--config', JSON.stringify(jestConfig)]);