import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Pagination, 
  Loader, 
  EmptyState 
} from '../ui';
import PlaceCard from './PlaceCard';
import PlaceFilter from './PlaceFilter';
import { FaListUl, FaMapMarkedAlt } from 'react-icons/fa';

/**
 * Componente para listar locais
 */
const PlaceList = ({ 
  places, 
  isLoading, 
  error, 
  totalPages, 
  currentPage, 
  onPageChange, 
  onFilterChange,
  onViewModeChange,
  showMap = true
}) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [filters, setFilters] = useState({
    type: '',
    wifi: false,
    partner: false,
    search: '',
    sorting: 'distance'
  });
  const { location } = useSelector(state => state.geolocation);
  
  useEffect(() => {
    // Apply default sorting based on geolocation
    const defaultSorting = location.latitude ? 'distance' : 'name';
    setFilters(prev => ({ ...prev, sorting: defaultSorting }));
  }, [location.latitude]);
  
  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
    if (onFilterChange) {
      onFilterChange({ ...filters, ...newFilters });
    }
  };
  
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  if (error) {
    return (
      <Card className="place-list__error">
        <h3>{t('places.loadError')}</h3>
        <p>{error}</p>
        <Button onClick={() => window.location.reload()}>
          {t('common.tryAgain')}
        </Button>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="place-list__loading">
        <Loader message={t('places.loading')} />
      </div>
    );
  }

  if (!places || places.length === 0) {
    return (
      <EmptyState
        icon="map-pin"
        title={t('places.noPlacesFound')}
        description={t('places.tryAdjustingFilters')}
        action={
          <Button onClick={() => handleFilterChange({ type: '', wifi: false, partner: false, search: '' })}>
            {t('places.clearFilters')}
          </Button>
        }
      />
    );
  }

  return (
    <div className="place-list">
      <div className="place-list__header">
        <Container fluid>
          <Row className="align-items-center">
            <Col>
              <h2>{t('places.exploreTitle')}</h2>
              <p className="text-muted">
                {t('places.foundCount', { count: places.length })}
              </p>
            </Col>
            
            {showMap && (
              <Col xs="auto">
                <div className="place-list__view-toggle">
                  <Button 
                    variant={viewMode === 'list' ? 'primary' : 'outline'}
                    onClick={() => handleViewModeChange('list')}
                    className="place-list__view-toggle-button"
                  >
                    <FaListUl /> {t('places.listView')}
                  </Button>
                  <Button 
                    variant={viewMode === 'map' ? 'primary' : 'outline'}
                    onClick={() => handleViewModeChange('map')}
                    className="place-list__view-toggle-button"
                  >
                    <FaMapMarkedAlt /> {t('places.mapView')}
                  </Button>
                </div>
              </Col>
            )}
          </Row>
        </Container>
      </div>
      
      <div className="place-list__filters">
        <PlaceFilter 
          filters={filters} 
          onChange={handleFilterChange} 
        />
      </div>
      
      {viewMode === 'list' ? (
        <div className="place-list__grid">
          <Container fluid>
            <Row>
              {places.map(place => (
                <Col key={place.id} lg={4} md={6} sm={12} className="mb-4">
                  <PlaceCard place={place} />
                </Col>
              ))}
            </Row>
          </Container>
          
          {totalPages > 1 && (
            <div className="place-list__pagination">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                siblingCount={1}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="place-list__map-container">
          {/* Map component will be rendered by parent component when viewMode is 'map' */}
          <div className="place-list__map-placeholder">
            <p>{t('places.mapViewNotice')}</p>
          </div>
        </div>
      )}
    </div>
  );
};

PlaceList.propTypes = {
  places: PropTypes.arrayOf(PropTypes.object),
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  totalPages: PropTypes.number,
  currentPage: PropTypes.number,
  onPageChange: PropTypes.func,
  onFilterChange: PropTypes.func,
  onViewModeChange: PropTypes.func,
  showMap: PropTypes.bool
};

export default PlaceList;