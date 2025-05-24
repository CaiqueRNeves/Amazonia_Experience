import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button';

/**
 * Componente para estados vazios
 * @param {Object} props - Propriedades do componente
 * @param {React.ReactNode} props.icon - Ícone para exibir
 * @param {string} props.title - Título do estado vazio
 * @param {string} props.description - Descrição do estado vazio
 * @param {string} props.actionText - Texto do botão de ação
 * @param {Function} props.action - Função a ser chamada quando o botão de ação for clicado
 * @param {string} props.className - Classes adicionais
 */
const EmptyState = ({ 
  icon, 
  title, 
  description, 
  actionText, 
  action,
  className = ''
}) => {
  return (
    <div className={`text-center p-6 ${className}`}>
      {icon && (
        <div className="mx-auto mb-4 text-gray-400">
          {icon}
        </div>
      )}
      
      <h3 className="text-lg font-medium text-gray-900">
        {title}
      </h3>
      
      {description && (
        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      )}
      
      {actionText && action && (
        <div className="mt-6">
          <Button
            onClick={action}
            primary
          >
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  actionText: PropTypes.string,
  action: PropTypes.func,
  className: PropTypes.string
};

export default EmptyState;