import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getNearbyPlaces } from '../../redux/slices/placesSlice';
import { Card, Loader, EmptyState, Button } from '../ui';
import PlaceCard from './PlaceCard';
import PlaceMap from './PlaceMap';

/**
 * Componente para exibir locais próximos a uma coordenada
 */
const NearbyPlaces = ({ latitude, longitude, radius = 5, limit = 3, excludeId = null }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'map'
  
  // Buscar locais próximos quando os parâmetros mudam
  useEffect(() => {
    const fetchNearbyPlaces = async () => {
      if (!latitude || !longitude) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const resultAction = await dispatch(getNearbyPlaces({
          latitude,
          longitude,
          radius,
          limit: limit + 1 // Buscar um a mais para caso precise excluir um
        }));
        
        if (getNearbyPlaces.fulfilled.match(resultAction)) {
          let places = resultAction.payload;
          
          // Filtrar o local atual, se necessário
          if (excludeId) {
            places = places.filter(place => place.id !== excludeId);
          }
          
          // Limitar ao número solicitado
          setNearbyPlaces(places.slice(0, limit));
        } else {
          setError(resultAction.error.message);
        }
      } catch (err) {
        setError(t('places.nearby.error'));
        console.error('Error fetching nearby places:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNearbyPlaces();
  }, [dispatch, latitude, longitude, radius, limit, excludeId, t]);
  
  if (isLoading) {
    return (
      <div className="nearby-places nearby-places--loading">
        <Loader size="md" message={t('places.nearby.loading')} />
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="nearby-places nearby-places--error">
        <div className="nearby-places__error">
          <h4>{t('places.nearby.errorTitle')}</h4>
          <p>{error}</p>
          <Button 
            variant="primary" 
            onClick={() => window.location.reload()}
          >
            {t('common.refresh')}
          </Button>
        </div>
      </Card>
    );
  }
  
  if (!nearbyPlaces || nearbyPlaces.length === 0) {
    return (
      <EmptyState
        icon="map-pin"
        title={t('places.nearby.noPlaces')}
        description={t('places.nearby.tryLargerRadius')}
      />
    );
  }
  
  return (
    <div className="nearby-places">
      <div className="nearby-places__header">
        <h3>{t('places.nearby.title')}</h3>
        <div className="nearby-places__view-toggle">
          <Button 
            variant={viewMode === 'list' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="nearby-places__toggle-button"
          >
            {t('places.listView')}
          </Button>
          <Button 
            variant={viewMode === 'map' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('map')}
            className="nearby-places__toggle-button"
          >
            {t('places.mapView')}
          </Button>
        </div>
      </div>
      
      {viewMode === 'list' ? (
        <div className="nearby-places__list">
          {nearbyPlaces.map(place => (
            <div key={place.id} className="nearby-places__item">
              <PlaceCard place={place} compact />
            </div>
          ))}
        </div>
      ) : (
        <div className="nearby-places__map">
          <Card className="nearby-places__map-container">
            <PlaceMap
              places={nearbyPlaces}
              center={{ lat: latitude, lng: longitude }}
              zoom={14}
              height="400px"
            />
          </Card>
        </div>
      )}
    </div>
  );
};

NearbyPlaces.propTypes = {
  latitude: PropTypes.number.isRequired,
  longitude: PropTypes.number.isRequired,
  radius: PropTypes.number,
  limit: PropTypes.number,
  excludeId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default NearbyPlaces;