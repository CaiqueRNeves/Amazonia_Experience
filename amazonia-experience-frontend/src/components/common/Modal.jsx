import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';

/**
 * Componente de modal reutilizável
 * @param {Object} props - Propriedades do componente
 * @param {boolean} props.isOpen - Se o modal está aberto
 * @param {Function} props.onClose - Função para fechar o modal
 * @param {React.ReactNode} props.children - Conteúdo do modal
 * @param {string} props.title - Título do modal
 * @param {React.ReactNode} props.footer - Conteúdo do rodapé
 * @param {string} props.size - Tamanho do modal: 'sm', 'md', 'lg', 'xl', 'full'
 * @param {boolean} props.closeOnClickOutside - Se fecha ao clicar fora
 * @param {string} props.className - Classes adicionais
 * @param {boolean} props.showCloseButton - Se mostra o botão de fechar
 */
const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  footer,
  size = 'md',
  closeOnClickOutside = true,
  className = '',
  showCloseButton = true
}) => {
  // Determinar classe de tamanho do modal
  const getModalSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'sm:max-w-sm';
      case 'lg':
        return 'sm:max-w-2xl';
      case 'xl':
        return 'sm:max-w-4xl';
      case 'full':
        return 'sm:max-w-full sm:m-4';
      case 'md':
      default:
        return 'sm:max-w-lg';
    }
  };
  
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className="fixed z-50 inset-0 overflow-y-auto" 
        onClose={closeOnClickOutside ? onClose : () => {}}
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
            <div className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full ${getModalSizeClass()} ${className}`}>
              {/* Cabeçalho */}
              {title && (
                <div className="px-4 py-3 border-b flex justify-between items-center">
                  <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                    {title}
                  </Dialog.Title>
                  
                  {showCloseButton && (
                    <button
                      type="button"
                      className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                      onClick={onClose}
                    >
                      <span className="sr-only">Fechar</span>
                      <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              )}
              
              {/* Conteúdo */}
              <div className="px-4 py-3">
                {children}
              </div>
              
              {/* Rodapé */}
              {footer && (
                <div className="px-4 py-3 bg-gray-50 border-t">
                  {footer}
                </div>
              )}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  footer: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  closeOnClickOutside: PropTypes.bool,
  className: PropTypes.string,
  showCloseButton: PropTypes.bool
};

export default Modal;