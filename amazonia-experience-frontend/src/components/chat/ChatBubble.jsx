import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { sendFeedback } from '../../redux/slices/chatSlice';

// Componentes e ícones
import { ThumbsUp, ThumbsDown, User, Bot } from 'lucide-react';
import UserAvatar from '../common/UserAvatar';

/**
 * Componente que exibe uma mensagem individual no chat
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.message - Dados da mensagem
 * @param {boolean} props.isUser - Se a mensagem é do usuário
 * @param {Object} props.user - Dados do usuário atual
 * @param {boolean} props.isTyping - Se o bot está digitando
 */
const ChatBubble = ({ message, isUser, user, isTyping = false }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  // Enviar feedback sobre uma resposta do bot
  const handleFeedback = (isHelpful) => {
    dispatch(sendFeedback({
      messageId: message.id,
      isHelpful
    }));
  };
  
  return (
    <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar (mostrado apenas para mensagens do bot) */}
      {!isUser && (
        <div className="flex-shrink-0 mr-3">
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <Bot size={20} />
          </div>
        </div>
      )}
      
      {/* Conteúdo da mensagem */}
      <div className={`max-w-[80%] md:max-w-[70%] ${isUser ? 'order-1' : 'order-2'}`}>
        {/* Nome */}
        <div className={`text-xs mb-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {isUser ? t('chat.you') : t('chat.amazoniaBotName')}
        </div>
        
        {/* Balão de mensagem */}
        <div 
          className={`rounded-lg p-3 ${
            isUser 
              ? 'bg-blue-600 text-white rounded-tr-none' 
              : 'bg-gray-100 text-gray-800 rounded-tl-none'
          } ${isTyping ? 'animate-pulse' : ''}`}
        >
          {/* Conteúdo da mensagem */}
          {isTyping ? (
            <div className="flex space-x-2 items-center">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap">{message.message}</div>
          )}
        </div>
        
        {/* Timestamp e ações */}
        <div className={`flex items-center mt-1 text-xs text-gray-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
          {/* Timestamp */}
          {message.created_at && (
            <span>
              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          
          {/* Botões de feedback (apenas para mensagens do bot) */}
          {!isUser && !isTyping && (
            <div className="flex ml-4">
              <button 
                className={`p-1 rounded-full hover:bg-gray-200 ${message.is_helpful === true ? 'text-green-600' : ''}`}
                onClick={() => handleFeedback(true)}
                aria-label={t('chat.feedback.helpful')}
                title={t('chat.feedback.helpful')}
              >
                <ThumbsUp size={14} />
              </button>
              <button 
                className={`p-1 rounded-full hover:bg-gray-200 ml-1 ${message.is_helpful === false ? 'text-red-600' : ''}`}
                onClick={() => handleFeedback(false)}
                aria-label={t('chat.feedback.notHelpful')}
                title={t('chat.feedback.notHelpful')}
              >
                <ThumbsDown size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Avatar (mostrado apenas para mensagens do usuário) */}
      {isUser && (
        <div className="flex-shrink-0 ml-3">
          {user ? (
            <UserAvatar user={user} size="sm" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <User size={20} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatBubble;