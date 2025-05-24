import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { FilterIcon, ListBulletIcon, MapIcon } from '@heroicons/react/24/outline';

import { Container, PageHeader } from '../components/layout';
import { PlaceCard } from '../components/cards';
import { Button, Tabs } from '../components/common';
import { FilterSidebar, SearchInput } from '../components/filters';
import PlaceMap from '../components/places/PlaceMap';
import Pagination from '../components/common/Pagination';
import { api } from '../services/api';
import { useGeolocation } from '../hooks/useGeolocation';
import PlacesPlaceholder from '../components/placeholders/PlacesPlaceholder';

const viewModes = [
  { id: 'grid', label: 'Grid', icon: <ListBulletIcon className="h-5 w-5" /> },
  { id: 'map', label: 'Map', icon: <MapIcon className="h-5 w-5" /> },
];

const Places = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { coordinates } = useGeolocation();
  
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [pagination, setPagination] = useState({
    currentPage: parseInt(searchParams.get('page') || '1'),
    totalPages: 1,
    totalItems: 0,
  });

  // Filtros
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    type: searchParams.get('type') || '',
    partnerId: searchParams.get('partnerId') || '',
    wifiAvailable: searchParams.get('wifiAvailable') === 'true',
    nearby: searchParams.get('nearby') === 'true',
  });

  // Carregar locais com base nos filtros atuais
  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      try {
        const params = {
          page: pagination.currentPage,
          limit: 12,
          search: filters.search,
          type: filters.type,
          partner_id: filters.partnerId,
          wifi: filters.wifiAvailable,
        };

        let response;
        
        // Se o filtro "nearby" estiver ativo e tivermos coordenadas, buscar locais próximos
        if (filters.nearby && coordinates.latitude && coordinates.longitude) {
          response = await api.places.getNearbyPlaces(
            coordinates.latitude,
            coordinates.longitude,
            5,
            pagination.currentPage,
            12
          );
        } else {
          response = await api.places.getPlaces(params);
        }

        setPlaces(response.places || []);
        setPagination({
          currentPage: parseInt(response.pagination?.page || '1'),
          totalPages: Math.ceil(
            parseInt(response.pagination?.total || '0') / parseInt(response.pagination?.limit || '12')
          ),
          totalItems: parseInt(response.pagination?.total || '0'),
        });
      } catch (error) {
        console.error('Error fetching places:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [pagination.currentPage, filters, coordinates.latitude, coordinates.longitude]);

  // Atualizar searchParams quando os filtros mudarem
  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    
    if (pagination.currentPage > 1) {
      newSearchParams.set('page', pagination.currentPage.toString());
    }
    
    if (filters.search) newSearchParams.set('search', filters.search);
    if (filters.type) newSearchParams.set('type', filters.type);
    if (filters.partnerId) newSearchParams.set('partnerId', filters.partnerId);
    if (filters.wifiAvailable) newSearchParams.set('wifiAvailable', 'true');
    if (filters.nearby) newSearchParams.set('nearby', 'true');
    
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
      type: '',
      partnerId: '',
      wifiAvailable: false,
      nearby: false,
    });
    setPagination({ ...pagination, currentPage: 1 });
  };

  const toggleFilterSidebar = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title={t('places.title')} 
        description={t('places.description')}
      />
      
      <Container>
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="w-full md:w-auto">
            <SearchInput
              value={filters.search}
              onChange={handleSearch}
              placeholder={t('places.searchPlaceholder')}
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
            
            <Tabs
              tabs={viewModes}
              value={viewMode}
              onChange={setViewMode}
              small
            />
          </div>
        </div>
        
        <div className="flex flex-wrap md:flex-nowrap gap-6">
          {/* Sidebar de filtros */}
          <FilterSidebar 
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            type="places"
          />
          
          {/* Lista de locais */}
          <div className="w-full">
            {loading ? (
              <PlacesPlaceholder count={12} view={viewMode} />
            ) : (
              <>
                {places.length === 0 ? (
                  <div className="bg-white p-8 rounded-lg text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('places.noPlacesFound')}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {t('places.tryDifferentFilters')}
                    </p>
                    <Button onClick={handleClearFilters}>
                      {t('common.clearFilters')}
                    </Button>
                  </div>
                ) : (
                  <>
                    {viewMode === 'map' ? (
                      <div className="bg-white p-4 rounded-lg shadow">
                        <PlaceMap places={places} />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {places.map((place) => (
                          <PlaceCard key={place.id} place={place} />
                        ))}
                      </div>
                    )}
                    
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

export default Places;