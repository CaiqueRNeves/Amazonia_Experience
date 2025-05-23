import React, { Fragment, useRef } from 'react';
import PropTypes from 'prop-types';
import { Dialog, Transition } from '@headlessui/react';
import Button from './Button';

/**
 * Componente de diálogo de confirmação
 * @param {Object} props - Propriedades do componente
 * @param {boolean} props.isOpen - Se o diálogo está aberto
 * @param {Function} props.onClose - Função para fechar o diálogo
 * @param {Function} props.onConfirm - Função chamada na confirmação
 * @param {string} props.title - Título do diálogo
 * @param {string} props.description - Descrição/mensagem do diálogo
 * @param {string} props.confirmText - Texto do botão de confirmação
 * @param {string} props.cancelText - Texto do botão de cancelamento
 * @param {React.ReactNode} props.icon - Ícone opcional
 * @param {boolean} props.danger - Se é uma ação perigosa
 * @param {boolean} props.isLoading - Se está em estado de carregamento
 */
const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar',
  icon,
  danger = false,
  isLoading = false
}) => {
  const cancelButtonRef = useRef(null);
  
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className="fixed z-50 inset-0 overflow-y-auto" 
        initialFocus={cancelButtonRef}
        onClose={onClose}
      >
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* Centralizar o modal */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>
          
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  {/* Ícone */}
                  {icon && (
                    <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${danger ? 'bg-red-100' : 'bg-blue-100'}`}>
                      {icon}
                    </div>
                  )}
                  
                  {/* Conteúdo */}
                  <div className={`mt-3 text-center sm:mt-0 ${icon ? 'sm:ml-4' : ''} sm:text-left`}>
                    <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                      {title}
                    </Dialog.Title>
                    
                    {description && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          {description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Botões de ação */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  onClick={onConfirm}
                  danger={danger}
                  primary={!danger}
                  isLoading={isLoading}
                  className="w-full sm:w-auto sm:ml-3"
                >
                  {confirmText}
                </Button>
                
                <Button
                  onClick={onClose}
                  secondary
                  outline
                  className="mt-3 sm:mt-0 w-full sm:w-auto"
                  ref={cancelButtonRef}
                  disabled={isLoading}
                >
                  {cancelText}
                </Button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

ConfirmDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  icon: PropTypes.node,
  danger: PropTypes.bool,
  isLoading: PropTypes.bool
};

export default ConfirmDialog;