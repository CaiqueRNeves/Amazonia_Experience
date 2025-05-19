import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { I18nextProvider } from 'react-i18next';

import store from './redux/store';
import i18n from './services/i18n';
import AppRoutes from './routes/AppRoutes';
import Loader from './components/common/Loader';
import ErrorBoundary from './components/common/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { LocationProvider } from './contexts/LocationContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Estilos globais
import 'react-toastify/dist/ReactToastify.css';
import './assets/styles/main.css';

/**
 * Componente principal da aplicação
 * Configura os provedores de contexto, rotas e serviços globais
 */
function App() {
  // Registrar service worker (PWA)
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then(registration => {
            console.log('Service Worker registrado com sucesso:', registration);
          })
          .catch(error => {
            console.error('Erro ao registrar Service Worker:', error);
          });
      });
    }
  }, []);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          {/* Contextos da aplicação */}
          <AuthProvider>
            <LocationProvider>
              <NotificationProvider>
                <Router>
                  {/* Fallback para carregamento de componentes assíncronos */}
                  <Suspense fallback={<Loader fullScreen message="Carregando AmazôniaExperience..." />}>
                    {/* Rotas da aplicação */}
                    <AppRoutes />
                    
                    {/* Notifications */}
                    <ToastContainer
                      position="top-right"
                      autoClose={5000}
                      hideProgressBar={false}
                      newestOnTop
                      closeOnClick
                      rtl={false}
                      pauseOnFocusLoss
                      draggable
                      pauseOnHover
                      theme="colored"
                    />
                  </Suspense>
                </Router>
              </NotificationProvider>
            </LocationProvider>
          </AuthProvider>
        </I18nextProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;