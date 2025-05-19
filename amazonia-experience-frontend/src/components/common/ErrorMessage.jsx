import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button';

// Ícones
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Componente para exibir mensagens de erro
 * @param {Object} props - Propriedades do componente
 * @param {string} props.message - Mensagem de erro
 * @param {Function} props.retryAction - Função para tentar novamente
 * @param {string} props.className - Classes adicionais
 */
const ErrorMessage = ({ 
  message, 
  retryAction,
  className = ''
}) => {
  return (
    <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-600" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Ocorreu um erro
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message || 'Algo deu errado. Tente novamente mais tarde.'}</p>
          </div>
          {retryAction && (
            <div className="mt-3">
              <Button
                onClick={retryAction}
                secondary
                outline
                icon={<RefreshCw size={16} />}
              >
                Tentar novamente
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ErrorMessage.propTypes = {
  message: PropTypes.string,
  retryAction: PropTypes.func,
  className: PropTypes.string
};

export default ErrorMessage;