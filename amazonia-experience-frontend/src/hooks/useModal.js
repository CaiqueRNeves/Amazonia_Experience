import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';

/**
 * Hook personalizado para gerenciar modais
 * Utiliza o slice do Redux para controle de UI
 * 
 * @returns {Object} Funções e estados para controlar modais
 */
const useModal = () => {
  const dispatch = useDispatch();
  
  // Seleciona o estado dos modais do Redux
  const { 
    isOpen, 
    modalType, 
    modalProps, 
    modalStack 
  } = useSelector((state) => state.ui.modal);
  
  // Importa as ações do Redux
  const { 
    openModal, 
    closeModal, 
    closeAllModals 
  } = require('../redux/slices/uiSlice');
  
  /**
   * Abre um modal com o tipo e propriedades especificados
   * @param {string} type - Tipo do modal a ser aberto
   * @param {Object} data - Dados/propriedades para o modal
   */
  const open = useCallback((type, data = {}) => {
    dispatch(openModal({
      type,
      data
    }));
  }, [dispatch, openModal]);
  
  /**
   * Fecha o modal atual
   */
  const close = useCallback(() => {
    dispatch(closeModal());
  }, [dispatch, closeModal]);
  
  /**
   * Fecha todos os modais abertos
   */
  const closeAll = useCallback(() => {
    dispatch(closeAllModals());
  }, [dispatch, closeAllModals]);
  
  /**
   * Abre um modal de confirmação
   * @param {Object} options - Opções do modal de confirmação
   * @param {string} options.title - Título do modal
   * @param {string} options.message - Mensagem principal
   * @param {Function} options.onConfirm - Função chamada ao confirmar
   * @param {Function} options.onCancel - Função chamada ao cancelar
   * @param {string} options.confirmText - Texto do botão de confirmação
   * @param {string} options.cancelText - Texto do botão de cancelamento
   * @param {string} options.variant - Variante visual (danger, warning, info)
   */
  const confirm = useCallback(({ 
    title, 
    message, 
    onConfirm, 
    onCancel, 
    confirmText = 'Confirmar', 
    cancelText = 'Cancelar', 
    variant = 'info'
  } = {}) => {
    dispatch(openModal({
      type: 'confirmation',
      data: {
        title,
        message,
        onConfirm,
        onCancel,
        confirmText,
        cancelText,
        variant
      }
    }));
  }, [dispatch, openModal]);
  
  /**
   * Abre um modal de alerta
   * @param {Object} options - Opções do modal de alerta
   * @param {string} options.title - Título do modal
   * @param {string} options.message - Mensagem principal
   * @param {Function} options.onClose - Função chamada ao fechar
   * @param {string} options.closeText - Texto do botão de fechamento
   * @param {string} options.variant - Variante visual (danger, warning, info, success)
   */
  const alert = useCallback(({ 
    title, 
    message, 
    onClose, 
    closeText = 'OK', 
    variant = 'info'
  } = {}) => {
    dispatch(openModal({
      type: 'alert',
      data: {
        title,
        message,
        onClose,
        closeText,
        variant
      }
    }));
  }, [dispatch, openModal]);
  
  /**
   * Abre um modal para inserção de dados
   * @param {Object} options - Opções do modal de formulário
   * @param {string} options.title - Título do modal
   * @param {string} options.formType - Tipo do formulário a ser exibido
   * @param {Object} options.initialData - Dados iniciais para o formulário
   * @param {Function} options.onSubmit - Função chamada ao enviar o formulário
   * @param {Function} options.onCancel - Função chamada ao cancelar
   */
  const form = useCallback(({ 
    title, 
    formType, 
    initialData = {}, 
    onSubmit, 
    onCancel
  } = {}) => {
    dispatch(openModal({
      type: 'form',
      data: {
        title,
        formType,
        initialData,
        onSubmit,
        onCancel
      }
    }));
  }, [dispatch, openModal]);
  
  return {
    // Estados
    isOpen,
    modalType,
    modalProps,
    modalStack,
    
    // Funções básicas
    open,
    close,
    closeAll,
    
    // Atalhos para tipos comuns de modais
    confirm,
    alert,
    form,
    
    // Verifica se um modal específico está aberto
    isModalOpen: (type) => isOpen && modalType === type,
    
    // Verifica se há algum modal na pilha
    hasModals: modalStack.length > 0
  };
};

export default useModal;