import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { FilterIcon } from '@heroicons/react/24/outline';

import { Container, PageHeader } from '../components/layout';
import { RewardCard } from '../components/cards';
import { Button, Tabs } from '../components/common';
import { FilterSidebar, SearchInput } from '../components/filters';
import Pagination from '../components/common/Pagination';
import { api } from '../services/api';
import RewardsPlaceholder from '../components/placeholders/RewardsPlaceholder';

const categories = [
  { id: 'all', label: 'rewards.all' },
  { id: 'physical', label: 'rewards.physical' },
  { id: 'digital', label: 'rewards.digital' },
];

const Rewards = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [pagination, setPagination] = useState({
    currentPage: parseInt(searchParams.get('page') || '1'),
    totalPages: 1,
    totalItems: 0,
  });

  // Filtros
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    rewardType: searchParams.get('rewardType') || '',
    partnerId: searchParams.get('partnerId') || '',
    maxCost: searchParams.get('maxCost') || '',
    inStock: searchParams.get('inStock') === 'true',
  });

  // Carregar recompensas com base nos filtros atuais
  useEffect(() => {
    const fetchRewards = async () => {
      setLoading(true);
      try {
        const params = {
          page: pagination.currentPage,
          limit: 12,
          search: filters.search,
          reward_type: filters.rewardType,
          partner_id: filters.partnerId,
          max_cost: filters.maxCost,
          in_stock: filters.inStock,
        };

        let response;
        
        // Buscar recompensas com base na categoria ativa
        if (activeCategory === 'physical') {
          response = await api.rewards.getPhysicalRewards(params);
        } else if (activeCategory === 'digital') {
          response = await api.rewards.getDigitalRewards(params);
        } else {
          response = await api.rewards.getRewards(params);
        }

        setRewards(response.rewards || []);
        setPagination({
          currentPage: parseInt(response.pagination?.page || '1'),
          totalPages: Math.ceil(
            parseInt(response.pagination?.total || '0') / parseInt(response.pagination?.limit || '12')
          ),
          totalItems: parseInt(response.pagination?.total || '0'),
        });
      } catch (error) {
        console.error('Error fetching rewards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, [pagination.currentPage, filters, activeCategory]);

  // Atualizar searchParams quando os filtros mudarem
  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    
    if (pagination.currentPage > 1) {
      newSearchParams.set('page', pagination.currentPage.toString());
    }
    
    if (filters.search) newSearchParams.set('search', filters.search);
    if (filters.rewardType) newSearchParams.set('rewardType', filters.rewardType);
    if (filters.partnerId) newSearchParams.set('partnerId', filters.partnerId);
    if (filters.maxCost) newSearchParams.set('maxCost', filters.maxCost);
    if (filters.inStock) newSearchParams.set('inStock', 'true');
    newSearchParams.set('category', activeCategory);
    
    setSearchParams(newSearchParams);
  }, [filters, pagination.currentPage, activeCategory, setSearchParams]);

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
      rewardType: '',
      partnerId: '',
      maxCost: '',
      inStock: false,
    });
    setPagination({ ...pagination, currentPage: 1 });
  };

  const toggleFilterSidebar = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title={t('rewards.title')} 
        description={t('rewards.description')}
      />
      
      <Container>
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="w-full md:w-auto">
            <SearchInput
              value={filters.search}
              onChange={handleSearch}
              placeholder={t('rewards.searchPlaceholder')}
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
        
        {/* Tabs de categorias */}
        <div className="mb-6">
          <Tabs
            tabs={categories.map(cat => ({ ...cat, label: t(cat.label) }))}
            value={activeCategory}
            onChange={setActiveCategory}
          />
        </div>
        
        <div className="flex flex-wrap md:flex-nowrap gap-6">
          {/* Sidebar de filtros */}
          <FilterSidebar 
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            type="rewards"
          />
          
          {/* Lista de recompensas */}
          <div className="w-full">
            {loading ? (
              <RewardsPlaceholder count={12} />
            ) : (
              <>
                {rewards.length === 0 ? (
                  <div className="bg-white p-8 rounded-lg text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('rewards.noRewardsFound')}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {t('rewards.tryDifferentFilters')}
                    </p>
                    <Button onClick={handleClearFilters}>
                      {t('common.clearFilters')}
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {rewards.map((reward) => (
                        <RewardCard key={reward.id} reward={reward} />
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
      </Container>
    </div>
  );
};

export default Rewards;