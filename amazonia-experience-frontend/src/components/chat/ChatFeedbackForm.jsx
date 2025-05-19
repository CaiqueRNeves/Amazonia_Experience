import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { sendFeedback } from '../../redux/slices/chatSlice';

// Componentes e ícones
import { 
  ThumbsUp, 
  ThumbsDown, 
  ThumbsUpIcon, 
  ThumbsDownIcon,
  X
} from 'lucide-react';
import TextArea from '../common/TextArea';
import Button from '../common/Button';

/**
 * Componente para fornecer feedback detalhado sobre uma resposta do chatbot
 * @param {Object} props - Propriedades do componente
 * @param {number} props.messageId - ID da mensagem
 * @param {boolean} props.isOpen - Se o componente está aberto
 * @param {Function} props.onClose - Função para fechar o componente
 */
const ChatFeedbackForm = ({ messageId, isOpen, onClose }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  // Estados locais
  const [isHelpful, setIsHelpful] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Enviar feedback
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isHelpful === null) return;
    
    setIsSubmitting(true);
    
    try {
      await dispatch(sendFeedback({
        messageId,
        isHelpful,
        feedbackText
      }));
      
      // Fechar após envio bem-sucedido
      onClose();
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Se não estiver aberto, não renderiza nada
  if (!isOpen) return null;
  
  return (
    <div className="absolute bottom-full left-0 right-0 bg-white border-t shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">{t('chat.feedback.title')}</h3>
        <button
          className="p-1 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-200"
          onClick={onClose}
          aria-label={t('common.close')}
        >
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Opções de utilidade */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">{t('chat.feedback.wasHelpful')}</p>
          <div className="flex space-x-4">
            <button
              type="button"
              className={`flex items-center px-4 py-2 rounded-lg ${
                isHelpful === true 
                  ? 'bg-green-100 text-green-700 border border-green-300' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
              onClick={() => setIsHelpful(true)}
            >
              <ThumbsUp className="h-5 w-5 mr-2" />
              {t('chat.feedback.helpful')}
            </button>
            
            <button
              type="button"
              className={`flex items-center px-4 py-2 rounded-lg ${
                isHelpful === false 
                  ? 'bg-red-100 text-red-700 border border-red-300' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
              onClick={() => setIsHelpful(false)}
            >
              <ThumbsDown className="h-5 w-5 mr-2" />
              {t('chat.feedback.notHelpful')}
            </button>
          </div>
        </div>
        
        {/* Comentário adicional */}
        <div className="mb-4">
          <label htmlFor="feedback-text" className="block text-sm text-gray-600 mb-2">
            {t('chat.feedback.additionalComments')}
          </label>
          <TextArea
            id="feedback-text"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder={t('chat.feedback.commentPlaceholder')}
            rows={3}
          />
        </div>
        
        {/* Botões de ação */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            onClick={onClose}
            secondary
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          
          <Button
            type="submit"
            primary
            disabled={isHelpful === null || isSubmitting}
            isLoading={isSubmitting}
          >
            {t('chat.feedback.submit')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatFeedbackForm;