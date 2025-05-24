import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  AcademicCapIcon, 
  ClockIcon, 
  StarIcon, 
  ShareIcon,
  ChevronRightIcon,
  GiftIcon
} from '@heroicons/react/24/outline';

import { Container, PageHeader } from '../components/layout';
import { Button, Badge, ProgressBar } from '../components/common';
import Modal from '../components/common/Modal';
import QuizQuestion from '../components/quizzes/QuizQuestion';
import QuizResultModal from '../components/quizzes/QuizResultModal';
import { api } from '../services/api';
import { startQuiz, answerQuiz, submitQuiz } from '../redux/quizzes/quizzesSlice';
import QuizDetailSkeleton from '../components/skeletons/QuizDetailSkeleton';

const QuizDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  
  // Estado para o quiz em andamento
  const [activeQuiz, setActiveQuiz] = useState({
    attemptId: null,
    currentQuestionIndex: 0,
    userAnswers: {},
    timeLeft: 0,
    isSubmitting: false,
  });
  
  // Timer para quiz com tempo limitado
  const [timer, setTimer] = useState(null);
  
  useEffect(() => {
    const fetchQuizDetails = async () => {
      setLoading(true);
      try {
        const response = await api.quizzes.getQuiz(id);
        setQuiz(response.quiz);
        setQuestions(response.questions || []);
      } catch (error) {
        console.error('Error fetching quiz details:', error);
        toast.error(t('quizzes.errorLoading'));
      } finally {
        setLoading(false);
      }
    };

    fetchQuizDetails();
    
    // Limpar timer ao desmontar
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [id, t]);
  
  // Iniciar o quiz
  const handleStartQuiz = async () => {
    if (!isAuthenticated) {
      toast.info(t('quizzes.loginToStart'));
      navigate('/login', { state: { from: `/quizzes/${id}` } });
      return;
    }
    
    try {
      setStarting(true);
      const resultAction = await dispatch(startQuiz(id));
      
      if (startQuiz.fulfilled.match(resultAction)) {
        const { attempt, expires_at } = resultAction.payload;
        
        // Calcular tempo restante em segundos
        const expiresAt = new Date(expires_at).getTime();
        const now = new Date().getTime();
        const timeLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));
        
        setActiveQuiz({
          ...activeQuiz,
          attemptId: attempt.id,
          currentQuestionIndex: 0,
          userAnswers: {},
          timeLeft,
        });
        
        // Iniciar timer
        if (timeLeft > 0) {
          const intervalId = setInterval(() => {
            setActiveQuiz((prev) => {
              const newTimeLeft = prev.timeLeft - 1;
              
              // Se o tempo acabou, submeter o quiz automaticamente
              if (newTimeLeft <= 0) {
                clearInterval(intervalId);
                handleSubmitQuiz();
                return { ...prev, timeLeft: 0 };
              }
              
              return { ...prev, timeLeft: newTimeLeft };
            });
          }, 1000);
          
          setTimer(intervalId);
        }
        
        setShowStartModal(false);
        toast.success(t('quizzes.quizStarted'));
      }
    } catch (error) {
      console.error('Failed to start quiz:', error);
      toast.error(t('quizzes.startError'));
    } finally {
      setStarting(false);
    }
  };
  
  // Responder a uma pergunta
  const handleAnswerQuestion = async (questionId, answer) => {
    try {
      // Salvar resposta localmente
      setActiveQuiz({
        ...activeQuiz,
        userAnswers: {
          ...activeQuiz.userAnswers,
          [questionId]: answer
        }
      });
      
      // Enviar resposta para o servidor
      const resultAction = await dispatch(
        answerQuiz({
          attemptId: activeQuiz.attemptId,
          questionId,
          answer
        })
      );
      
      if (answerQuiz.fulfilled.match(resultAction)) {
        // Avançar para a próxima pergunta se não for a última
        if (activeQuiz.currentQuestionIndex < questions.length - 1) {
          setActiveQuiz({
            ...activeQuiz,
            currentQuestionIndex: activeQuiz.currentQuestionIndex + 1
          });
        }
      }
    } catch (error) {
      console.error('Failed to answer question:', error);
      toast.error(t('quizzes.answerError'));
    }
  };
  
  // Navegar entre perguntas
  const handleNavigateQuestion = (index) => {
    if (index >= 0 && index < questions.length) {
      setActiveQuiz({
        ...activeQuiz,
        currentQuestionIndex: index
      });
    }
  };
  
  // Submeter o quiz
  const handleSubmitQuiz = async () => {
    if (activeQuiz.isSubmitting) return;
    
    try {
      setActiveQuiz({ ...activeQuiz, isSubmitting: true });
      
      // Limpar o timer
      if (timer) {
        clearInterval(timer);
        setTimer(null);
      }
      
      const resultAction = await dispatch(submitQuiz(activeQuiz.attemptId));
      
      if (submitQuiz.fulfilled.match(resultAction)) {
        setQuizResult(resultAction.payload);
        setShowResultModal(true);
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      toast.error(t('quizzes.submitError'));
    } finally {
      setActiveQuiz({ ...activeQuiz, isSubmitting: false });
    }
  };
  
  // Formatar timer
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Compartilhar quiz
  const shareQuiz = () => {
    if (navigator.share) {
      navigator.share({
        title: quiz.title,
        text: quiz.description,
        url: window.location.href,
      }).catch((error) => console.error('Error sharing:', error));
    } else {
      // Fallback para copiar link para o clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success(t('common.linkCopied'));
    }
  };
  
  // Renderizar dificuldade com estrelas
  const renderDifficulty = (difficulty) => {
    let stars = 1;
    if (difficulty === 'medium') stars = 2;
    if (difficulty === 'hard') stars = 3;
    
    return (
      <div className="flex items-center">
        {[...Array(3)].map((_, i) => (
          <StarIcon
            key={i}
            className={`h-5 w-5 ${
              i < stars ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">
          {difficulty === 'easy' 
            ? t('quizzes.easy')
            : difficulty === 'medium'
              ? t('quizzes.medium')
              : t('quizzes.hard')}
        </span>
      </div>
    );
  };

  if (loading) {
    return <QuizDetailSkeleton />;
  }

  if (!quiz) {
    return (
      <Container>
        <div className="py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('quizzes.notFound')}</h2>
          <p className="text-gray-600 mb-6">{t('quizzes.cantFind')}</p>
          <Link to="/quizzes">
            <Button>{t('quizzes.backToQuizzes')}</Button>
          </Link>
        </div>
      </Container>
    );
  }

  // Renderizar o quiz ativo se estiver em andamento
  if (activeQuiz.attemptId) {
    const currentQuestion = questions[activeQuiz.currentQuestionIndex];
    
    return (
      <div className="min-h-screen bg-gray-50">
        <Container className="py-4">
          {/* Cabeçalho do quiz */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{quiz.title}</h1>
              <p className="text-sm text-gray-600">
                {t('quizzes.question')} {activeQuiz.currentQuestionIndex + 1} {t('quizzes.of')} {questions.length}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {activeQuiz.timeLeft > 0 && (
                <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  <span className="font-mono">{formatTime(activeQuiz.timeLeft)}</span>
                </div>
              )}
              <Button
                variant="outline"
                onClick={handleSubmitQuiz}
                loading={activeQuiz.isSubmitting}
                disabled={activeQuiz.isSubmitting}
              >
                {t('quizzes.finish')}
              </Button>
            </div>
          </div>
          
          {/* Barra de progresso */}
          <div className="mb-4">
            <ProgressBar 
              progress={(activeQuiz.currentQuestionIndex / questions.length) * 100} 
              color="amazon-green"
            />
          </div>
          
          {/* Navegação de perguntas */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4 overflow-x-auto">
            <div className="flex space-x-2">
              {questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => handleNavigateQuestion(index)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm focus:outline-none ${
                    index === activeQuiz.currentQuestionIndex
                      ? 'bg-amazon-green-600 text-white'
                      : activeQuiz.userAnswers[q.id]
                        ? 'bg-amazon-green-100 text-amazon-green-800 border border-amazon-green-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
          
          {/* Questão atual */}
          {currentQuestion && (
            <div className="bg-white rounded-lg shadow p-6">
              <QuizQuestion
                question={currentQuestion}
                userAnswer={activeQuiz.userAnswers[currentQuestion.id]}
                onAnswer={(answer) => handleAnswerQuestion(currentQuestion.id, answer)}
              />
              
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => handleNavigateQuestion(activeQuiz.currentQuestionIndex - 1)}
                  disabled={activeQuiz.currentQuestionIndex === 0}
                >
                  {t('quizzes.previous')}
                </Button>
                
                {activeQuiz.currentQuestionIndex < questions.length - 1 ? (
                  <Button
                    onClick={() => handleNavigateQuestion(activeQuiz.currentQuestionIndex + 1)}
                    disabled={!activeQuiz.userAnswers[currentQuestion.id]}
                  >
                    {t('quizzes.next')}
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmitQuiz}
                    loading={activeQuiz.isSubmitting}
                    disabled={activeQuiz.isSubmitting}
                  >
                    {t('quizzes.finish')}
                  </Button>
                )}
              </div>
            </div>
          )}
        </Container>
        
        {/* Modal de resultados */}
        <QuizResultModal
          isOpen={showResultModal}
          onClose={() => {
            setShowResultModal(false);
            navigate('/quizzes');
          }}
          result={quizResult}
          quizTitle={quiz.title}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title={quiz.title}
        description={quiz.description}
        showBackButton
        backTo="/quizzes"
        actions={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={shareQuiz}
              className="bg-white/80 backdrop-blur-sm"
            >
              <ShareIcon className="h-5 w-5 mr-1" />
              {t('common.share')}
            </Button>
            
            <Button
              onClick={() => setShowStartModal(true)}
              className="bg-amazon-green-600 hover:bg-amazon-green-700"
            >
              <AcademicCapIcon className="h-5 w-5 mr-1" />
              {t('quizzes.startQuiz')}
            </Button>
          </div>
        }
      />
      
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Detalhes principais */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              {/* Badges */}
              <div className="flex mb-4">
                <Badge color="purple">{quiz.topic}</Badge>
                <Badge color="blue" className="ml-2">
                  {questions.length} {t('quizzes.questions')}
                </Badge>
              </div>
              
              {/* Detalhes do quiz */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start">
                  <AcademicCapIcon className="h-6 w-6 text-amazon-green-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{t('quizzes.topic')}</h3>
                    <p className="text-sm text-gray-600">{quiz.topic}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <StarIcon className="h-6 w-6 text-amazon-green-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{t('quizzes.difficulty')}</h3>
                    {renderDifficulty(quiz.difficulty)}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <ClockIcon className="h-6 w-6 text-amazon-green-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{t('quizzes.estimatedTime')}</h3>
                    <p className="text-sm text-gray-600">
                      {questions.length <= 5 
                        ? '5-10 min' 
                        : questions.length <= 10 
                          ? '10-15 min' 
                          : '15-20 min'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <GiftIcon className="h-6 w-6 text-amazon-green-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{t('quizzes.reward')}</h3>
                    <p className="text-sm text-gray-600">
                      {t('quizzes.upTo')} {quiz.amacoins_reward} AmaCoins
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Descrição longa */}
              <div className="prose max-w-none">
                <p>{quiz.description}</p>
              </div>
            </div>
            
            {/* Preview de perguntas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('quizzes.preview')}</h2>
              <p className="text-gray-600 mb-6">{t('quizzes.previewDescription')}</p>
              
              <div className="space-y-4">
                {questions.slice(0, 2).map((question, index) => (
                  <div 
                    key={question.id}
                    className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center mb-2">
                      <span className="bg-amazon-green-100 text-amazon-green-800 text-xs px-2 py-1 rounded-full">
                        {t('quizzes.question')} {index + 1}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900">{question.question_text}</p>
                    
                    {/* Placeholder para opções */}
                    <div className="mt-3 space-y-2">
                      {question.question_type === 'multiple_choice' && (
                        <div className="text-gray-400 italic text-sm">
                          {t('quizzes.multipleChoiceQuestion')}
                        </div>
                      )}
                      
                      {question.question_type === 'true_false' && (
                        <div className="text-gray-400 italic text-sm">
                          {t('quizzes.trueFalseQuestion')}
                        </div>
                      )}
                      
                      {question.question_type === 'open_ended' && (
                        <div className="text-gray-400 italic text-sm">
                          {t('quizzes.openEndedQuestion')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {questions.length > 2 && (
                  <div className="text-center p-4 border border-dashed border-gray-200 rounded-lg">
                    <p className="text-gray-600">
                      {t('quizzes.moreQuestions', { count: questions.length - 2 })}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-8 text-center">
                <Button
                  onClick={() => setShowStartModal(true)}
                  size="lg"
                >
                  <AcademicCapIcon className="h-5 w-5 mr-2" />
                  {t('quizzes.startQuiz')}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Recompensa AmaCoins */}
            <div className="bg-gradient-to-r from-amazon-green-500 to-sustainable-green-500 rounded-lg shadow-lg p-6 text-white mb-6">
              <h3 className="text-lg font-semibold mb-2">{t('quizzes.earnAmacoins')}</h3>
              <p className="mb-4">{t('quizzes.correctAnswersEarn')}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-4xl font-bold">{quiz.amacoins_reward}</span>
                  <span className="ml-2 font-medium">AmaCoins</span>
                </div>
                <Button
                  onClick={() => setShowStartModal(true)}
                  variant="white"
                >
                  {t('quizzes.startNow')}
                </Button>
              </div>
            </div>
            
            {/* Instruções do quiz */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">{t('quizzes.howItWorks')}</h3>
              
              <ul className="space-y-4">
                <li className="flex">
                  <div className="flex-shrink-0 h-6 w-6 bg-amazon-green-100 text-amazon-green-800 rounded-full flex items-center justify-center mr-3">
                    1
                  </div>
                  <p className="text-gray-600">{t('quizzes.step1')}</p>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 h-6 w-6 bg-amazon-green-100 text-amazon-green-800 rounded-full flex items-center justify-center mr-3">
                    2
                  </div>
                  <p className="text-gray-600">{t('quizzes.step2')}</p>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 h-6 w-6 bg-amazon-green-100 text-amazon-green-800 rounded-full flex items-center justify-center mr-3">
                    3
                  </div>
                  <p className="text-gray-600">{t('quizzes.step3')}</p>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 h-6 w-6 bg-amazon-green-100 text-amazon-green-800 rounded-full flex items-center justify-center mr-3">
                    4
                  </div>
                  <p className="text-gray-600">{t('quizzes.step4')}</p>
                </li>
              </ul>
            </div>
            
            {/* Box de ajuda */}
            <div className="bg-amazon-river-50 border border-amazon-river-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-amazon-river-800 mb-2">{t('quizzes.needHelp')}</h3>
              <p className="text-sm text-amazon-river-700 mb-4">{t('quizzes.helpText')}</p>
              <Link to="/chat">
                <Button
                  variant="outline"
                  className="w-full border-amazon-river-300 text-amazon-river-700 hover:bg-amazon-river-100"
                >
                  {t('quizzes.chatWithUs')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
      
      {/* Modal de início de quiz */}
      <Modal
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        title={t('quizzes.readyToStart')}
      >
        <div className="p-4">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{quiz.title}</h3>
            <p className="text-gray-600 mb-4">{quiz.description}</p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{t('quizzes.questions')}</p>
                  <p className="font-medium">{questions.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('quizzes.timeLimit')}</p>
                  <p className="font-medium">
                    {questions.length <= 5 
                      ? '10 min' 
                      : questions.length <= 10 
                        ? '15 min' 
                        : '20 min'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('quizzes.difficulty')}</p>
                  <p className="font-medium">
                    {quiz.difficulty === 'easy' 
                      ? t('quizzes.easy')
                      : quiz.difficulty === 'medium'
                        ? t('quizzes.medium')
                        : t('quizzes.hard')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('quizzes.reward')}</p>
                  <p className="font-medium">{quiz.amacoins_reward} AmaCoins</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setShowStartModal(false)}
            >
              {t('common.cancel')}
            </Button>
            
            <Button
              onClick={handleStartQuiz}
              loading={starting}
              disabled={starting}
            >
              <AcademicCapIcon className="h-5 w-5 mr-1" />
              {t('quizzes.beginQuiz')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuizDetail;