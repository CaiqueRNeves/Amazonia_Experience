import React from 'react';
import { useTranslation } from 'react-i18next';

// Ícones
import { Send, Mic, PaperclipIcon, Image } from 'lucide-react';

/**
 * Componente de entrada de mensagem para o chat
 * @param {Object} props - Propriedades do componente
 * @param {string} props.value - Valor atual do input
 * @param {Function} props.onChange - Função chamada quando o valor muda
 * @param {Function} props.onSend - Função chamada quando a mensagem é enviada
 * @param {boolean} props.isLoading - Se está carregando
 * @param {string} props.placeholder - Texto de placeholder
 */
const ChatInput = ({ value, onChange, onSend, isLoading, placeholder }) => {
  const { t } = useTranslation();
  
  // Lidar com mudanças no input
  const handleChange = (e) => {
    onChange(e.target.value);
  };
  
  // Lidar com envio da mensagem ao pressionar Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && value.trim()) {
        onSend();
      }
    }
  };
  
  // Lidar com o clique no botão de enviar
  const handleSendClick = () => {
    if (!isLoading && value.trim()) {
      onSend();
    }
  };
  
  // Lidar com o clique no botão de voz (exemplo, não implementado)
  const handleVoiceClick = () => {
    // Implementação futura para entrada de voz
    alert(t('common.featureComingSoon'));
  };
  
  // Lidar com o clique no botão de anexo (exemplo, não implementado)
  const handleAttachClick = () => {
    // Implementação futura para anexos
    alert(t('common.featureComingSoon'));
  };
  
  // Lidar com o clique no botão de imagem (exemplo, não implementado)
  const handleImageClick = () => {
    // Implementação futura para imagens
    alert(t('common.featureComingSoon'));
  };
  
  return (
    <div className="border-t bg-white p-3">
      <div className="flex rounded-lg border overflow-hidden">
        {/* Área de texto */}
        <textarea
          className="flex-1 py-2 px-3 outline-none resize-none"
          placeholder={placeholder || t('chat.typingPrompt')}
          rows="1"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        
        {/* Botões de ação */}
        <div className="flex items-center bg-gray-50 px-2">
          {/* Botão de anexo */}
          <button
            className="p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-200"
            onClick={handleAttachClick}
            disabled={isLoading}
            aria-label={t('chat.attachFile')}
            title={t('chat.attachFile')}
          >
            <PaperclipIcon size={18} />
          </button>
          
          {/* Botão de imagem */}
          <button
            className="p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-200"
            onClick={handleImageClick}
            disabled={isLoading}
            aria-label={t('chat.attachImage')}
            title={t('chat.attachImage')}
          >
            <Image size={18} />
          </button>
          
          {/* Botão de voz */}
          <button
            className="p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-200"
            onClick={handleVoiceClick}
            disabled={isLoading}
            aria-label={t('chat.voiceMessage')}
            title={t('chat.voiceMessage')}
          >
            <Mic size={18} />
          </button>
          
          {/* Botão de enviar */}
          <button
            className={`p-2 rounded-full ${value.trim() ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-100' : 'text-gray-400 cursor-not-allowed'}`}
            onClick={handleSendClick}
            disabled={isLoading || !value.trim()}
            aria-label={t('chat.send')}
            title={t('chat.send')}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
      
      {/* Texto de ajuda */}
      <div className="text-xs text-gray-500 mt-1 px-2">
        {t('chat.inputHelp')}
      </div>
    </div>
  );
};

export default ChatInput;