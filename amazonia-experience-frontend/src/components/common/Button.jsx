import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente de botão reutilizável com diferentes variantes
 * @param {Object} props - Propriedades do componente
 * @param {string} props.children - Conteúdo do botão
 * @param {Function} props.onClick - Função de clique
 * @param {boolean} props.disabled - Se o botão está desabilitado
 * @param {boolean} props.isLoading - Se o botão está em estado de carregamento
 * @param {boolean} props.primary - Estilo primário
 * @param {boolean} props.secondary - Estilo secundário
 * @param {boolean} props.danger - Estilo de perigo
 * @param {boolean} props.outline - Versão outline do botão
 * @param {string} props.className - Classes adicionais
 * @param {React.ReactNode} props.icon - Ícone opcional
 * @param {string} props.type - Tipo do botão
 * @param {boolean} props.fullWidth - Se deve ocupar toda a largura
 */
const Button = ({ 
  children, 
  onClick, 
  disabled, 
  isLoading, 
  primary, 
  secondary, 
  danger,
  outline,
  className,
  icon,
  type = 'button',
  fullWidth,
  ...props
}) => {
  // Determinar as classes de estilo do botão
  const getButtonClasses = () => {
    let classes = 'inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 transition-colors text-sm';
    
    // Adicionar classe de largura total
    if (fullWidth) {
      classes += ' w-full';
    }
    
    // Estilo primário (padrão)
    if (primary || (!secondary && !danger && !outline)) {
      if (outline) {
        classes += ' border border-blue-600 text-blue-600 hover:bg-blue-50';
      } else {
        classes += ' bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm';
      }
    }
    
    // Estilo secundário
    if (secondary) {
      if (outline) {
        classes += ' border border-gray-300 text-gray-700 hover:bg-gray-50';
      } else {
        classes += ' bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-300';
      }
    }
    
    // Estilo de perigo
    if (danger) {
      if (outline) {
        classes += ' border border-red-600 text-red-600 hover:bg-red-50';
      } else {
        classes += ' bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
      }
    }
    
    // Estilo desabilitado
    if (disabled || isLoading) {
      classes += ' opacity-50 cursor-not-allowed';
    }
    
    // Adicionar classes customizadas
    if (className) {
      classes += ` ${className}`;
    }
    
    return classes;
  };
  
  return (
    <button
      type={type}
      className={getButtonClasses()}
      onClick={onClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2">
          <svg className="animate-spin -ml-1 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      ) : icon && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  primary: PropTypes.bool,
  secondary: PropTypes.bool,
  danger: PropTypes.bool,
  outline: PropTypes.bool,
  className: PropTypes.string,
  icon: PropTypes.node,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  fullWidth: PropTypes.bool
};

export default Button;