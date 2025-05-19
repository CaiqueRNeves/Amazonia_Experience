import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente de indicador de carregamento
 * @param {Object} props - Propriedades do componente
 * @param {string} props.message - Mensagem opcional de carregamento
 * @param {string} props.size - Tamanho do loader: 'sm', 'md', 'lg'
 * @param {boolean} props.fullScreen - Se deve ocupar a tela inteira
 * @param {string} props.className - Classes adicionais
 */
const Loader = ({ 
  message, 
  size = 'md', 
  fullScreen = false,
  className = ''
}) => {
  // Determinar classes do spinner baseado no tamanho
  const getSpinnerSize = () => {
    switch (size) {
      case 'sm':
        return 'h-5 w-5';
      case 'lg':
        return 'h-10 w-10';
      case 'md':
      default:
        return 'h-8 w-8';
    }
  };
  
  // Componente do spinner
  const Spinner = () => (
    <svg className={`animate-spin text-blue-600 ${getSpinnerSize()}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
  
  // Determinar estilo do container
  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50' 
    : `flex flex-col items-center justify-center p-4 ${className}`;
  
  return (
    <div className={containerClasses}>
      <Spinner />
      {message && (
        <p className={`mt-2 text-gray-600 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

Loader.propTypes = {
  message: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  fullScreen: PropTypes.bool,
  className: PropTypes.string
};

export default Loader;