import React, { useState } from 'react';
import PropTypes from 'prop-types';

// Ícones
import { Search, X } from 'lucide-react';

/**
 * Componente de campo de busca
 * @param {Object} props - Propriedades do componente
 * @param {string} props.value - Valor atual
 * @param {Function} props.onChange - Função chamada quando o valor muda
 * @param {string} props.placeholder - Texto de placeholder
 * @param {string} props.className - Classes adicionais
 * @param {boolean} props.autoFocus - Se o campo deve receber foco automaticamente
 * @param {number} props.debounceTime - Tempo em ms para debounce
 */
const SearchInput = ({ 
  value, 
  onChange, 
  placeholder = 'Buscar...',
  className = '',
  autoFocus = false,
  debounceTime = 300
}) => {
  // Estado interno para controle de digitação
  const [inputValue, setInputValue] = useState(value || '');
  const [timerId, setTimerId] = useState(null);
  
  // Função para lidar com a mudança de valor
  const handleChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Limpar timer anterior se existir
    if (timerId) {
      clearTimeout(timerId);
    }
    
    // Debounce para evitar chamadas excessivas enquanto digita
    const newTimerId = setTimeout(() => {
      onChange(newValue);
    }, debounceTime);
    
    setTimerId(newTimerId);
  };
  
  // Função para limpar o campo
  const clearInput = () => {
    setInputValue('');
    onChange('');
  };
  
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      
      <input
        type="text"
        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
        autoFocus={autoFocus}
      />
      
      {inputValue && (
        <button
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          onClick={clearInput}
          aria-label="Limpar busca"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

SearchInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  autoFocus: PropTypes.bool,
  debounceTime: PropTypes.number
};

export default SearchInput;