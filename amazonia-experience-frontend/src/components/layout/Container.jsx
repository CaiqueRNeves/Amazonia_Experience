import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente de contêiner para padronizar margens e espaçamentos
 * Aceita opção para largura total (sem margens laterais)
 */
const Container = ({ children, fullWidth = false, className = '', ...props }) => {
  return (
    <div
      className={`w-full ${
        fullWidth ? 'px-0' : 'px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

Container.propTypes = {
  children: PropTypes.node.isRequired,
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
};

export default Container;