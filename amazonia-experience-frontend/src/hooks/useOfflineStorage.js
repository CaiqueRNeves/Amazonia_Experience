import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * Hook personalizado para localização offline
 * Fornece funções para armazenar e recuperar dados localmente
 * Útil para funcionalidades offline da aplicação
 * 
 * @param {string} key - Chave para armazenamento no localStorage
 * @param {any} initialValue - Valor inicial caso não haja dados armazenados
 * @param {Object} options - Opções de configuração
 * @param {boolean} options.sync - Se deve sincronizar com o servidor quando voltar online
 * @param {function} options.syncFunction - Função para sincronizar dados com o servidor
 * @returns {Array} [storedValue, setValue, status, sync]
 */
const useOfflineStorage = (key, initialValue, { sync = false, syncFunction = null } = {}) => {
  // Estado para armazenar o valor atual
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Tenta obter do localStorage
      const item = window.localStorage.getItem(key);
      // Converte de JSON para objeto/array ou retorna o valor inicial
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Erro ao recuperar ${key} do localStorage:`, error);
      return initialValue;
    }
  });

  // Estado para rastrear status de sincronização
  const [status, setStatus] = useState({
    isOnline: navigator.onLine,
    lastSynced: null,
    pendingSync: false
  });

  // Ref para armazenar a versão mais recente do storedValue
  const storedValueRef = useRef(storedValue);
  // Ref para armazenar a versão mais recente da função de sincronização
  const syncFunctionRef = useRef(syncFunction);

  // Atualiza as refs quando as dependências mudam
  useEffect(() => {
    storedValueRef.current = storedValue;
    syncFunctionRef.current = syncFunction;
  }, [storedValue, syncFunction]);

  // Função para atualizar o valor no estado e localStorage
  const setValue = useCallback((value) => {
    try {
      // Permite que value seja uma função como em setState
      const valueToStore = value instanceof Function ? value(storedValueRef.current) : value;
      
      // Salva no estado
      setStoredValue(valueToStore);
      
      // Salva no localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      
      // Se sincronização estiver ativada e estiver offline, marca como pendente
      if (sync && !navigator.onLine) {
        setStatus(prevStatus => ({
          ...prevStatus,
          pendingSync: true
        }));
      }
    } catch (error) {
      console.error(`Erro ao salvar ${key} no localStorage:`, error);
    }
  }, [key, sync]);

  // Função para forçar sincronização com o servidor
  const syncWithServer = useCallback(async () => {
    if (!syncFunctionRef.current || !navigator.onLine) {
      return false;
    }

    try {
      setStatus(prev => ({ ...prev, isSyncing: true }));
      await syncFunctionRef.current(storedValueRef.current);
      setStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSynced: new Date().toISOString(),
        pendingSync: false
      }));
      return true;
    } catch (error) {
      console.error('Erro ao sincronizar com o servidor:', error);
      setStatus(prev => ({ ...prev, isSyncing: false, syncError: error.message }));
      return false;
    }
  }, []);

  // Monitora mudanças no estado online/offline
  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
      
      // Tenta sincronizar quando voltar online
      if (sync && prev.pendingSync) {
        syncWithServer();
      }
    };

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [sync, syncWithServer]);

  // Tenta sincronizar quando o componente é montado (se necessário)
  useEffect(() => {
    if (sync && navigator.onLine && status.pendingSync) {
      syncWithServer();
    }
  }, [sync, syncWithServer, status.pendingSync]);

  return [storedValue, setValue, status, syncWithServer];
};

export default useOfflineStorage;