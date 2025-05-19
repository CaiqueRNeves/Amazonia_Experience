import { useState, useEffect } from 'react';

/**
 * Hook personalizado para debounce de valores
 * Útil para evitar atualizações frequentes em inputs de pesquisa, redimensionamento, etc.
 * 
 * @param {any} value - Valor a ser debounced
 * @param {number} delay - Atraso em milissegundos antes de atualizar o valor
 * @returns {any} Valor com debounce aplicado
 */
const useDebounce = (value, delay = 500) => {
  // Estado para armazenar o valor com debounce
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Configura um timer para atualizar o valor após o delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpa o timer se o valor ou delay mudar antes do término do delay
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;