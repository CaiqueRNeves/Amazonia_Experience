import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { WifiIcon, MapPinIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

import { fetchConnectivitySpots, setConnectivityFilters } from '../../redux/slices/connectivitySlice';
import ConnectivitySpotCard from './ConnectivitySpotCard';
import ConnectivityFilter from './ConnectivityFilter';
import ConnectivityMap from './ConnectivityMap';
import Loader from '../common/Loader';
import Pagination from '../common/Pagination';
import EmptyState from '../common/EmptyState';
import { useLocation } from '../../hooks/useLocation';

const ConnectivityList = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { spots, loading, error, filters, pagination } = useSelector((state) => state.connectivity);
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'map'
  const [showNearby, setShowNearby] = useState(false);
  const { userLocation, locationError, isLocating } = useLocation();

  useEffect(() => {
    // Carregar pontos de conectividade ao montar o componente
    dispatch(fetchConnectivitySpots(filters));
  }, [dispatch, filters]);

  // Carregar pontos próximos quando a localização do usuário estiver disponível
  useEffect(() => {
    if (showNearby && userLocation) {
      const { latitude, longitude } = userLocation;
      const nearbyFilters = {
        ...filters,
        latitude,
        longitude,
        radius: 5 // 5km
      };
      dispatch(fetchConnectivitySpots(nearbyFilters));
    }
  }, [showNearby, userLocation, dispatch, filters]);

  const handleFilterChange = (newFilters) => {
    dispatch(setConnectivityFilters(newFilters));
  };

  const handlePageChange = (newPage) => {
    dispatch(setConnectivityFilters({ ...filters, page: newPage }));
  };

  const toggleNearbySpots = () => {
    setShowNearby(!showNearby);
  };

  const refreshData = () => {
    dispatch(fetchConnectivitySpots(filters));
  };

  if (loading && spots.length === 0) {
    return <Loader />;
  }

  return (
    <div className="connectivity-container">
      <div className="connectivity-header">
        <h1>{t('connectivity.title')}</h1>
        <p>{t('connectivity.subtitle')}</p>
      </div>

      <ConnectivityFilter 
        filters={filters} 
        onFilterChange={handleFilterChange} 
      />

      <div className="controls-container">
        <div className="view-mode-toggle">
          <button 
            className={`btn btn-toggle ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <span>{t('connectivity.listView')}</span>
          </button>
          <button 
            className={`btn btn-toggle ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            <span>{t('connectivity.mapView')}</span>
          </button>
        </div>

        <div className="nearby-toggle">
          <button 
            className={`btn ${showNearby ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={toggleNearbySpots}
            disabled={isLocating}
          >
            <MapPinIcon className="icon" />
            {isLocating ? t('common.locating') : t('connectivity.showNearby')}
          </button>
          
          {locationError && (
            <p className="text-danger">{t('errors.location')}</p>
          )}
        </div>

        <button 
          className="btn btn-icon" 
          onClick={refreshData}
          disabled={loading}
          aria-label={t('common.refresh')}
        >
          <ArrowPathIcon className={`icon ${loading ? 'spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={refreshData} className="btn btn-primary">
            {t('common.tryAgain')}
          </button>
        </div>
      )}

      {viewMode === 'list' ? (
        <>
          {spots.length > 0 ? (
            <div className="connectivity-grid">
              {spots.map(spot => (
                <ConnectivitySpotCard key={spot.id} spot={spot} />
              ))}
            </div>
          ) : (
            <EmptyState 
              icon={<WifiIcon className="icon-large" />}
              message={t('connectivity.noSpots')}
              description={t('connectivity.noSpotsDescription')}
            />
          )}

          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      ) : (
        <ConnectivityMap 
          spots={spots} 
          userLocation={userLocation} 
          loading={loading}
        />
      )}
    </div>
  );
};

export default ConnectivityList;