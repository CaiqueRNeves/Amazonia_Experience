import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getQuizAttempts } from '../../redux/slices/quizzesSlice';

// Componentes
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';
import Pagination from '../common/Pagination';

// Ícones
import { BookOpen, Clock, Trophy, BarChart2, CheckCircle, XCircle, Calendar } from 'lucide-react';

/**
 * Componente que exibe o histórico de tentativas de quiz do usuário
 */
const QuizAttemptHistory = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  // Estado do Redux
  const { attempts, isLoading, error } = useSelector((state) => state.quizzes);
  
  // Estados locais
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  // Carregar tentativas quando o componente for montado
  useEffect(() => {
    dispatch(getQuizAttempts({
      page: currentPage,
      limit: itemsPerPage
    }));
  }, [dispatch, currentPage, itemsPerPage]);
  
  // Função para lidar com a mudança de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  // Formatar data
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(t('locale'), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Obter classe de estilo para o status
  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Obter texto para o status
  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return t('quiz.status.completed');
      case 'in_progress':
        return t('quiz.status.inProgress');
      case 'expired':
        return t('quiz.status.expired');
      default:
        return t('quiz.status.unknown');
    }
  };
  
  // Renderizar o loader durante o carregamento
  if (isLoading && !attempts.data) {
    return <Loader message={t('quiz.loadingAttempts')} />;
  }
  
  // Renderizar mensagem de erro
  if (error) {
    return <ErrorMessage message={error} retryAction={() => dispatch(getQuizAttempts())} />;
  }
  
  // Renderizar estado vazio se não houver tentativas
  if (!attempts.data || attempts.data.attempts.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen size={48} />}
        title={t('quiz.attemptHistory.emptyState.title')}
        description={t('quiz.attemptHistory.emptyState.description')}
      />
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold">{t('quiz.attemptHistory.title')}</h2>
        <p className="text-sm text-gray-600">{t('quiz.attemptHistory.description')}</p>
      </div>
      
      {/* Lista de tentativas */}
      <div className="divide-y divide-gray-200">
        {attempts.data.attempts.map((attempt) => (
          <div key={attempt.id} className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
              <div>
                <h3 className="font-bold">{attempt.quiz_title}</h3>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <BarChart2 className="h-4 w-4 mr-1" />
                  {t(`quiz.difficulty.${attempt.quiz_difficulty || 'medium'}`)}
                </div>
              </div>
              
              <div className="mt-2 md:mt-0">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(attempt.status)}`}>
                  {getStatusText(attempt.status)}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {/* Pontuação */}
              <div className="flex items-center">
                <div className="rounded-full h-10 w-10 flex items-center justify-center bg-blue-100 text-blue-600 mr-3">
                  {attempt.status === 'completed' ? (
                    <Trophy className="h-5 w-5" />
                  ) : (
                    <Clock className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('quiz.score')}</p>
                  {attempt.status === 'completed' ? (
                    <p className="font-bold">{attempt.score || 0}%</p>
                  ) : (
                    <p className="text-gray-600">{t('common.notAvailable')}</p>
                  )}
                </div>
              </div>
              
              {/* AmaCoins ganhos */}
              <div className="flex items-center">
                <div className="rounded-full h-10 w-10 flex items-center justify-center bg-amber-100 text-amber-600 mr-3">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('quiz.amacoinsEarned')}</p>
                  {attempt.status === 'completed' ? (
                    <p className="font-bold">{attempt.amacoins_earned || 0}</p>
                  ) : (
                    <p className="text-gray-600">0</p>
                  )}
                </div>
              </div>
              
              {/* Data de início */}
              <div className="flex items-center">
                <div className="rounded-full h-10 w-10 flex items-center justify-center bg-gray-100 text-gray-600 mr-3">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('quiz.startedAt')}</p>
                  <p className="text-sm">{formatDate(attempt.started_at)}</p>
                </div>
              </div>
              
              {/* Data de conclusão */}
              <div className="flex items-center">
                <div className="rounded-full h-10 w-10 flex items-center justify-center bg-gray-100 text-gray-600 mr-3">
                  {attempt.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : attempt.status === 'expired' ? (
                    <XCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <Clock className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('quiz.completedAt')}</p>
                  {attempt.completed_at ? (
                    <p className="text-sm">{formatDate(attempt.completed_at)}</p>
                  ) : (
                    <p className="text-gray-600">{t('common.notAvailable')}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Paginação */}
      {attempts.data.pagination && (
        <div className="p-4 border-t">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(attempts.data.pagination.total / itemsPerPage)}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default QuizAttemptHistory;