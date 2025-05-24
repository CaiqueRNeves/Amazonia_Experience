import React from 'react';
import { useTranslation } from 'react-i18next';

// Ícones
import { Calendar, MapPin, AlertTriangle, Wifi, Info, X } from 'lucide-react';

/**
 * Componente que exibe o contexto atual do chat
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.context - Contexto atual do chat
 */
const ChatContext = ({ context }) => {
  const { t } = useTranslation();
  
  // Se não houver contexto, não renderiza nada
  if (!context || !context.type || context.type === 'general') {
    return null;
  }
  
  // Obter ícone com base no tipo de contexto
  const getContextIcon = () => {
    switch (context.type) {
      case 'event':
        return <Calendar size={18} />;
      case 'place':
        return <MapPin size={18} />;
      case 'emergency':
        return <AlertTriangle size={18} />;
      case 'connectivity':
        return <Wifi size={18} />;
      default:
        return <Info size={18} />;
    }
  };
  
  // Obter título do contexto
  const getContextTitle = () => {
    switch (context.type) {
      case 'event':
        return t('chat.contextTitle.event');
      case 'place':
        return t('chat.contextTitle.place');
      case 'emergency':
        return t('chat.contextTitle.emergency');
      case 'connectivity':
        return t('chat.contextTitle.connectivity');
      default:
        return t('chat.contextTitle.general');
    }
  };
  
  // Obter classe de cor com base no tipo de contexto
  const getContextColorClass = () => {
    switch (context.type) {
      case 'event':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'place':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'emergency':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'connectivity':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };
  
  return (
    <div className={`${getContextColorClass()} border-b p-3 text-sm`}>
      <div className="flex items-center">
        <span className="mr-2">{getContextIcon()}</span>
        <span className="font-medium mr-2">{getContextTitle()}:</span>
        <span className="font-bold">{context.name}</span>
      </div>
      {context.description && (
        <div className="ml-6 mt-1 text-xs opacity-80 line-clamp-2">
          {context.description}
        </div>
      )}
    </div>
  );
};

export default ChatContext;