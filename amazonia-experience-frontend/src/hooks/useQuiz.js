import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

/**
 * Hook personalizado para gerenciar quizzes
 * Fornece funções para iniciar, responder e submeter quizzes
 * 
 * @param {number} quizId - ID opcional do quiz específico
 * @returns {Object} Funções e estados para gerenciar quizzes
 */
const useQuiz = (quizId = null) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  // Estados do Redux relacionados a quizzes
  const {
    currentQuiz,
    currentAttempt,
    currentAnswer,
    result
  } = useSelector((state) => state.quizzes);
  
  // Estado local para tempo restante
  const [timeRemaining, setTimeRemaining] = useState(null);
  // Estado local para pergunta atual
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // Estado local para respostas selecionadas
  const [selectedAnswers, setSelectedAnswers] = useState({});
  
  // Importar ações do Redux
  const {
    getQuizById,
    startQuiz,
    answerQuiz,
    submitQuiz,
    clearCurrentAttempt,
    addAnswer
  } = require('../redux/slices/quizzesSlice');
  
  // Carregar detalhes do quiz quando o quizId mudar
  useEffect(() => {
    if (quizId) {
      dispatch(getQuizById(quizId));
    }
  }, [dispatch, quizId, getQuizById]);
  
  // Controlar o contador regressivo para o tempo limite
  useEffect(() => {
    let timerId;
    
    if (currentAttempt.data && currentAttempt.status === 'in_progress') {
      // Calcular o tempo restante inicial
      const expiresAt = new Date(currentAttempt.data.expires_at).getTime();
      const now = new Date().getTime();
      const initialTimeRemaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
      
      setTimeRemaining(initialTimeRemaining);
      
      // Atualizar o tempo restante a cada segundo
      timerId = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerId);
            // Submeter o quiz quando o tempo acabar
            handleTimeUp();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    // Limpar o intervalo quando o componente for desmontado
    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [currentAttempt.data, currentAttempt.status]);
  
  // Iniciar quiz
  const initQuiz = useCallback(async () => {
    if (!quizId) return false;
    
    try {
      const resultAction = await dispatch(startQuiz(quizId));
      
      if (startQuiz.fulfilled.match(resultAction)) {
        // Limpar respostas selecionadas
        setSelectedAnswers({});
        // Voltar para a primeira pergunta
        setCurrentQuestionIndex(0);
        return true;
      } else {
        toast.error(resultAction.error.message || t('quiz.errorStarting'));
        return false;
      }
    } catch (error) {
      toast.error(t('quiz.errorStarting'));
      console.error('Error starting quiz:', error);
      return false;
    }
  }, [dispatch, quizId, startQuiz, t]);
  
  // Responder pergunta
  const answerQuestion = useCallback(async (questionId, answer) => {
    if (!currentAttempt.data) return false;
    
    // Adicionar resposta ao estado local
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    try {
      const resultAction = await dispatch(answerQuiz({
        attemptId: currentAttempt.data.id,
        questionId,
        answer
      }));
      
      if (answerQuiz.fulfilled.match(resultAction)) {
        // Adicionar resposta ao estado do Redux
        dispatch(addAnswer({
          questionId,
          answer,
          isCorrect: resultAction.payload.is_correct
        }));
        
        return resultAction.payload.is_correct;
      } else {
        toast.error(resultAction.error.message || t('quiz.errorAnswering'));
        return false;
      }
    } catch (error) {
      toast.error(t('quiz.errorAnswering'));
      console.error('Error answering question:', error);
      return false;
    }
  }, [dispatch, currentAttempt.data, answerQuiz, addAnswer, t]);
  
  // Ir para a próxima pergunta
  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      return true;
    }
    return false;
  }, [currentQuestionIndex, currentQuiz.questions]);
  
  // Ir para a pergunta anterior
  const previousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      return true;
    }
    return false;
  }, [currentQuestionIndex]);
  
  // Finalizar quiz
  const finishQuiz = useCallback(async () => {
    if (!currentAttempt.data) return false;
    
    try {
      const resultAction = await dispatch(submitQuiz(currentAttempt.data.id));
      
      if (submitQuiz.fulfilled.match(resultAction)) {
        toast.success(t('quiz.completed'));
        return resultAction.payload;
      } else {
        toast.error(resultAction.error.message || t('quiz.errorSubmitting'));
        return false;
      }
    } catch (error) {
      toast.error(t('quiz.errorSubmitting'));
      console.error('Error submitting quiz:', error);
      return false;
    }
  }, [dispatch, currentAttempt.data, submitQuiz, t]);
  
  // Lidar com o fim do tempo
  const handleTimeUp = useCallback(() => {
    if (currentAttempt.data) {
      toast.warn(t('quiz.timeUp'));
      finishQuiz();
    }
  }, [currentAttempt.data, finishQuiz, t]);
  
  // Resetar o estado do quiz
  const resetQuiz = useCallback(() => {
    dispatch(clearCurrentAttempt());
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setTimeRemaining(null);
  }, [dispatch, clearCurrentAttempt]);
  
  // Formatar o tempo restante
  const formatTimeRemaining = useCallback(() => {
    if (!timeRemaining && timeRemaining !== 0) return '';
    
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [timeRemaining]);
  
  // Calcular progresso
  const calculateProgress = useCallback(() => {
    if (!currentQuiz.questions || currentQuiz.questions.length === 0) return 0;
    
    const totalQuestions = currentQuiz.questions.length;
    const answeredQuestions = Object.keys(selectedAnswers).length;
    
    return Math.round((answeredQuestions / totalQuestions) * 100);
  }, [currentQuiz.questions, selectedAnswers]);
  
  return {
    // Estados
    quiz: currentQuiz.data,
    questions: currentQuiz.questions,
    currentQuestion: currentQuiz.questions[currentQuestionIndex],
    currentQuestionIndex,
    selectedAnswers,
    attempt: currentAttempt.data,
    attemptStatus: currentAttempt.status,
    isLoading: currentQuiz.isLoading || currentAttempt.isLoading || currentAnswer.isLoading || result.isLoading,
    quizError: currentQuiz.error,
    attemptError: currentAttempt.error,
    answerError: currentAnswer.error,
    result: result.data,
    resultError: result.error,
    timeRemaining,
    timeRemainingFormatted: formatTimeRemaining(),
    progress: calculateProgress(),
    
    // Funções
    initQuiz,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    finishQuiz,
    resetQuiz
  };
};

export default useQuiz;