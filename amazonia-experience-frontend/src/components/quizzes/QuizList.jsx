import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getQuizzes } from '../../redux/slices/quizzesSlice';

// Componentes
import QuizCard from './QuizCard';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';
import Pagination from '../common/Pagination';
import SearchInput from '../common/SearchInput';
import FilterSelect from '../common/FilterSelect';

// Estilos e ícones
import { Book, Award, Filter } from 'lucide-react';

/**
 * Componente que exibe a lista de quizzes disponíveis
 * Permite filtrar e pesquisar quizzes
 */
const QuizList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Estado da lista de quizzes do Redux
  const { quizList, isLoading, error } = useSelector((state) => state.quizzes);
  
  // Estados locais para filtros e paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [topic, setTopic] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  
  // Opções de dificuldade
  const difficultyOptions = [
    { value: '', label: t('common.all') },
    { value: 'easy', label: t('quiz.difficulty.easy') },
    { value: 'medium', label: t('quiz.difficulty.medium') },
    { value: 'hard', label: t('quiz.difficulty.hard') }
  ];
  
  // Opções de tópicos (podem vir da API em uma implementação real)
  const topicOptions = [
    { value: '', label: t('common.all') },
    { value: 'environment', label: t('quiz.topics.environment') },
    { value: 'biodiversity', label: t('quiz.topics.biodiversity') },
    { value: 'culture', label: t('quiz.topics.culture') },
    { value: 'sustainability', label: t('quiz.topics.sustainability') }
  ];
  
  // Carregar quizzes quando o componente for montado ou os filtros mudarem
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm,
      difficulty,
      topic
    };
    
    dispatch(getQuizzes(params));
  }, [dispatch, currentPage, itemsPerPage, searchTerm, difficulty, topic]);
  
  // Função para lidar com a mudança de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Rolar para o topo da página
    window.scrollTo(0, 0);
  };
  
  // Função para lidar com a pesquisa
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };
  
  // Função para lidar com a navegação para um quiz específico
  const handleQuizClick = (quizId) => {
    navigate(`/quizzes/${quizId}`);
  };
  
  // Limpar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setDifficulty('');
    setTopic('');
  };
  
  // Renderizar o loader durante o carregamento
  if (isLoading && !quizList.data) {
    return <Loader message={t('quiz.loading')} />;
  }
  
  // Renderizar mensagem de erro
  if (error) {
    return <ErrorMessage message={error} retryAction={() => dispatch(getQuizzes())} />;
  }
  
  // Renderizar estado vazio se não houver quizzes
  if (!quizList.data || quizList.data.quizzes.length === 0) {
    return (
      <EmptyState
        icon={<Book size={48} />}
        title={t('quiz.emptyState.title')}
        description={t('quiz.emptyState.description')}
        actionText={searchTerm || difficulty || topic ? t('common.clearFilters') : null}
        action={searchTerm || difficulty || topic ? clearFilters : null}
      />
    );
  }
  
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">{t('quiz.availableQuizzes')}</h1>
          <p className="text-gray-600">{t('quiz.testYourKnowledge')}</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => navigate('/quizzes/leaderboard')}
            className="flex items-center bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition duration-200"
          >
            <Award className="mr-2" size={20} />
            {t('quiz.viewLeaderboard')}
          </button>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <SearchInput
            value={searchTerm}
            onChange={handleSearch}
            placeholder={t('quiz.searchPlaceholder')}
            className="w-full md:w-1/3"
          />
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-2/3">
            <FilterSelect
              options={difficultyOptions}
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              label={t('quiz.difficulty.label')}
              className="w-full sm:w-1/2"
            />
            
            <FilterSelect
              options={topicOptions}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              label={t('quiz.topics.label')}
              className="w-full sm:w-1/2"
            />
          </div>
        </div>
        
        {(searchTerm || difficulty || topic) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
            >
              <Filter size={16} className="mr-1" />
              {t('common.clearFilters')}
            </button>
          </div>
        )}
      </div>
      
      {/* Lista de quizzes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quizList.data.quizzes.map((quiz) => (
          <QuizCard
            key={quiz.id}
            quiz={quiz}
            onClick={() => handleQuizClick(quiz.id)}
          />
        ))}
      </div>
      
      {/* Paginação */}
      {quizList.data.pagination && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(quizList.data.pagination.total / itemsPerPage)}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default QuizList;