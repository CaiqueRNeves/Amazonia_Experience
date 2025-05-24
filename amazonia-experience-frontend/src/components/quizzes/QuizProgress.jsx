import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Componente que exibe a barra de progresso durante um quiz
 * @param {Object} props - Propriedades do componente
 * @param {number} props.currentQuestion - Número da pergunta atual
 * @param {number} props.totalQuestions - Número total de perguntas
 * @param {number} props.progress - Porcentagem do progresso (0-100)
 */
const QuizProgress = ({ currentQuestion, totalQuestions, progress }) => {
  const { t } = useTranslation();
  
  return (
    <div className="w-full md:max-w-xs">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-600">
          {t('quiz.questionCounter', { current: currentQuestion, total: totalQuestions })}
        </span>
        <span className="text-sm font-semibold">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-green-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default QuizProgress;