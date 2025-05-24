import React from 'react';
import { createRoot } from 'react-dom/client';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

import App from './app';

// Obtém o elemento raiz da aplicação
const container = document.getElementById('root');
const root = createRoot(container);

// Renderiza a aplicação
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registro do service worker para PWA
// Altere para register() para habilitar os recursos offline
// Ou deixe como unregister() se não quiser os recursos PWA
serviceWorkerRegistration.register({
  onUpdate: registration => {
    // Notifica o usuário quando houver uma nova versão
    const waitingServiceWorker = registration.waiting;

    if (waitingServiceWorker) {
      waitingServiceWorker.addEventListener('statechange', event => {
        if (event.target.state === 'activated') {
          // Nova versão foi instalada, perguntar ao usuário se quer atualizar
          if (window.confirm('Nova versão disponível! Recarregar para atualizar?')) {
            window.location.reload();
          }
        }
      });
      
      // Ativa a nova versão
      waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  },
  onSuccess: registration => {
    console.log('Aplicação disponível offline!', registration);
  }
});

// Relatório de métricas web (opcional)
// Envia dados para um serviço de análise como Google Analytics
reportWebVitals(console.log);