import React from 'react';
import PropTypes from 'prop-types';

// Ícones
import { ChevronDown } from 'lucide-react';

/**
 * Componente de seletor para filtros
 * @param {Object} props - Propriedades do componente
 * @param {Array} props.options - Opções do seletor [{ value, label }]
 * @param {string} props.value - Valor selecionado
 * @param {Function} props.onChange - Função chamada quando o valor muda
 * @param {string} props.label - Rótulo do campo
 * @param {string} props.className - Classes adicionais
 * @param {string} props.id - ID do elemento
 * @param {boolean} props.disabled - Se o campo está desabilitado
 */
const FilterSelect = ({ 
  options, 
  value, 
  onChange, 
  label,
  className = '',
  id,
  disabled = false
}) => {
  // Gerar ID único se não fornecido
  const selectId = id || `filter-select-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className={`relative ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-xs font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            block w-full appearance-none bg-white border border-gray-300 rounded-lg
            py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          `}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

FilterSelect.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  className: PropTypes.string,
  id: PropTypes.string,
  disabled: PropTypes.bool
};

export default FilterSelect;