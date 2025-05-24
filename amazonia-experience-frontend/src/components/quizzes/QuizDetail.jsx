import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getQuizById } from '../../redux/slices/quizzesSlice';

// Hooks
import { useQuiz } from '../../hooks';

// Componentes
import QuizQuestion from './QuizQuestion';
import QuizProgress from './QuizProgress';
import QuizTimer from './QuizTimer';
import QuizResults from './QuizResults';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';
import Button from '../common/Button';
import ConfirmDialog from '../common/ConfirmDialog';

// Ícones
import { AlertTriangle, BookOpen, Trophy, Clock, BarChart2 } from 'lucide-react';

/**
 * Componente que exibe os detalhes de um quiz e gerencia a experiência do quiz
 */
const QuizDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Estado do quiz do Redux
  const { currentQuiz, isLoading, error } = useSelector((state) => state.quizzes);
  
  // Estados locais
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  
  // Usar o hook personalizado para gerenciar o quiz
  const {
    quiz,
    questions,
    currentQuestion,
    currentQuestionIndex,
    attempt,
    attemptStatus,
    selectedAnswers,
    timeRemaining,
    timeRemainingFormatted,
    progress,
    result,
    isLoading: quizIsLoading,
    
    initQuiz,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    finishQuiz,
    resetQuiz
  } = useQuiz(id);
  
  // Carregar detalhes do quiz quando o componente for montado
  useEffect(() => {
    if (id) {
      dispatch(getQuizById(id));
    }
    
    // Limpar estado do quiz ao desmontar o componente
    return () => {
      resetQuiz();
    };
  }, [dispatch, id, resetQuiz]);
  
  // Função para iniciar o quiz
  const handleStartQuiz = async () => {
    const started = await initQuiz();
    if (started) {
      setShowStartDialog(false);
    }
  };
  
  // Função para responder uma pergunta
  const handleAnswer = async (answer) => {
    if (!currentQuestion) return;
    
    await answerQuestion(currentQuestion.id, answer);
    
    // Avançar automaticamente para a próxima pergunta após responder
    setTimeout(() => {
      nextQuestion();
    }, 1000);
  };
  
  // Função para finalizar o quiz
  const handleFinishQuiz = async () => {
    await finishQuiz();
  };
  
  // Função para sair do quiz
  const handleQuitQuiz = () => {
    resetQuiz();
    setShowQuitDialog(false);
  };
  
  // Função para tentar novamente
  const handleTryAgain = () => {
    resetQuiz();
  };
  
  // Verificar se o quiz está ativo
  const isQuizActive = attempt && attemptStatus === 'in_progress';
  
  // Verificar se o quiz está concluído
  const isQuizCompleted = attemptStatus === 'completed';
  
  // Renderizar o loader durante o carregamento
  if ((isLoading && !currentQuiz.data) || quizIsLoading) {
    return <Loader message={t('quiz.loading')} />;
  }
  
  // Renderizar mensagem de erro
  if (error) {
    return <ErrorMessage message={error} retryAction={() => dispatch(getQuizById(id))} />;
  }
  
  // Renderizar os resultados se o quiz estiver concluído
  if (isQuizCompleted && result) {
    return (
      <QuizResults
        result={result}
        quiz={quiz}
        onTryAgain={handleTryAgain}
        onViewLeaderboard={() => navigate('/quizzes/leaderboard')}
        onBackToQuizzes={() => navigate('/quizzes')}
      />
    );
  }
  
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Cabeçalho do quiz */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{quiz?.title}</h1>
        
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center">
            <BookOpen size={16} className="mr-1" />
            {t(`quiz.topics.${quiz?.topic || 'other'}`)}
          </div>
          
          <div className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center">
            <BarChart2 size={16} className="mr-1" />
            {t(`quiz.difficulty.${quiz?.difficulty || 'medium'}`)}
          </div>
          
          <div className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center">
            <Trophy size={16} className="mr-1" />
            {t('quiz.reward', { count: quiz?.amacoins_reward || 0 })}
          </div>
          
          <div className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center">
            <Clock size={16} className="mr-1" />
            {t('quiz.questionCount', { count: questions?.length || 0 })}
          </div>
        </div>
        
        <p className="text-gray-700">{quiz?.description}</p>
        
        {/* Botão para iniciar o quiz */}
        {!isQuizActive && !isQuizCompleted && (
          <Button
            onClick={() => setShowStartDialog(true)}
            className="mt-4 w-full md:w-auto"
            primary
          >
            {t('quiz.startQuiz')}
          </Button>
        )}
      </div>
      
      {/* Área do quiz ativo */}
      {isQuizActive && (
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Barra de progresso e timer */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <QuizProgress
              currentQuestion={currentQuestionIndex + 1}
              totalQuestions={questions?.length || 0}
              progress={progress}
            />
            
            <QuizTimer
              timeRemaining={timeRemaining}
              formattedTime={timeRemainingFormatted}
            />
          </div>
          
          {/* Pergunta atual */}
          {currentQuestion && (
            <QuizQuestion
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions?.length || 0}
              selectedAnswer={selectedAnswers[currentQuestion.id]}
              onAnswer={handleAnswer}
            />
          )}
          
          {/* Botões de navegação */}
          <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <Button
                onClick={() => previousQuestion()}
                disabled={currentQuestionIndex === 0}
                secondary
                className="w-full sm:w-auto"
              >
                {t('common.previous')}
              </Button>
            </div>
            
            <div className="flex gap-4">
              <Button
                onClick={() => setShowQuitDialog(true)}
                danger
                outline
                className="w-full sm:w-auto"
              >
                {t('common.quit')}
              </Button>
              
              {currentQuestionIndex === questions.length - 1 ? (
                <Button
                  onClick={handleFinishQuiz}
                  primary
                  className="w-full sm:w-auto"
                  disabled={Object.keys(selectedAnswers).length < questions.length}
                >
                  {t('quiz.finish')}
                </Button>
              ) : (
                <Button
                  onClick={() => nextQuestion()}
                  primary
                  className="w-full sm:w-auto"
                >
                  {t('common.next')}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Diálogo de confirmação para iniciar o quiz */}
      <ConfirmDialog
        isOpen={showStartDialog}
        onClose={() => setShowStartDialog(false)}
        onConfirm={handleStartQuiz}
        title={t('quiz.startQuizConfirm.title')}
        description={t('quiz.startQuizConfirm.description', { time: 15 })}
        confirmText={t('quiz.startQuizConfirm.confirm')}
        cancelText={t('common.cancel')}
        icon={<Clock className="h-6 w-6 text-yellow-500" />}
      />
      
      {/* Diálogo de confirmação para sair do quiz */}
      <ConfirmDialog
        isOpen={showQuitDialog}
        onClose={() => setShowQuitDialog(false)}
        onConfirm={handleQuitQuiz}
        title={t('quiz.quitQuizConfirm.title')}
        description={t('quiz.quitQuizConfirm.description')}
        confirmText={t('quiz.quitQuizConfirm.confirm')}
        cancelText={t('common.cancel')}
        icon={<AlertTriangle className="h-6 w-6 text-red-500" />}
        danger
      />
    </div>
  );
};

export default QuizDetail;