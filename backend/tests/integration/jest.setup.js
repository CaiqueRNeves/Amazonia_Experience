// Configura ambiente de teste
beforeAll(() => {
  // Desativa logs durante os testes, a menos que estejamos debugando
  if (process.env.DEBUG !== 'true') {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  }
});

// Aumenta o timeout para testes de integração
jest.setTimeout(10000);

// Limpa todos os mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});