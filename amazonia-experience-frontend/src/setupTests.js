/**
 * Configuração para testes unitários do React
 * Este arquivo é carregado automaticamente antes dos testes.
 */

// Adiciona matchers personalizados do jest-dom
import '@testing-library/jest-dom';

// Mock para localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => {
      return store[key] || null;
    }),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

// Mock para geolocalização
const geolocationMock = {
  getCurrentPosition: jest.fn(success => 
    success({
      coords: {
        latitude: -1.455833,  // Coordenadas de Belém do Pará
        longitude: -48.503889,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null
      },
      timestamp: Date.now()
    })
  ),
  watchPosition: jest.fn(),
  clearWatch: jest.fn()
};

// Aplicar mocks
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'sessionStorage', { value: localStorageMock });
Object.defineProperty(global.navigator, 'geolocation', { value: geolocationMock });

// Mock para mediaMatch
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});

// Suprimir logs durante os testes
console.error = jest.fn();
console.warn = jest.fn();

// Adicionar funções de Mock globais para componentes específicos
// Útil para componentes que acessam serviços externos
global.mockServiceWorkerRegistration = () => ({
  register: jest.fn().mockResolvedValue({ scope: '/' })
});

// Mock para Intersection Observer
class IntersectionObserverMock {
  constructor(callback) {
    this.callback = callback;
    this.elements = new Set();
    this.thresholds = [];
  }

  observe(element) {
    this.elements.add(element);
    
    // Simula o elemento entrando na tela
    setTimeout(() => {
      this.callback([
        {
          boundingClientRect: element.getBoundingClientRect(),
          intersectionRatio: 1,
          intersectionRect: element.getBoundingClientRect(),
          isIntersecting: true,
          rootBounds: null,
          target: element,
          time: Date.now()
        }
      ]);
    }, 0);
  }

  unobserve(element) {
    this.elements.delete(element);
  }

  disconnect() {
    this.elements.clear();
  }

  takeRecords() {
    return [];
  }
}

global.IntersectionObserver = IntersectionObserverMock;

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});