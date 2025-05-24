import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { sendVoiceMessage } from '../../redux/slices/chatSlice';

// Componentes e ícones
import { Mic, StopCircle, X } from 'lucide-react';
import Loader from '../common/Loader';

/**
 * Componente para gravar e enviar mensagens de voz
 * @param {Object} props - Propriedades do componente
 * @param {boolean} props.isOpen - Se o componente está aberto
 * @param {Function} props.onClose - Função para fechar o componente
 */
const VoiceRecorder = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  // Estados do Redux
  const { isLoading } = useSelector((state) => state.chat);
  
  // Estados locais
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  // Timer para contagem do tempo de gravação
  useEffect(() => {
    let interval;
    
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    
    return () => {
      clearInterval(interval);
    };
  }, [isRecording]);
  
  // Formatar tempo de gravação
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };
  
  // Iniciar gravação
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      setAudioChunks([]);
      setAudioBlob(null);
      setAudioUrl(null);
      setTranscription('');
      
      recorder.ondataavailable = (e) => {
        setAudioChunks(prev => [...prev, e.data]);
      };
      
      recorder.onstop = () => {
        const chunks = audioChunks;
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        
        setAudioBlob(blob);
        setAudioUrl(url);
        
        // Simular transcrição (em uma implementação real, enviaria para API de ASR)
        setIsTranscribing(true);
        setTimeout(() => {
          setTranscription("Mensagem de teste transcrita a partir do áudio.");
          setIsTranscribing(false);
        }, 2000);
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      alert(t('chat.voice.microphoneError'));
    }
  };
  
  // Parar gravação
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      
      // Parar todas as faixas de áudio
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };
  
  // Cancelar gravação
  const cancelRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    
    setIsRecording(false);
    setAudioChunks([]);
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscription('');
    onClose();
  };
  
  // Enviar mensagem de voz
  const sendVoice = async () => {
    if (!audioBlob || isTranscribing) return;
    
    try {
      // Em uma implementação real, enviaria o áudio para o servidor
      await dispatch(sendVoiceMessage({
        audio: audioBlob,
        transcription
      }));
      
      // Fechar o gravador após envio
      onClose();
    } catch (error) {
      console.error('Erro ao enviar mensagem de voz:', error);
    }
  };
  
  // Se não estiver aberto, não renderiza nada
  if (!isOpen) return null;
  
  return (
    <div className="absolute bottom-full left-0 right-0 bg-white border-t shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">{t('chat.voice.title')}</h3>
        <button
          className="p-1 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-200"
          onClick={cancelRecording}
          aria-label={t('common.close')}
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="text-center py-4">
        {/* Estado de gravação */}
        {isRecording ? (
          <div>
            <div className="flex justify-center mb-3">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center relative">
                <StopCircle 
                  size={40} 
                  className="text-red-600 cursor-pointer" 
                  onClick={stopRecording}
                />
                <div className="absolute inset-0 border-2 border-red-400 rounded-full animate-ping opacity-75"></div>
              </div>
            </div>
            <p className="text-red-600 font-bold">{formatTime(recordingTime)}</p>
            <p className="text-sm text-gray-600 mt-1">{t('chat.voice.recording')}</p>
          </div>
        ) : audioBlob ? (
          <div>
            {/* Reprodutor de áudio */}
            <audio className="mb-3 mx-auto" controls src={audioUrl} />
            
            {/* Transcription */}
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-1">{t('chat.voice.transcription')}:</p>
              {isTranscribing ? (
                <div className="flex justify-center">
                  <Loader size="sm" message={t('chat.voice.transcribing')} />
                </div>
              ) : (
                <p className="p-2 bg-gray-50 rounded border text-sm">{transcription || t('chat.voice.noTranscription')}</p>
              )}
            </div>
            
            {/* Botões de ação */}
            <div className="flex justify-center space-x-3">
              <button
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={startRecording}
                disabled={isLoading}
              >
                {t('chat.voice.redo')}
              </button>
              
              <button
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                onClick={sendVoice}
                disabled={isLoading || isTranscribing}
              >
                {isLoading ? t('common.sending') : t('chat.voice.send')}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-center mb-3">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 cursor-pointer hover:bg-blue-200" onClick={startRecording}>
                <Mic size={40} />
              </div>
            </div>
            <p className="text-gray-700">{t('chat.voice.tapToStart')}</p>
            <p className="text-sm text-gray-500 mt-1">{t('chat.voice.maxLength')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;