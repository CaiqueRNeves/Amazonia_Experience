import { useState, useEffect } from 'react';

/**
 * Hook personalizado para gerenciar dados no localStorage
 * Permite armazenar e recuperar dados persistentes no navegador
 * 
 * @param {string} key - Chave para o item no localStorage
 * @param {any} initialValue - Valor inicial caso o item não exista no localStorage
 * @returns {[any, function]} Par contendo o valor atual e uma função para atualizá-lo
 */
const useLocalStorage = (key, initialValue) => {
  // Função para obter o valor inicial do localStorage ou usar o valor padrão
  const getStoredValue = () => {
    try {
      // Tenta obter o item do localStorage
      const item = window.localStorage.getItem(key);
      
      // Se o item existe, converte de JSON para o tipo original
      // Se não existe, retorna o valor inicial
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Em caso de erro (por exemplo, JSON inválido), retorna o valor inicial
      console.error(`Erro ao obter item '${key}' do localStorage:`, error);
      return initialValue;
    }
  };

  // Estado para armazenar o valor atual
  const [storedValue, setStoredValue] = useState(getStoredValue);

  // Função para atualizar o valor no estado e no localStorage
  const setValue = (value) => {
    try {
      // Permite que a função receba um valor ou uma função que recebe o valor atual
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Atualiza o estado
      setStoredValue(valueToStore);
      
      // Atualiza o localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Erro ao salvar item '${key}' no localStorage:`, error);
    }
  };

  // Efeito para sincronizar com mudanças externas no localStorage (outros componentes ou abas)
  useEffect(() => {
    // Função para lidar com mudanças no localStorage
    const handleStorageChange = (event) => {
      if (event.key === key) {
        try {
          // Atualiza o estado se a chave atual for modificada
          const newValue = event.newValue ? JSON.parse(event.newValue) : initialValue;
          setStoredValue(newValue);
        } catch (error) {
          console.error(`Erro ao processar mudança no localStorage para '${key}':`, error);
        }
      }
    };

    // Adiciona o listener para o evento 'storage'
    window.addEventListener('storage', handleStorageChange);
    
    // Remove o listener quando o componente for desmontado
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]);

  return [storedValue, setValue];
};

export default useLocalStorage;