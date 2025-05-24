import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { APP_CONFIG } from '../utils/constants';
import { analytics } from '../utils';
import { useNetworkStatus } from '../hooks';

// Criação do contexto
export const AppContext = createContext(null);

/**
 * Provedor principal da aplicação
 * Gerencia estado global e configurações aplicação
 */
export const AppProvider = ({ children }) => {
  const dispatch = useDispatch();
  
  // Estados da aplicação
  const [appVersion, setAppVersion] = useState(APP_CONFIG.VERSION);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState(null);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Verifica status da rede
  const { isOnline, connectionType } = useNetworkStatus();

  // Inicializar aplicação quando o componente for montado
  useEffect(() => {
    initializeApp();
  }, []);

  /**
   * Inicializa a aplicação
   * Carrega configurações, verifica atualizações, etc.
   */
  const initializeApp = async () => {
    setIsInitializing(true);
    setInitError(null);
    
    try {
      // Verificar se é a primeira vez que o usuário acessa o app
      const isFirstVisit = !localStorage.getItem('amazonia_visit');
      
      if (isFirstVisit) {
        localStorage.setItem('amazonia_visit', Date.now().toString());
        setShowOnboarding(true);
      }
      
      // Inicializar analytics
      analytics.initAnalytics({
        enabled: process.env.NODE_ENV === 'production',
        debug: process.env.NODE_ENV !== 'production',
        endpoint: process.env.REACT_APP_ANALYTICS_ENDPOINT
      });
      
      // Verificar modo de manutenção (poderia ser via API)
      setIsMaintenance(false);
      
      // Verificar versão atual
      try {
        // Simulação de verificação de versão via API
        // Na implementação real, seria uma chamada à API
        const versionCheckResponse = { isLatestVersion: true, latestVersion: APP_CONFIG.VERSION };
        
        if (!versionCheckResponse.isLatestVersion) {
          console.log(`Nova versão disponível: ${versionCheckResponse.latestVersion}`);
        }
      } catch (versionError) {
        console.error('Erro ao verificar versão:', versionError);
      }
      
      // Rastrear inicialização no analytics
      analytics.trackEvent('app_initialized', {
        version: APP_CONFIG.VERSION,
        isFirstVisit,
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        isOnline
      });
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Erro ao inicializar aplicação:', error);
      setInitError(error.message || 'Erro ao inicializar aplicação');
      
      // Rastrear erro no analytics
      analytics.trackError(error, {
        context: 'app_initialization'
      });
    } finally {
      setIsInitializing(false);
    }
  };

  /**
   * Reinicia a aplicação
   * Útil após logout ou quando ocorre um erro fatal
   */
  const restartApp = useCallback(() => {
    // Limpar cache, se necessário
    
    // Recarregar a página
    window.location.reload();
  }, []);

  /**
   * Completa o onboarding
   * Marca que o usuário já viu as telas iniciais
   */
  const completeOnboarding = useCallback(() => {
    setShowOnboarding(false);
    localStorage.setItem('amazonia_onboarding_completed', 'true');
  }, []);

  // Valores expostos pelo contexto
  const value = {
    // Estados
    appVersion,
    isInitialized,
    isInitializing,
    initError,
    isMaintenance,
    isOnline,
    connectionType,
    showOnboarding,
    
    // Funções
    initializeApp,
    restartApp,
    completeOnboarding,
    
    // Constantes
    APP_CONFIG
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Hook personalizado para usar o contexto da aplicação
export const useApp = () => {
  const context = React.useContext(AppContext);
  
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  
  return context;
};

export default { AppContext, AppProvider, useApp };