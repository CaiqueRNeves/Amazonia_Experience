import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente de badge/etiqueta
 * @param {Object} props - Propriedades do componente
 * @param {string} props.text - Texto do badge
 * @param {string} props.className - Classes adicionais
 * @param {React.ReactNode} props.icon - Ícone opcional
 * @param {string} props.size - Tamanho do badge: 'sm', 'md', 'lg'
 * @param {boolean} props.dot - Se deve mostrar um ponto em vez de ícone
 * @param {string} props.dotColor - Cor do ponto (se dot=true)
 */
const Badge = ({ 
  text, 
  className = '', 
  icon, 
  size = 'md',
  dot = false,
  dotColor = 'bg-blue-500'
}) => {
  // Determinar classes de tamanho
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-1.5 py-0.5 text-xs';
      case 'lg':
        return 'px-3 py-1 text-sm';
      case 'md':
      default:
        return 'px-2.5 py-0.5 text-xs';
    }
  };
  
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${getSizeClasses()} ${className}`}>
      {dot && (
        <span className={`mr-1.5 h-2 w-2 rounded-full ${dotColor}`} />
      )}
      
      {icon && !dot && (
        <span className="mr-1">{icon}</span>
      )}
      
      {text}
    </span>
  );
};

Badge.propTypes = {
  text: PropTypes.string.isRequired,
  className: PropTypes.string,
  icon: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  dot: PropTypes.bool,
  dotColor: PropTypes.string
};

export default Badge;