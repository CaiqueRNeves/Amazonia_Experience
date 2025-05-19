import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { clearHistory } from '../../redux/slices/chatSlice';

// Componentes e ícones
import { 
  Trash2, 
  Mic,
  Settings,
  HelpCircle,
  X,
  DownloadCloud
} from 'lucide-react';
import ConfirmDialog from '../common/ConfirmDialog';

/**
 * Componente que exibe configurações do chat
 * @param {Object} props - Propriedades do componente
 * @param {boolean} props.isOpen - Se o componente está aberto
 * @param {Function} props.onClose - Função para fechar o componente
 */
const ChatSettings = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  // Estados locais
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [autoVoiceResponses, setAutoVoiceResponses] = useState(false);
  
  // Limpar histórico de chat
  const handleClearHistory = () => {
    dispatch(clearHistory());
    setShowClearConfirm(false);
  };
  
  // Download do histórico de chat
  const handleDownloadHistory = () => {
    // Implementação futura para exportar histórico
    alert(t('common.featureComingSoon'));
  };
  
  // Alternar entrada de voz
  const handleToggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    // Implementação futura para entrada de voz
    alert(t('common.featureComingSoon'));
  };
  
  // Alternar respostas automáticas de voz
  const handleToggleAutoVoice = () => {
    setAutoVoiceResponses(!autoVoiceResponses);
    // Implementação futura para saída de voz
    alert(t('common.featureComingSoon'));
  };
  
  // Se não estiver aberto, não renderiza nada
  if (!isOpen) return null;
  
  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 bg-white z-10 flex flex-col">
      {/* Cabeçalho */}
      <div className="border-b p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Settings className="h-5 w-5 mr-2 text-gray-600" />
          <h2 className="font-bold">{t('chat.settings.title')}</h2>
        </div>
        <button
          className="p-1 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-200"
          onClick={onClose}
          aria-label={t('common.close')}
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Conteúdo */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {/* Seção de histórico */}
          <div>
            <h3 className="text-lg font-medium mb-3">{t('chat.settings.historySectionTitle')}</h3>
            
            <div className="space-y-4">
              {/* Limpar histórico */}
              <button
                className="flex items-center text-red-600 hover:text-red-800"
                onClick={() => setShowClearConfirm(true)}
              >
                <Trash2 className="h-5 w-5 mr-2" />
                <span>{t('chat.settings.clearHistory')}</span>
              </button>
              
              {/* Download do histórico */}
              <button
                className="flex items-center text-blue-600 hover:text-blue-800"
                onClick={handleDownloadHistory}
              >
                <DownloadCloud className="h-5 w-5 mr-2" />
                <span>{t('chat.settings.downloadHistory')}</span>
              </button>
            </div>
          </div>
          
          {/* Seção de voz */}
          <div>
            <h3 className="text-lg font-medium mb-3">{t('chat.settings.voiceSectionTitle')}</h3>
            
            <div className="space-y-4">
              {/* Entrada de voz */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Mic className="h-5 w-5 mr-2 text-gray-600" />
                  <span>{t('chat.settings.enableVoiceInput')}</span>
                </div>
                <div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={voiceEnabled}
                      onChange={handleToggleVoice}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
              
              {/* Resposta automática por voz */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Mic className="h-5 w-5 mr-2 text-gray-600" />
                  <span>{t('chat.settings.autoVoiceResponses')}</span>
                </div>
                <div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={autoVoiceResponses}
                      onChange={handleToggleAutoVoice}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Seção de ajuda */}
          <div>
            <h3 className="text-lg font-medium mb-3">{t('chat.settings.helpSectionTitle')}</h3>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start">
                <HelpCircle className="h-5 w-5 mr-2 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-700 mb-2">{t('chat.settings.helpText')}</p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>{t('chat.settings.helpItem1')}</li>
                    <li>{t('chat.settings.helpItem2')}</li>
                    <li>{t('chat.settings.helpItem3')}</li>
                    <li>{t('chat.settings.helpItem4')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Diálogo de confirmação para limpar histórico */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearHistory}
        title={t('chat.settings.clearHistoryConfirm.title')}
        description={t('chat.settings.clearHistoryConfirm.description')}
        confirmText={t('chat.settings.clearHistoryConfirm.confirm')}
        cancelText={t('common.cancel')}
        icon={<Trash2 className="h-6 w-6 text-red-500" />}
        danger
      />
    </div>
  );
};

export default ChatSettings;