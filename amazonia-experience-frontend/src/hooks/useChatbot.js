import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { openModal } from '../redux/slices/uiSlice';

/**
 * Hook personalizado para interação com o chatbot
 * Gerencia o envio de mensagens, histórico e contexto de conversa
 * 
 * @param {string} contextType - Tipo de contexto (ex: 'general', 'event', 'place')
 * @param {number} contextId - ID do contexto, se aplicável
 * @returns {Object} Funções e estados para interagir com o chatbot
 */
const useChatbot = (contextType = 'general', contextId = null) => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const currentLanguage = i18n.language;
  
  // Estado para armazenar mensagens da conversa
  const [messages, setMessages] = useState([]);
  // Estado para a mensagem sendo digitada
  const [inputMessage, setInputMessage] = useState('');
  // Referência para o elemento de rolagem das mensagens
  const messagesEndRef = useRef(null);
  
  // Obter estado do Redux para histórico e envio de mensagens
  const {
    isLoading,
    error,
    data: chatData
  } = useSelector((state) => state.chat);
  
  // Importar ações do slice do chat
  const { sendMessage, getHistory } = require('../redux/slices/chatSlice');
  
  // Carregar histórico de mensagens quando o componente montar
  useEffect(() => {
    const loadHistory = async () => {
      if (contextType) {
        const params = { context_type: contextType };
        if (contextId) params.context_id = contextId;
        
        await dispatch(getHistory(params));
      }
    };
    
    loadHistory();
  }, [dispatch, getHistory, contextType, contextId]);
  
  // Atualizar mensagens quando houver mudanças nos dados do chat
  useEffect(() => {
    if (chatData && chatData.messages) {
      setMessages(chatData.messages);
    }
  }, [chatData]);
  
  // Rolar para a mensagem mais recente quando novas mensagens forem adicionadas
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Enviar mensagem para o chatbot
  const sendChatMessage = useCallback(async (message = null) => {
    const messageToSend = message || inputMessage;
    if (!messageToSend.trim()) return;
    
    // Adicionar mensagem do usuário na interface imediatamente
    const userMessageObj = {
      id: `temp-${Date.now()}`,
      user_id: 'current',
      message: messageToSend,
      is_from_user: true,
      context_type: contextType,
      context_id: contextId,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessageObj]);
    setInputMessage('');
    
    try {
      // Enviar mensagem para a API
      const resultAction = await dispatch(sendMessage({
        message: messageToSend,
        context_type: contextType,
        context_id: contextId
      }));
      
      if (sendMessage.fulfilled.match(resultAction)) {
        // Mensagens já são atualizadas pelo efeito que observa chatData
      }
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      
      // Adicionar mensagem de erro do bot
      const errorMessageObj = {
        id: `error-${Date.now()}`,
        user_id: 'bot',
        message: t('chat.errorSendingMessage'),
        is_from_user: false,
        context_type: contextType,
        context_id: contextId,
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessageObj]);
    }
  }, [dispatch, sendMessage, inputMessage, contextType, contextId, t]);
  
  // Enviar feedback sobre uma resposta do bot
  const sendFeedback = useCallback(async (messageId, isHelpful, feedbackText = '') => {
    try {
      await dispatch(sendFeedback({
        message_id: messageId,
        is_helpful: isHelpful,
        feedback_text: feedbackText
      }));
      
      // Atualizar o estado da mensagem localmente
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, feedback: { is_helpful: isHelpful, feedback_text: feedbackText } } 
            : msg
        )
      );
      
      return true;
    } catch (err) {
      console.error('Erro ao enviar feedback:', err);
      return false;
    }
  }, [dispatch]);
  
  // Limpar a conversa
  const clearConversation = useCallback(() => {
    // Mostra modal de confirmação
    dispatch(openModal({
      type: 'confirmation',
      data: {
        title: t('chat.clearConfirmTitle'),
        message: t('chat.clearConfirmMessage'),
        onConfirm: () => {
          setMessages([]);
          // Adicionar mensagem de boas-vindas
          const welcomeMessage = {
            id: `welcome-${Date.now()}`,
            user_id: 'bot',
            message: t('chat.welcomeMessage'),
            is_from_user: false,
            context_type: 'general',
            context_id: null,
            created_at: new Date().toISOString()
          };
          setMessages([welcomeMessage]);
        }
      }
    }));
  }, [dispatch, t]);
  
  // Atalhos de mensagens rápidas com base no contexto
  const getQuickReplies = useCallback(() => {
    const generalReplies = [
      { text: t('chat.quickReplies.events'), handler: () => sendChatMessage(t('chat.quickReplies.events')) },
      { text: t('chat.quickReplies.amacoins'), handler: () => sendChatMessage(t('chat.quickReplies.amacoins')) },
      { text: t('chat.quickReplies.connectivity'), handler: () => sendChatMessage(t('chat.quickReplies.connectivity')) },
      { text: t('chat.quickReplies.emergency'), handler: () => sendChatMessage(t('chat.quickReplies.emergency')) }
    ];
    
    // Adicionar respostas rápidas com base no contexto
    if (contextType === 'event') {
      return [
        { text: t('chat.quickReplies.eventInfo'), handler: () => sendChatMessage(t('chat.quickReplies.eventInfo')) },
        { text: t('chat.quickReplies.eventLocation'), handler: () => sendChatMessage(t('chat.quickReplies.eventLocation')) },
        { text: t('chat.quickReplies.checkIn'), handler: () => sendChatMessage(t('chat.quickReplies.checkIn')) },
        ...generalReplies
      ];
    } else if (contextType === 'place') {
      return [
        { text: t('chat.quickReplies.placeInfo'), handler: () => sendChatMessage(t('chat.quickReplies.placeInfo')) },
        { text: t('chat.quickReplies.placeOpening'), handler: () => sendChatMessage(t('chat.quickReplies.placeOpening')) },
        { text: t('chat.quickReplies.checkIn'), handler: () => sendChatMessage(t('chat.quickReplies.checkIn')) },
        ...generalReplies
      ];
    } else {
      return generalReplies;
    }
  }, [contextType, t, sendChatMessage]);
  
  return {
    // Estados
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    error,
    messagesEndRef,
    
    // Funções
    sendMessage: sendChatMessage,
    sendFeedback,
    clearConversation,
    getQuickReplies
  };
};

export default useChatbot;