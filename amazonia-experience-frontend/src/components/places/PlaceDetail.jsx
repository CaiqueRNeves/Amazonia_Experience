import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { 
  Card, 
  Button, 
  Badge, 
  Tabs, 
  TabPane, 
  ImageGallery,
  MapContainer,

  Skeleton, 
  Icon
} from '../ui';
import { formatDate, formatTime } from '../../utils/formatters';
import PlaceCheckIn from './PlaceCheckIn';
import PlaceMap from './PlaceMap';
import NearbyPlaces from './NearbyPlaces';
import { FaMapMarkerAlt, FaWifi, FaClock, FaPhone, FaGlobe, FaHeart, FaShare } from 'react-icons/fa';

/**
 * Componente para exibição detalhada de um local
 */
const PlaceDetail = ({ place, isLoading, error, onCheckIn, onFavorite, onShare }) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('info');
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  
  useEffect(() => {
    // Scroll to top when place changes
    window.scrollTo(0, 0);
  }, [place?.id]);

  if (isLoading) {
    return (
      <div className="place-detail place-detail--loading">
        <Skeleton height={300} className="place-detail__image-skeleton" />
        <Skeleton height={50} width={300} className="place-detail__title-skeleton" />
        <Skeleton count={3} height={20} className="place-detail__text-skeleton" />
        <Skeleton height={200} className="place-detail__map-skeleton" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="place-detail place-detail--error">
        <div className="place-detail__error">
          <Icon name="alert-triangle" size={48} />
          <h3>{t('places.loadError')}</h3>
          <p>{error}</p>
          <Button onClick={() => window.location.reload()}>
            {t('common.tryAgain')}
          </Button>
        </div>
      </Card>
    );
  }

  if (!place) return null;

  const handleCheckInClick = () => {
    if (isAuthenticated) {
      setShowCheckInModal(true);
    } else {
      // Redirect to login page
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
    }
  };

  const handleCheckIn = async () => {
    await onCheckIn();
    setShowCheckInModal(false);
  };

  const images = place.images || [{ url: place.image_url || '/images/place-placeholder.jpg', alt: place.name }];

  return (
    <div className="place-detail">
      <div className="place-detail__header">
        <ImageGallery 
          images={images} 
          className="place-detail__gallery"
        />
        
        <div className="place-detail__actions">
          <Button 
            variant="outline" 
            className="place-detail__action-button"
            onClick={() => onFavorite(place.id)}
          >
            <FaHeart /> {t('places.favorite')}
          </Button>
          
          <Button 
            variant="outline" 
            className="place-detail__action-button"
            onClick={() => onShare(place.id, place.name)}
          >
            <FaShare /> {t('places.share')}
          </Button>
          
          <Button 
            variant="primary" 
            className="place-detail__action-button place-detail__check-in-button"
            onClick={handleCheckInClick}
          >
            <FaMapMarkerAlt /> {t('places.checkIn')}
          </Button>
        </div>
      </div>
      
      <div className="place-detail__content">
        <div className="place-detail__title-section">
          <h1 className="place-detail__title">{place.name}</h1>
          
          <div className="place-detail__badges">
            <Badge variant="info">
              {t(`places.types.${place.type}`)}
            </Badge>
            
            {place.partner_id && (
              <Badge variant="primary" className="ms-2">
                {t('places.partnerPlace')}
              </Badge>
            )}
            
            {place.amacoins_value > 0 && (
              <Badge variant="warning" className="ms-2">
                {place.amacoins_value} {t('common.amacoins')}
              </Badge>
            )}
            
            {place.wifi_available && (
              <Badge variant="secondary" className="ms-2">
                <FaWifi /> {t('places.wifi')}
              </Badge>
            )}
          </div>
          
          <div className="place-detail__address">
            <FaMapMarkerAlt className="place-detail__address-icon" />
            <span>{place.address}</span>
          </div>
        </div>
        
        <Tabs active={activeTab} onChange={setActiveTab}>
          <TabPane id="info" title={t('places.information')}>
            <Card className="place-detail__info-card">
              <h3>{t('places.about')}</h3>
              <p className="place-detail__description">{place.description}</p>
              
              {place.opening_hours && (
                <div className="place-detail__info-section">
                  <h4>
                    <FaClock className="place-detail__info-icon" />
                    {t('places.openingHours')}
                  </h4>
                  <p className="place-detail__opening-hours">{place.opening_hours}</p>
                </div>
              )}
              
              {place.contact_phone && (
                <div className="place-detail__info-section">
                  <h4>
                    <FaPhone className="place-detail__info-icon" />
                    {t('places.contact')}
                  </h4>
                  <p className="place-detail__contact">
                    <a href={`tel:${place.contact_phone}`}>{place.contact_phone}</a>
                  </p>
                </div>
              )}
              
              {place.website && (
                <div className="place-detail__info-section">
                  <h4>
                    <FaGlobe className="place-detail__info-icon" />
                    {t('places.website')}
                  </h4>
                  <p className="place-detail__website">
                    <a 
                      href={place.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {place.website}
                    </a>
                  </p>
                </div>
              )}
              
              {place.additional_info && (
                <div className="place-detail__info-section">
                  <h4>{t('places.additionalInfo')}</h4>
                  <p className="place-detail__additional-info">
                    {place.additional_info}
                  </p>
                </div>
              )}
            </Card>
          </TabPane>
          
          <TabPane id="map" title={t('places.map')}>
            <Card className="place-detail__map-card">
              <PlaceMap
                place={place}
                zoom={15}
                interactive={true}
                className="place-detail__map"
              />
            </Card>
          </TabPane>
          
          <TabPane id="nearby" title={t('places.nearby')}>
            <NearbyPlaces 
              latitude={place.latitude} 
              longitude={place.longitude}
              excludeId={place.id}
              radius={2}
              limit={5}
            />
          </TabPane>
        </Tabs>
      </div>
      
      {showCheckInModal && (
        <PlaceCheckIn
          place={place}
          onCheckIn={handleCheckIn}
          onClose={() => setShowCheckInModal(false)}
        />
      )}
    </div>
  );
};

PlaceDetail.propTypes = {
  place: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    image_url: PropTypes.string,
    images: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string.isRequired,
        alt: PropTypes.string
      })
    ),
    type: PropTypes.string.isRequired,
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
    partner_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    amacoins_value: PropTypes.number,
    wifi_available: PropTypes.bool,
    opening_hours: PropTypes.string,
    contact_phone: PropTypes.string,
    website: PropTypes.string,
    additional_info: PropTypes.string
  }),
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  onCheckIn: PropTypes.func.isRequired,
  onFavorite: PropTypes.func,
  onShare: PropTypes.func
};

export default PlaceDetail;