import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

/**
 * Componente para seções em páginas
 * Pode conter um título, descrição, ações e um link "Ver tudo"
 */
const Section = ({
  children,
  title,
  description,
  viewAllLink,
  viewAllLabel,
  actions,
  className = '',
  titleClassName = '',
  contentClassName = '',
}) => {
  return (
    <section className={`mb-8 ${className}`}>
      {/* Cabeçalho da seção */}
      {(title || description || viewAllLink || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div>
            {title && (
              <h2 className={`text-xl font-semibold text-gray-900 ${titleClassName}`}>
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-gray-600">{description}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            {actions && <div>{actions}</div>}
            
            {viewAllLink && (
              <Link
                to={viewAllLink}
                className="text-amazon-green-600 hover:text-amazon-green-800 flex items-center text-sm font-medium"
              >
                {viewAllLabel || 'Ver tudo'}
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </Link>
            )}
          </div>
        </div>
      )}
      
      {/* Conteúdo da seção */}
      <div className={contentClassName}>{children}</div>
    </section>
  );
};

Section.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  viewAllLink: PropTypes.string,
  viewAllLabel: PropTypes.string,
  actions: PropTypes.node,
  className: PropTypes.string,
  titleClassName: PropTypes.string,
  contentClassName: PropTypes.string,
};

export default Section;