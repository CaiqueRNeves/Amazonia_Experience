import React from 'react';
import { useTranslation } from 'react-i18next';

// Ícones
import { 
  Settings, 
  MessageSquare,
  X,
  ChevronLeft,
  Menu
} from 'lucide-react';

/**
 * Componente de cabeçalho do chat
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.context - Contexto atual do chat
 * @param {Function} props.onClearContext - Função para limpar o contexto
 * @param {Function} props.onToggleOptions - Função para alternar opções
 */
const ChatHeader = ({ context, onClearContext, onToggleOptions }) => {
  const { t } = useTranslation();
  
  // Obter título baseado no contexto
  const getTitle = () => {
    if (!context.type || context.type === 'general') {
      return t('chat.amazoniaBotName');
    }
    
    switch (context.type) {
      case 'event':
        return context.name || t('chat.contextEvent');
      case 'place':
        return context.name || t('chat.contextPlace');
      case 'emergency':
        return context.name || t('chat.contextEmergency');
      case 'connectivity':
        return context.name || t('chat.contextConnectivity');
      default:
        return t('chat.amazoniaBotName');
    }
  };
  
  // Obter descrição baseada no contexto
  const getDescription = () => {
    if (!context.type || context.type === 'general') {
      return t('chat.botDescription');
    }
    
    switch (context.type) {
      case 'event':
        return context.description || t('chat.contextEventDescription');
      case 'place':
        return context.description || t('chat.contextPlaceDescription');
      case 'emergency':
        return context.description || t('chat.contextEmergencyDescription');
      case 'connectivity':
        return context.description || t('chat.contextConnectivityDescription');
      default:
        return t('chat.botDescription');
    }
  };
  
  return (
    <div className="border-b bg-white p-4">
      <div className="flex items-center justify-between">
        {/* Informações do chat */}
        <div className="flex items-center">
          {/* Ícone e título */}
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
            <MessageSquare size={20} />
          </div>
          <div>
            <h2 className="font-bold">{getTitle()}</h2>
            <p className="text-sm text-gray-600">{getDescription()}</p>
          </div>
        </div>
        
        {/* Botões de ação */}
        <div className="flex space-x-2">
          {/* Botão para limpar contexto (se houver) */}
          {context.type && context.type !== 'general' && (
            <button
              className="p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-200"
              onClick={onClearContext}
              aria-label={t('chat.clearContext')}
              title={t('chat.clearContext')}
            >
              <X size={20} />
            </button>
          )}
          
          {/* Botão para abrir opções */}
          <button
            className="p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-200"
            onClick={onToggleOptions}
            aria-label={t('chat.options')}
            title={t('chat.options')}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;