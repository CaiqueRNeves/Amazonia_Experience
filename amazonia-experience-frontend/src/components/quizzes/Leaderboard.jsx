import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getLeaderboard } from '../../redux/slices/quizzesSlice';

// Componentes
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';
import Pagination from '../common/Pagination';
import UserAvatar from '../common/UserAvatar';
import FilterSelect from '../common/FilterSelect';
import EmptyState from '../common/EmptyState';

// Ícones
import { Trophy, Medal, Award, Users, ArrowLeft, Filter } from 'lucide-react';

/**
 * Renderiza o ícone da medalha com base na posição
 * @param {number} position - Posição no ranking
 * @returns {JSX.Element} Ícone da medalha
 */
const RankingIcon = ({ position }) => {
  if (position === 1) {
    return <Trophy className="h-6 w-6 text-yellow-500" />;
  } else if (position === 2) {
    return <Medal className="h-6 w-6 text-gray-400" />;
  } else if (position === 3) {
    return <Medal className="h-6 w-6 text-amber-600" />;
  }
  
  return <span className="h-6 w-6 flex items-center justify-center font-bold text-gray-500">{position}</span>;
};

/**
 * Componente que exibe o ranking de jogadores de quiz
 */
const Leaderboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Estado do Redux
  const { leaderboard, isLoading, error } = useSelector((state) => state.quizzes);
  const { user } = useSelector((state) => state.auth);
  
  // Estados locais
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  
  // Buscar lista de quizzes para o filtro
  useEffect(() => {
    // Em uma implementação real, buscaríamos a lista de quizzes da API
    // Aqui, estamos usando dados de exemplo
    setQuizzes([
      { id: '', name: t('common.all') },
      { id: '1', name: 'Amazônia e sua Biodiversidade' },
      { id: '2', name: 'Sustentabilidade e Mudanças Climáticas' },
      { id: '3', name: 'Cultura Indígena' }
    ]);
  }, [t]);
  
  // Carregar ranking quando o componente for montado ou os filtros mudarem
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      quiz_id: selectedQuiz || undefined
    };
    
    dispatch(getLeaderboard(params));
  }, [dispatch, currentPage, itemsPerPage, selectedQuiz]);
  
  // Função para lidar com a mudança de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Rolar para o topo da página
    window.scrollTo(0, 0);
  };
  
  // Função para limpar filtros
  const clearFilters = () => {
    setSelectedQuiz('');
  };
  
  // Verificar se o usuário está no ranking
  const isUserInLeaderboard = () => {
    if (!user || !leaderboard.data || !leaderboard.data.leaderboard) return false;
    
    return leaderboard.data.leaderboard.some(player => player.id === user.id);
  };
  
  // Encontrar a posição do usuário no ranking
  const getUserRankingPosition = () => {
    if (!isUserInLeaderboard()) return null;
    
    const userRanking = leaderboard.data.leaderboard.findIndex(player => player.id === user.id) + 1;
    
    return {
      position: userRanking,
      data: leaderboard.data.leaderboard.find(player => player.id === user.id)
    };
  };
  
  // Renderizar o loader durante o carregamento
  if (isLoading && !leaderboard.data) {
    return <Loader message={t('quiz.loadingLeaderboard')} />;
  }
  
  // Renderizar mensagem de erro
  if (error) {
    return <ErrorMessage message={error} retryAction={() => dispatch(getLeaderboard())} />;
  }
  
  // Renderizar estado vazio se não houver dados
  if (!leaderboard.data || leaderboard.data.leaderboard.length === 0) {
    return (
      <EmptyState
        icon={<Trophy size={48} />}
        title={t('quiz.leaderboard.emptyState.title')}
        description={t('quiz.leaderboard.emptyState.description')}
        actionText={selectedQuiz ? t('common.clearFilters') : t('quiz.backToQuizzes')}
        action={selectedQuiz ? clearFilters : () => navigate('/quizzes')}
      />
    );
  }
  
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <button
            onClick={() => navigate('/quizzes')}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('quiz.backToQuizzes')}
          </button>
          <h1 className="text-2xl font-bold">{t('quiz.leaderboard.title')}</h1>
          <p className="text-gray-600">{t('quiz.leaderboard.description')}</p>
        </div>
        
        {/* Filtro por quiz */}
        <div className="mt-4 md:mt-0 w-full md:w-1/3">
          <FilterSelect
            options={quizzes.map(quiz => ({ value: quiz.id, label: quiz.name }))}
            value={selectedQuiz}
            onChange={(e) => setSelectedQuiz(e.target.value)}
            label={t('quiz.leaderboard.filterByQuiz')}
          />
          
          {selectedQuiz && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center mt-2"
            >
              <Filter size={14} className="mr-1" />
              {t('common.clearFilters')}
            </button>
          )}
        </div>
      </div>
      
      {/* Destaque para os três primeiros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {leaderboard.data.leaderboard.slice(0, 3).map((player, index) => (
          <div
            key={player.id}
            className={`bg-white rounded-lg shadow-md p-6 text-center ${
              index === 0 ? 'md:order-2 ring-2 ring-yellow-400' : 
              index === 1 ? 'md:order-1 ring-2 ring-gray-300' : 
              'md:order-3 ring-2 ring-amber-600'
            }`}
          >
            <div className="mb-3">
              <RankingIcon position={index + 1} />
            </div>
            
            <div className="mb-3">
              <UserAvatar
                user={player}
                size="lg"
                className="mx-auto"
                highlight={index === 0}
              />
            </div>
            
            <h3 className="font-bold text-lg mb-1">{player.name}</h3>
            <p className="text-gray-600 text-sm mb-3">{player.nationality}</p>
            
            <div className="flex justify-center space-x-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">{t('quiz.leaderboard.points')}</p>
                <p className="font-bold text-lg">{player.quiz_points}</p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-500">{t('quiz.leaderboard.highScores')}</p>
                <p className="font-bold text-lg">{player.high_scores}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Lista completa */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('quiz.leaderboard.rank')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('quiz.leaderboard.player')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('quiz.leaderboard.points')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('quiz.leaderboard.quizzes')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('quiz.leaderboard.highScores')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaderboard.data.leaderboard.map((player, index) => (
                <tr 
                  key={player.id}
                  className={`${player.id === user?.id ? 'bg-blue-50' : ''} hover:bg-gray-50`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <RankingIcon position={index + 1} />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <UserAvatar user={player} size="sm" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {player.name}
                          {player.id === user?.id && (
                            <span className="ml-2 text-xs text-blue-600">{t('common.you')}</span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">{player.nationality}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-medium text-gray-900">{player.quiz_points}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm text-gray-500">{player.attempts_count}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm text-gray-500">{player.high_scores}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Posição do usuário (se não estiver na página atual) */}
      {user && !isUserInLeaderboard() && getUserRankingPosition() && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <UserAvatar user={user} size="sm" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {t('quiz.leaderboard.yourPosition', { position: getUserRankingPosition().position })}
              </p>
              <p className="text-sm text-gray-600">
                {t('quiz.leaderboard.points')}: {getUserRankingPosition().data.quiz_points}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Paginação */}
      {leaderboard.data.pagination && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(leaderboard.data.pagination.total / itemsPerPage)}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default Leaderboard;