import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Componente de textarea reutilizável
 * @param {Object} props - Propriedades do componente
 * @param {string} props.id - ID do campo
 * @param {string} props.name - Nome do campo
 * @param {string} props.label - Rótulo do campo
 * @param {string} props.value - Valor atual
 * @param {Function} props.onChange - Função chamada quando o valor muda
 * @param {string} props.placeholder - Texto de placeholder
 * @param {string} props.className - Classes adicionais para o container
 * @param {string} props.inputClassName - Classes adicionais para o input
 * @param {boolean} props.error - Se há erro no campo
 * @param {string} props.errorMessage - Mensagem de erro
 * @param {string} props.helpText - Texto de ajuda
 * @param {number} props.rows - Número de linhas
 * @param {boolean} props.disabled - Se o campo está desabilitado
 * @param {boolean} props.required - Se o campo é obrigatório
 * @param {boolean} props.autoResize - Se o campo deve redimensionar automaticamente
 */
const TextArea = forwardRef(({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  className = '',
  inputClassName = '',
  error = false,
  errorMessage = '',
  helpText = '',
  rows = 3,
  disabled = false,
  required = false,
  autoResize = false,
  ...rest
}, ref) => {
  // Gerar ID único se não fornecido
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  
  // Função para redimensionar automaticamente o textarea
  const handleInput = (e) => {
    if (autoResize) {
      e.target.style.height = 'auto';
      e.target.style.height = (e.target.scrollHeight) + 'px';
    }
  };
  
  return (
    <div className={className}>
      {label && (
        <label 
          htmlFor={textareaId} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        id={textareaId}
        name={name}
        value={value}
        onChange={onChange}
        onInput={autoResize ? handleInput : undefined}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        ref={ref}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm text-sm
          ${error 
            ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          ${inputClassName}
        `}
        {...rest}
      />
      
      {/* Mensagem de erro ou texto de ajuda */}
      {error && errorMessage ? (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      ) : helpText ? (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      ) : null}
    </div>
  );
});

TextArea.displayName = 'TextArea';

TextArea.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  error: PropTypes.bool,
  errorMessage: PropTypes.string,
  helpText: PropTypes.string,
  rows: PropTypes.number,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  autoResize: PropTypes.bool
};

export default TextArea;