import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  PaperAirplaneIcon, 
  ArrowPathIcon, 
  ChatBubbleLeftRightIcon,
  ThumbUpIcon,
  ThumbDownIcon
} from '@heroicons/react/24/outline';

import { Container, PageHeader } from '../components/layout';
import { Button } from '../components/common';
import { api } from '../services/api';
import ChatMessage from '../components/chat/ChatMessage';
import ChatSuggestions from '../components/chat/ChatSuggestions';
import ChatFeedbackModal from '../components/chat/ChatFeedbackModal';

const Chat = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const messagesEndRef = useRef(null);
  
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [contextInfo, setContextInfo] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  
  // Pegar contexto da URL se existir (ex: /chat?type=event&id=123)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const contextType = searchParams.get('type');
    const contextId = searchParams.get('id');
    
    if (contextType && contextId) {
      fetchContextInfo(contextType, contextId);
    }
  }, [location.search]);
  
  // Carregar histórico de mensagens se usuário estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      fetchChatHistory();
    } else {
      // Mensagem inicial para usuários não autenticados
      setMessages([
        {
          id: 'welcome',
          message: t('chat.welcomeMessage'),
          is_from_user: false,
          created_at: new Date().toISOString()
        }
      ]);
    }
  }, [isAuthenticated, t]);
  
  // Rolar para o final quando mensagens forem atualizadas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Buscar histórico de chat
  const fetchChatHistory = async () => {
    try {
      const params = {};
      
      // Adicionar contexto se existir
      if (contextInfo) {
        params.context_type = contextInfo.type;
        params.context_id = contextInfo.id;
      }
      
      const response = await api.chat.getHistory(params);
      
      if (response.messages && response.messages.length > 0) {
        setMessages(response.messages);
      } else {
        // Mensagem inicial se não houver histórico
        setMessages([
          {
            id: 'welcome',
            message: t('chat.welcomeMessage'),
            is_from_user: false,
            created_at: new Date().toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      toast.error(t('chat.errorHistory'));
    }
  };
  
  // Buscar informações de contexto
  const fetchContextInfo = async (type, id) => {
    try {
      const response = await api.chat.getContext(type, id);
      setContextInfo(response.context);
    } catch (error) {
      console.error('Error fetching context info:', error);
    }
  };
  
  // Enviar mensagem
  const sendMessage = async () => {
    if (!messageInput.trim()) return;
    
    if (!isAuthenticated) {
      // Redirecionar para login se não estiver autenticado
      toast.info(t('chat.loginToChat'));
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }
    
    // Adicionar mensagem do usuário localmente para feedback imediato
    const userMessage = {
      id: `temp-${Date.now()}`,
      message: messageInput,
      is_from_user: true,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessageInput('');
    setLoading(true);
    
    try {
      // Enviar mensagem para a API
      const contextType = contextInfo?.type || 'general';
      const contextId = contextInfo?.id || null;
      
      const response = await api.chat.sendMessage(messageInput, contextType, contextId);
      
      // Atualizar mensagens com as respostas da API
      setMessages(prev => [
        ...prev.filter(msg => msg.id !== userMessage.id), // Remover mensagem temporária
        response.userMessage,
        response.botMessage
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(t('chat.errorSending'));
      
      // Remover mensagem temporária em caso de erro
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setLoading(false);
    }
  };
  
  // Lidar com tecla Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Enviar feedback para uma mensagem
  const handleFeedback = async (messageId, isHelpful, feedbackText = '') => {
    try {
      await api.chat.sendFeedback(messageId, isHelpful, feedbackText);
      
      // Atualizar mensagem localmente
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, is_helpful: isHelpful, feedback_text: feedbackText }
            : msg
        )
      );
      
      toast.success(t('chat.feedbackSuccess'));
    } catch (error) {
      console.error('Error sending feedback:', error);
      toast.error(t('chat.errorFeedback'));
    }
  };
  
  // Usar sugestão
  const handleUseSuggestion = (suggestion) => {
    setMessageInput(suggestion);
  };
  
  // Limpar chat
  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        message: t('chat.welcomeMessage'),
        is_from_user: false,
        created_at: new Date().toISOString()
      }
    ]);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title={contextInfo ? contextInfo.name : t('chat.title')} 
        description={contextInfo ? contextInfo.description : t('chat.description')}
      />
      
      <Container>
        {/* Contexto da conversa */}
        {contextInfo && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  {t('chat.talkingAbout', { name: contextInfo.name })}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[calc(100vh-16rem)]">
          {/* Cabeçalho do chat */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-amazon-green-600 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">
                {contextInfo ? t('chat.helpWith', { name: contextInfo.name }) : t('chat.assistant')}
              </h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearChat}
              className="text-gray-600"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              {t('chat.newChat')}
            </Button>
          </div>
          
          {/* Área de mensagens */}
          <div className="p-4 overflow-y-auto h-[calc(100%-10rem)]">
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onLike={() => {
                    if (!isAuthenticated) {
                      toast.info(t('chat.loginToFeedback'));
                      return;
                    }
                    if (!message.is_from_user) {
                      handleFeedback(message.id, true);
                    }
                  }}
                  onDislike={() => {
                    if (!isAuthenticated) {
                      toast.info(t('chat.loginToFeedback'));
                      return;
                    }
                    if (!message.is_from_user) {
                      setSelectedMessage(message);
                      setShowFeedbackModal(true);
                    }
                  }}
                />
              ))}
              
              {loading && (
                <div className="flex items-start">
                  <div className="bg-gray-100 rounded-lg p-3 max-w-3xl">
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Área de sugestões */}
          <div className="p-4 border-t border-gray-200">
            <ChatSuggestions onSelectSuggestion={handleUseSuggestion} />
          </div>
          
          {/* Área de input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 resize-none rounded-lg border border-gray-300 focus:ring-2 focus:ring-amazon-green-500 focus:border-transparent p-3 h-12 max-h-32"
                placeholder={t('chat.typePlaceholder')}
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={!messageInput.trim() || loading}
                className={`ml-2 rounded-full p-2 ${
                  messageInput.trim() && !loading
                    ? 'bg-amazon-green-600 text-white hover:bg-amazon-green-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <PaperAirplaneIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </Container>
      
      {/* Modal de feedback negativo */}
      <ChatFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={(feedbackText) => {
          handleFeedback(selectedMessage?.id, false, feedbackText);
          setShowFeedbackModal(false);
        }}
      />
    </div>
  );
};

export default Chat;