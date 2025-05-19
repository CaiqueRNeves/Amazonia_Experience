import React, { createContext, useState, useCallback } from 'react';
import { MODAL_TYPES } from '../utils/constants';

// Criação do contexto
export const ModalContext = createContext(null);

/**
 * Provedor de modais da aplicação
 * Gerencia exibição de modais e seus dados
 */
export const ModalProvider = ({ children }) => {
  // Estado para controlar modais abertos
  const [modals, setModals] = useState([]);

  /**
   * Abre um modal
   * @param {string} type - Tipo do modal
   * @param {Object} props - Propriedades do modal
   */
  const openModal = useCallback((type, props = {}) => {
    // Verifica se o tipo de modal é válido
    if (!Object.values(MODAL_TYPES).includes(type)) {
      console.error(`Tipo de modal inválido: ${type}`);
      return;
    }
    
    // Adiciona o modal à pilha
    setModals(prevModals => [
      ...prevModals,
      {
        id: `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        props
      }
    ]);
  }, []);

  /**
   * Fecha o modal mais recente
   */
  const closeModal = useCallback(() => {
    setModals(prevModals => prevModals.slice(0, -1));
  }, []);

  /**
   * Fecha um modal específico pelo ID
   * @param {string} id - ID do modal a ser fechado
   */
  const closeModalById = useCallback((id) => {
    setModals(prevModals => prevModals.filter(modal => modal.id !== id));
  }, []);

  /**
   * Fecha todos os modais
   */
  const closeAllModals = useCallback(() => {
    setModals([]);
  }, []);

  /**
   * Abre um modal de confirmação
   * @param {Object} options - Opções do modal
   */
  const confirm = useCallback(({
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel,
    variant = 'primary'
  } = {}) => {
    openModal(MODAL_TYPES.CONFIRMATION, {
      title,
      message,
      confirmText,
      cancelText,
      onConfirm: () => {
        if (onConfirm) onConfirm();
        closeModal();
      },
      onCancel: () => {
        if (onCancel) onCancel();
        closeModal();
      },
      variant
    });
  }, [openModal, closeModal]);

  /**
   * Abre um modal de alerta
   * @param {Object} options - Opções do modal
   */
  const alert = useCallback(({
    title,
    message,
    buttonText = 'OK',
    onClose,
    variant = 'primary'
  } = {}) => {
    openModal(MODAL_TYPES.ALERT, {
      title,
      message,
      buttonText,
      onClose: () => {
        if (onClose) onClose();
        closeModal();
      },
      variant
    });
  }, [openModal, closeModal]);

  // Modal atual (o último da pilha)
  const currentModal = modals.length > 0 ? modals[modals.length - 1] : null;

  // Valores expostos pelo contexto
  const value = {
    // Estados
    modals,
    currentModal,
    isOpen: modals.length > 0,
    
    // Funções básicas
    openModal,
    closeModal,
    closeModalById,
    closeAllModals,
    
    // Atalhos para tipos comuns
    confirm,
    alert
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};

// Hook personalizado para usar o contexto de modais
export const useModal = () => {
  const context = React.useContext(ModalContext);
  
  if (!context) {
    throw new Error('useModal deve ser usado dentro de um ModalProvider');
  }
  
  return context;
};

export default { ModalContext, ModalProvider, useModal };