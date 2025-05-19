import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../services/i18n';

import EmergencyPage from '../emergency/EmergencyPage';

// Mock dos componentes filhos
jest.mock('../emergency/EmergencyServiceTypes', () => {
  return function MockedServiceTypes({ selectedType, onChange }) {
    return (
      <div data-testid="emergency-service-types">
        <button onClick={() => onChange('hospital')}>Hospital</button>
        <button onClick={() => onChange(null)}>All</button>
      </div>
    );
  };
});

jest.mock('../emergency/NearbyEmergencyServices', () => {
  return function MockedNearbyServices({ selectedType, onServiceClick }) {
    return (
      <div data-testid="nearby-emergency-services">
        Nearby Services - Type: {selectedType || 'all'}
        <button onClick={() => onServiceClick({ id: 1, name: 'Test Service' })}>
          Click Service
        </button>
      </div>
    );
  };
});

jest.mock('../emergency/EmergencyContacts', () => {
  return function MockedContacts({ contacts, isLoading }) {
    return (
      <div data-testid="emergency-contacts">
        Contacts {isLoading ? 'Loading...' : 'Loaded'}
      </div>
    );
  };
});

jest.mock('../emergency/EmergencyPhrases', () => {
  return function MockedPhrases({ phrases, isLoading }) {
    return (
      <div data-testid="emergency-phrases">
        Phrases {isLoading ? 'Loading...' : 'Loaded'}
      </div>
    );
  };
});

jest.mock('../emergency/EmergencyCallButton', () => {
  return function MockedCallButton({ serviceType, label }) {
    return (
      <button data-testid={`emergency-call-${serviceType}`}>
        {label || serviceType}
      </button>
    );
  };
});

// Configuração do mock da store
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Estado inicial mockado
const initialState = {
  emergency: {
    services: {
      data: [
        { id: 1, name: 'Hospital A', service_type: 'hospital' },
        { id: 2, name: 'Police Station', service_type: 'police' }
      ],
      isLoading: false,
      error: null
    },
    servicesByType: {
      data: [],
      isLoading: false,
      error: null
    },
    nearbyServices: {
      data: [],
      isLoading: false,
      error: null
    },
    contacts: {
      data: {
        emergency: {
          'Emergency Number': '112'
        }
      },
      isLoading: false,
      error: null
    },
    phrases: {
      data: {
        medical: [
          { id: 1, text: 'I need help', translation: 'Eu preciso de ajuda' }
        ]
      },
      isLoading: false,
      error: null
    }
  },
  ui: {
    modal: {
      isOpen: false,
      type: null,
      data: null
    }
  }
};

// Mock de useLocation e useNavigate do react-router-dom
const mockLocation = {
  pathname: '/emergency',
  search: '',
  hash: '',
  state: null
};

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockLocation,
  useNavigate: () => mockNavigate
}));

// Mock de useGeolocation e useEmergency
jest.mock('../../hooks', () => ({
  useGeolocation: () => ({
    location: { latitude: -1.455833, longitude: -48.503889 },
    error: null,
    loading: false
  }),
  useEmergency: () => ({
    services: [
      { id: 1, name: 'Hospital A', service_type: 'hospital' },
      { id: 2, name: 'Police Station', service_type: 'police' }
    ],
    servicesLoading: false,
    servicesError: null,
    contacts: {
      emergency: {
        'Emergency Number': '112'
      }
    },
    contactsLoading: false,
    phrases: {
      medical: [
        { id: 1, text: 'I need help', translation: 'Eu preciso de ajuda' }
      ]
    },
    phrasesLoading: false
  }),
  useNearby: () => ({
    nearby: [],
    isLoading: false,
    error: null,
    fetchNearby: jest.fn(),
    formatDistance: jest.fn()
  })
}));

describe('EmergencyPage Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore(initialState);
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter>
            <EmergencyPage />
          </MemoryRouter>
        </I18nextProvider>
      </Provider>
    );

    // Verificar se elementos principais estão presentes
    expect(screen.getByText(/emergency/i)).toBeInTheDocument();
    expect(screen.getByTestId('emergency-service-types')).toBeInTheDocument();
  });

  test('changes tab when clicked', async () => {
    render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter>
            <EmergencyPage />
          </MemoryRouter>
        </I18nextProvider>
      </Provider>
    );

    // Deve começar com a aba "nearby" ativa
    expect(screen.getByTestId('nearby-emergency-services')).toBeInTheDocument();
    
    // Clicar na aba de contatos
    const contactsTab = screen.getByText(/contacts/i);
    fireEvent.click(contactsTab);
    
    // Verificar se a aba de contatos está ativa
    await waitFor(() => {
      expect(screen.getByTestId('emergency-contacts')).toBeInTheDocument();
      expect(screen.queryByTestId('nearby-emergency-services')).not.toBeInTheDocument();
    });
    
    // Clicar na aba de frases
    const phrasesTab = screen.getByText(/phrases/i);
    fireEvent.click(phrasesTab);
    
    // Verificar se a aba de frases está ativa
    await waitFor(() => {
      expect(screen.getByTestId('emergency-phrases')).toBeInTheDocument();
      expect(screen.queryByTestId('emergency-contacts')).not.toBeInTheDocument();
    });
  });

  test('changes service type when filter is clicked', async () => {
    render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter>
            <EmergencyPage />
          </MemoryRouter>
        </I18nextProvider>
      </Provider>
    );

    // Clicar no filtro de hospital
    const hospitalFilter = screen.getByText('Hospital');
    fireEvent.click(hospitalFilter);
    
    // Verificar se o URL foi atualizado
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        search: expect.stringContaining('type=hospital')
      })
    );
    
    // Clicar no filtro "Todos"
    const allFilter = screen.getByText('All');
    fireEvent.click(allFilter);
    
    // Verificar se o URL foi atualizado para remover o filtro
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        search: ''
      })
    );
  });

  test('opens service detail modal on service click', () => {
    render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter>
            <EmergencyPage />
          </MemoryRouter>
        </I18nextProvider>
      </Provider>
    );

    // Clicar em um serviço
    const serviceButton = screen.getByText('Click Service');
    fireEvent.click(serviceButton);
    
    // Verificar se a ação de abrir modal foi disparada
    const actions = store.getActions();
    expect(actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'ui/openModal',
          payload: expect.objectContaining({
            type: 'emergency-service-detail'
          })
        })
      ])
    );
  });

  test('renders emergency call buttons', () => {
    render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter>
            <EmergencyPage />
          </MemoryRouter>
        </I18nextProvider>
      </Provider>
    );

    // Verificar se os botões de chamada de emergência estão presentes
    expect(screen.getByTestId('emergency-call-ambulance')).toBeInTheDocument();
    expect(screen.getByTestId('emergency-call-police')).toBeInTheDocument();
    expect(screen.getByTestId('emergency-call-fire')).toBeInTheDocument();
  });
});