import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

/**
 * Cabeçalho padrão para todas as páginas
 * Inclui título, descrição opcional, botão de voltar e ações
 */
const PageHeader = ({
  title,
  description,
  showBackButton = false,
  backTo = -1,
  backLabel,
  actions,
  backgroundImage,
  className = '',
}) => {
  const hasBackground = !!backgroundImage;
  
  return (
    <div
      className={`relative mb-6 ${hasBackground ? 'py-10' : 'py-6'} ${className}`}
      style={
        hasBackground
          ? {
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : {}
      }
    >
      <div className={`${hasBackground ? 'text-white' : 'text-gray-900'}`}>
        {/* Botão voltar */}
        {showBackButton && (
          <div className="mb-4">
            <Link
              to={backTo}
              className={`inline-flex items-center text-sm font-medium ${
                hasBackground ? 'text-white hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ChevronLeftIcon className="h-5 w-5 mr-1" />
              {backLabel || 'Voltar'}
            </Link>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            {/* Título */}
            <h1 className={`text-2xl sm:text-3xl font-bold ${hasBackground ? 'text-white' : ''}`}>
              {title}
            </h1>
            
            {/* Descrição */}
            {description && (
              <p className={`mt-2 text-sm sm:text-base ${hasBackground ? 'text-gray-200' : 'text-gray-600'}`}>
                {description}
              </p>
            )}
          </div>
          
          {/* Ações */}
          {actions && <div className="mt-4 md:mt-0 flex space-x-3">{actions}</div>}
        </div>
      </div>
    </div>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  showBackButton: PropTypes.bool,
  backTo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  backLabel: PropTypes.string,
  actions: PropTypes.node,
  backgroundImage: PropTypes.string,
  className: PropTypes.string,
};

export default PageHeader;