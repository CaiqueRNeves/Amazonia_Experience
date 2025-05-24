import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessage, getHistory } from '../../redux/slices/chatSlice';

// Componentes
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import ChatHeader from './ChatHeader';
import ChatOptions from './ChatOptions';
import ChatContext from './ChatContext';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import ErrorMessage from '../common/ErrorMessage';

// Ícones
import { MessageSquare } from 'lucide-react';

/**
 * Componente principal da interface de chat
 * Gerencia a conversa com o chatbot
 */
const ChatContainer = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  // Refs
  const messagesEndRef = useRef(null);
  const messageListRef = useRef(null);
  
  // Estados do Redux
  const { messages, isLoading, error, context } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  
  // Estados locais
  const [inputMessage, setInputMessage] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  
  // Carregar histórico de mensagens quando o componente for montado
  useEffect(() => {
    dispatch(getHistory());
  }, [dispatch]);
  
  // Rolar para a última mensagem sempre que receber novas mensagens
  useEffect(() => {
    scrollToBottom();
  }, [messages.data]);
  
  // Função para rolar para a última mensagem
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Função para enviar mensagem
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const contextData = {
      context_type: context.type || 'general',
      context_id: context.id || null
    };
    
    await dispatch(sendMessage({
      message: inputMessage,
      ...contextData
    }));
    
    setInputMessage('');
  };
  
  // Função para alternar exibição de opções
  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };
  
  // Função para atualizar o contexto do chat
  const updateContext = (newContext) => {
    dispatch({
      type: 'chat/setContext',
      payload: newContext
    });
    
    // Fechar painel de opções após seleção
    setShowOptions(false);
  };
  
  // Função para limpar o contexto
  const clearContext = () => {
    dispatch({
      type: 'chat/clearContext'
    });
    
    setShowOptions(false);
  };
  
  // Renderizar estado vazio se não houver mensagens
  if (!isLoading && (!messages.data || messages.data.length === 0)) {
    return (
      <div className="h-full flex flex-col">
        <ChatHeader 
          context={context} 
          onClearContext={clearContext} 
          onToggleOptions={toggleOptions}
        />
        
        <div className="flex-1 flex items-center justify-center p-4">
          <EmptyState
            icon={<MessageSquare size={48} />}
            title={t('chat.emptyState.title')}
            description={t('chat.emptyState.description')}
          />
        </div>
        
        <ChatInput
          value={inputMessage}
          onChange={setInputMessage}
          onSend={handleSendMessage}
          isLoading={isLoading}
          placeholder={t('chat.messagePlaceholder')}
        />
        
        {showOptions && (
          <ChatOptions
            onSelect={updateContext}
            onClose={() => setShowOptions(false)}
          />
        )}
      </div>
    );
  }
  
  // Renderizar mensagem de erro
  if (error) {
    return (
      <div className="h-full flex flex-col">
        <ChatHeader 
          context={context} 
          onClearContext={clearContext} 
          onToggleOptions={toggleOptions}
        />
        
        <div className="flex-1 flex items-center justify-center p-4">
          <ErrorMessage 
            message={error} 
            retryAction={() => dispatch(getHistory())}
          />
        </div>
        
        <ChatInput
          value={inputMessage}
          onChange={setInputMessage}
          onSend={handleSendMessage}
          isLoading={isLoading}
          placeholder={t('chat.messagePlaceholder')}
        />
        
        {showOptions && (
          <ChatOptions
            onSelect={updateContext}
            onClose={() => setShowOptions(false)}
          />
        )}
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Cabeçalho do chat */}
      <ChatHeader 
        context={context} 
        onClearContext={clearContext} 
        onToggleOptions={toggleOptions}
      />
      
      {/* Contexto atual (se houver) */}
      {context.type && context.type !== 'general' && (
        <ChatContext context={context} />
      )}
      
      {/* Lista de mensagens */}
      <div 
        className="flex-1 overflow-y-auto p-4"
        ref={messageListRef}
      >
        {isLoading && !messages.data ? (
          <div className="h-full flex items-center justify-center">
            <Loader message={t('chat.loading')} />
          </div>
        ) : (
          <>
            {messages.data.map((message) => (
              <ChatBubble
                key={message.id}
                message={message}
                isUser={message.is_from_user}
                user={user}
              />
            ))}
            {isLoading && (
              <ChatBubble
                message={{ message: '...' }}
                isUser={false}
                isTyping={true}
              />
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Input de mensagem */}
      <ChatInput
        value={inputMessage}
        onChange={setInputMessage}
        onSend={handleSendMessage}
        isLoading={isLoading}
        placeholder={t('chat.messagePlaceholder')}
      />
      
      {/* Painel de opções de contexto */}
      {showOptions && (
        <ChatOptions
          onSelect={updateContext}
          onClose={() => setShowOptions(false)}
        />
      )}
    </div>
  );
};

export default ChatContainer;