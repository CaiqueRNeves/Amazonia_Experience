import { useState, useEffect } from 'react';

/**
 * Hook personalizado para monitorar o estado da conexão de rede
 * Útil para implementar recursos offline e retentativas automáticas
 * 
 * @returns {Object} Objeto com informações sobre o estado da conexão
 */
const useNetworkStatus = () => {
  // Estado para armazenar se está online
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Estado para armazenar o tipo de conexão (se disponível)
  const [connectionType, setConnectionType] = useState(
    navigator.connection?.effectiveType || null
  );
  
  // Estado para armazenar informações adicionais da conexão
  const [connectionInfo, setConnectionInfo] = useState({
    downlink: navigator.connection?.downlink,
    rtt: navigator.connection?.rtt,
    saveData: navigator.connection?.saveData
  });

  // Efeito para monitorar mudanças no estado da conexão
  useEffect(() => {
    // Handlers para eventos de mudança de conexão
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Handler para mudanças nas propriedades da conexão (se API disponível)
    const handleConnectionChange = () => {
      if (navigator.connection) {
        setConnectionType(navigator.connection.effectiveType);
        setConnectionInfo({
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt,
          saveData: navigator.connection.saveData
        });
      }
    };

    // Adiciona listeners para os eventos
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Configuração do listener de mudança de conexão (se a API estiver disponível)
    if (navigator.connection) {
      navigator.connection.addEventListener('change', handleConnectionChange);
    }

    // Remove os listeners quando o componente for desmontado
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (navigator.connection) {
        navigator.connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  // Função para testar a conectividade real com um ping
  const checkActualConnectivity = async (url = '/api/ping') => {
    if (!isOnline) return false;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  return {
    isOnline,
    connectionType,
    connectionInfo,
    checkActualConnectivity
  };
};

export default useNetworkStatus;