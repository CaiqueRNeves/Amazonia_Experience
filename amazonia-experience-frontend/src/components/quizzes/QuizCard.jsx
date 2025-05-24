import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// Componentes e ícones
import { BookOpen, Trophy, Clock, BarChart2 } from 'lucide-react';
import Badge from '../common/Badge';

/**
 * Componente de card para exibir um quiz na listagem
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.quiz - Dados do quiz
 * @param {Function} props.onClick - Função chamada ao clicar no card
 */
const QuizCard = ({ quiz, onClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Calcular dificuldade
  const getDifficultyColor = () => {
    switch (quiz.difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Verificar se o card tem imagem
  const hasImage = !!quiz.image_url;
  
  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      {/* Imagem do quiz (se disponível) */}
      {hasImage && (
        <div className="h-40 overflow-hidden">
          <img 
            src={quiz.image_url} 
            alt={quiz.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/quiz-placeholder.jpg';
            }}
          />
        </div>
      )}
      
      {/* Conteúdo do card */}
      <div className={`p-4 ${!hasImage ? 'pt-5' : ''}`}>
        {/* Tópico */}
        <div className="flex items-center mb-2">
          <BookOpen className="h-4 w-4 text-gray-500 mr-1" />
          <span className="text-xs text-gray-500">
            {t(`quiz.topics.${quiz.topic || 'other'}`)}
          </span>
        </div>
        
        {/* Título */}
        <h3 className="text-lg font-bold mb-2 line-clamp-2">{quiz.title}</h3>
        
        {/* Descrição */}
        {quiz.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {quiz.description}
          </p>
        )}
        
        {/* Detalhes do quiz */}
        <div className="flex flex-wrap gap-2 mt-auto">
          {/* Dificuldade */}
          <Badge 
            text={t(`quiz.difficulty.${quiz.difficulty || 'medium'}`)}
            className={getDifficultyColor()}
            icon={<BarChart2 className="h-3 w-3" />}
          />
          
          {/* Número de perguntas */}
          <Badge
            text={t('quiz.questionCount', { count: quiz.question_count || 0 })}
            className="bg-blue-100 text-blue-800"
            icon={<Clock className="h-3 w-3" />}
          />
          
          {/* Recompensa */}
          <Badge
            text={t('quiz.amacoins', { count: quiz.amacoins_reward || 0 })}
            className="bg-amber-100 text-amber-800"
            icon={<Trophy className="h-3 w-3" />}
          />
        </div>
      </div>
    </div>
  );
};

export default QuizCard;