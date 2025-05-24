/**
 * Exporta todos os componentes da pasta chat
 * para facilitar a importação em outros arquivos
 */

import ChatContainer from './ChatContainer';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import ChatHeader from './ChatHeader';
import ChatOptions from './ChatOptions';
import ChatContext from './ChatContext';
import ChatFeedbackForm from './ChatFeedbackForm';
import ChatSettings from './ChatSettings';
import ChatPage from './ChatPage';
import VoiceRecorder from './VoiceRecorder';

export {
  ChatContainer,
  ChatBubble,
  ChatInput,
  ChatHeader,
  ChatOptions,
  ChatContext,
  ChatFeedbackForm,
  ChatSettings,
  ChatPage,
  VoiceRecorder
};

// Exportação padrão do componente principal
export default ChatPage;