import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, AlertCircle } from 'lucide-react';

/**
 * Componente que exibe o tempo restante durante um quiz
 * @param {Object} props - Propriedades do componente
 * @param {number} props.timeRemaining - Tempo restante em segundos
 * @param {string} props.formattedTime - Tempo formatado (MM:SS)
 */
const QuizTimer = ({ timeRemaining, formattedTime }) => {
  const { t } = useTranslation();
  const [isWarning, setIsWarning] = useState(false);
  const [isAlert, setIsAlert] = useState(false);
  
  // Verificar se o tempo está ficando curto
  useEffect(() => {
    if (!timeRemaining) return;
    
    // Modo de aviso (menos de 2 minutos)
    setIsWarning(timeRemaining < 120);
    
    // Modo de alerta (menos de 30 segundos)
    setIsAlert(timeRemaining < 30);
  }, [timeRemaining]);
  
  // Determinar classe de cor baseada no tempo restante
  const getColorClass = () => {
    if (isAlert) return 'text-red-600';
    if (isWarning) return 'text-yellow-600';
    return 'text-gray-600';
  };
  
  // Animação de pulso para o alerta
  const pulseClass = isAlert ? 'animate-pulse' : '';
  
  // Se não houver tempo, não renderizar
  if (!timeRemaining && timeRemaining !== 0) {
    return null;
  }
  
  return (
    <div className={`flex items-center ${getColorClass()} ${pulseClass}`}>
      {isAlert ? (
        <AlertCircle className="h-5 w-5 mr-2" />
      ) : (
        <Clock className="h-5 w-5 mr-2" />
      )}
      <div>
        <div className="text-sm font-medium">
          {t('quiz.timeRemaining')}
        </div>
        <div className="text-lg font-bold">
          {formattedTime}
        </div>
      </div>
    </div>
  );
};

export default QuizTimer;