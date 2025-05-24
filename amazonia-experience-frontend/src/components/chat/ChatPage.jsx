import React from 'react';
import { useTranslation } from 'react-i18next';

// Componentes
import ChatContainer from './ChatContainer';

/**
 * Componente principal da página de chat
 * Configura o layout e importa o ChatContainer
 */
const ChatPage = () => {
  const { t } = useTranslation();
  
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 flex">
        {/* Área principal de chat */}
        <div className="flex-1 h-full flex flex-col">
          <ChatContainer />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;