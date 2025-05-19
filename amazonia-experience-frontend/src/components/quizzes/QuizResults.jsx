import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

// Componentes e ícones
import Button from '../common/Button';
import { Trophy, Award, ArrowLeft, BarChart2, Repeat, Star, Share2 } from 'lucide-react';

/**
 * Componente que exibe os resultados após completar um quiz
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.result - Resultados do quiz
 * @param {Object} props.quiz - Dados do quiz
 * @param {Function} props.onTryAgain - Função para tentar o quiz novamente
 * @param {Function} props.onViewLeaderboard - Função para ver o ranking
 * @param {Function} props.onBackToQuizzes - Função para voltar à lista de quizzes
 */
const QuizResults = ({ 
  result, 
  quiz, 
  onTryAgain, 
  onViewLeaderboard, 
  onBackToQuizzes 
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Lançar confete para pontuações altas (>= 80%)
  React.useEffect(() => {
    if (result && result.score >= 80) {
      launchConfetti();
    }
  }, [result]);
  
  // Função para lançar confete
  const launchConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };
  
  // Obter mensagem baseada na pontuação
  const getScoreMessage = () => {
    if (!result) return '';
    
    if (result.score >= 90) return t('quiz.results.excellent');
    if (result.score >= 70) return t('quiz.results.good');
    if (result.score >= 50) return t('quiz.results.average');
    return t('quiz.results.needsImprovement');
  };
  
  // Obter cor baseada na pontuação
  const getScoreColor = () => {
    if (!result) return 'text-gray-600';
    
    if (result.score >= 90) return 'text-green-600';
    if (result.score >= 70) return 'text-blue-600';
    if (result.score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Compartilhar resultado
  const shareResult = () => {
    if (navigator.share) {
      navigator.share({
        title: t('quiz.shareTitle', { quizTitle: quiz?.title }),
        text: t('quiz.shareText', { 
          score: result.score, 
          quizTitle: quiz?.title 
        }),
        url: window.location.href
      }).catch(err => {
        console.error('Erro ao compartilhar:', err);
      });
    } else {
      // Fallback: copiar para área de transferência
      const shareText = t('quiz.shareText', { 
        score: result.score, 
        quizTitle: quiz?.title 
      });
      
      navigator.clipboard.writeText(shareText + ' ' + window.location.href)
        .then(() => {
          alert(t('common.copiedToClipboard'));
        })
        .catch(err => {
          console.error('Erro ao copiar:', err);
        });
    }
  };
  
  // Renderizar mensagem caso não haja resultado
  if (!result) {
    return (
      <div className="text-center p-6">
        <Trophy className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
        <h3 className="text-lg font-medium">{t('quiz.noResultsAvailable')}</h3>
        <Button 
          onClick={onBackToQuizzes}
          className="mt-4"
          primary
        >
          {t('quiz.backToQuizzes')}
        </Button>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <Trophy className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t('quiz.results.completed')}</h1>
          <p className="text-gray-600">{quiz?.title}</p>
        </div>
        
        {/* Pontuação */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className={`text-6xl font-bold ${getScoreColor()}`}>
              {result.score}%
            </div>
          </div>
          <p className="text-xl font-medium mb-2">{getScoreMessage()}</p>
          <p className="text-gray-600">
            {t('quiz.results.correctAnswers', { 
              correct: result.correct_answers, 
              total: result.total_questions 
            })}
          </p>
        </div>
        
        {/* Recompensa */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <Award className="h-10 w-10 text-amber-500 mr-4" />
            <div>
              <h3 className="text-lg font-bold text-amber-700">
                {t('quiz.results.rewardEarned')}
              </h3>
              <p className="text-amber-700">
                {t('quiz.results.amacoinsEarned', { count: result.amacoins_earned })}
              </p>
            </div>
          </div>
        </div>
        
        {/* Estatísticas adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <BarChart2 className="h-6 w-6 text-blue-500 mr-2" />
              <h3 className="text-lg font-medium">{t('quiz.difficulty.label')}</h3>
            </div>
            <p className="mt-2">{t(`quiz.difficulty.${quiz?.difficulty || 'medium'}`)}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <Star className="h-6 w-6 text-yellow-500 mr-2" />
              <h3 className="text-lg font-medium">{t('quiz.topics.label')}</h3>
            </div>
            <p className="mt-2">{t(`quiz.topics.${quiz?.topic || 'other'}`)}</p>
          </div>
        </div>
        
        {/* Botões de ação */}
        <div className="flex flex-col md:flex-row gap-4">
          <Button
            onClick={onBackToQuizzes}
            className="w-full md:w-auto"
            secondary
            icon={<ArrowLeft className="h-4 w-4 mr-2" />}
          >
            {t('quiz.backToQuizzes')}
          </Button>
          
          <Button
            onClick={onTryAgain}
            className="w-full md:w-auto"
            secondary
            icon={<Repeat className="h-4 w-4 mr-2" />}
          >
            {t('quiz.tryAgain')}
          </Button>
          
          <Button
            onClick={shareResult}
            className="w-full md:w-auto"
            secondary
            icon={<Share2 className="h-4 w-4 mr-2" />}
          >
            {t('common.share')}
          </Button>
          
          <Button
            onClick={onViewLeaderboard}
            className="w-full md:w-auto"
            primary
            icon={<Trophy className="h-4 w-4 mr-2" />}
          >
            {t('quiz.viewLeaderboard')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;