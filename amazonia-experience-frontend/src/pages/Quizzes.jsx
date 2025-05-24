import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { FilterIcon } from '@heroicons/react/24/outline';

import { Container, PageHeader, Section } from '../components/layout';
import { QuizCard } from '../components/cards';
import { Button } from '../components/common';
import { FilterSidebar, SearchInput } from '../components/filters';
import Pagination from '../components/common/Pagination';
import { api } from '../services/api';
import QuizzesPlaceholder from '../components/placeholders/QuizzesPlaceholder';
import QuizLeaderboard from '../components/quizzes/QuizLeaderboard';

const Quizzes = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [quizzes, setQuizzes] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: parseInt(searchParams.get('page') || '1'),
    totalPages: 1,
    totalItems: 0,
  });

  // Filtros
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    difficulty: searchParams.get('difficulty') || '',
    topic: searchParams.get('topic') || '',
  });

  // Carregar quizzes com base nos filtros atuais
  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const params = {
          page: pagination.currentPage,
          limit: 12,
          search: filters.search,
          difficulty: filters.difficulty,
          topic: filters.topic,
        };

        const response = await api.quizzes.getQuizzes(params);

        setQuizzes(response.quizzes || []);
        setPagination({
          currentPage: parseInt(response.pagination?.page || '1'),
          totalPages: Math.ceil(
            parseInt(response.pagination?.total || '0') / parseInt(response.pagination?.limit || '12')
          ),
          totalItems: parseInt(response.pagination?.total || '0'),
        });
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [pagination.currentPage, filters]);

  // Carregar leaderboard
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoadingLeaderboard(true);
      try {
        const response = await api.quizzes.getLeaderboard(1, 5);
        setLeaderboard(response.leaderboard || []);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoadingLeaderboard(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Atualizar searchParams quando os filtros mudarem
  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    
    if (pagination.currentPage > 1) {
      newSearchParams.set('page', pagination.currentPage.toString());
    }
    
    if (filters.search) newSearchParams.set('search', filters.search);
    if (filters.difficulty) newSearchParams.set('difficulty', filters.difficulty);
    if (filters.topic) newSearchParams.set('topic', filters.topic);
    
    setSearchParams(newSearchParams);
  }, [filters, pagination.currentPage, setSearchParams]);

  const handlePageChange = (page) => {
    setPagination({ ...pagination, currentPage: page });
    window.scrollTo(0, 0);
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handleSearch = (value) => {
    handleFilterChange({ search: value });
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      difficulty: '',
      topic: '',
    });
    setPagination({ ...pagination, currentPage: 1 });
  };

  const toggleFilterSidebar = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title={t('quizzes.title')} 
        description={t('quizzes.description')}
      />
      
      <Container>
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="w-full md:w-auto">
            <SearchInput
              value={filters.search}
              onChange={handleSearch}
              placeholder={t('quizzes.searchPlaceholder')}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={toggleFilterSidebar}
              className="flex items-center"
            >
              <FilterIcon className="h-5 w-5 mr-2" />
              {t('common.filter')}
            </Button>
          </div>
        </div>
        
        {/* Layout com grid e leaderboard na sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Lista de quizzes */}
          <div className="flex-1">
            <div className="flex flex-wrap md:flex-nowrap gap-6">
              {/* Sidebar de filtros */}
              <FilterSidebar 
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                type="quizzes"
              />
              
              {/* Grid de quizzes */}
              <div className="w-full">
                {loading ? (
                  <QuizzesPlaceholder count={12} />
                ) : (
                  <>
                    {quizzes.length === 0 ? (
                      <div className="bg-white p-8 rounded-lg text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {t('quizzes.noQuizzesFound')}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {t('quizzes.tryDifferentFilters')}
                        </p>
                        <Button onClick={handleClearFilters}>
                          {t('common.clearFilters')}
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {quizzes.map((quiz) => (
                            <QuizCard key={quiz.id} quiz={quiz} />
                          ))}
                        </div>
                        
                        {pagination.totalPages > 1 && (
                          <div className="mt-8">
                            <Pagination
                              currentPage={pagination.currentPage}
                              totalPages={pagination.totalPages}
                              onPageChange={handlePageChange}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Sidebar com leaderboard */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="bg-white rounded-lg shadow overflow-hidden sticky top-24">
              <QuizLeaderboard 
                leaders={leaderboard} 
                loading={loadingLeaderboard} 
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Quizzes;