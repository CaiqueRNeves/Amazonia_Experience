import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Badge, Button, Image } from '../ui';
import { FaMapMarkerAlt, FaWifi, FaStar } from 'react-icons/fa';

/**
 * Componente de cartão para exibir um local na listagem
 */
const PlaceCard = ({ place, compact = false }) => {
  const { t } = useTranslation();

  if (!place) return null;

  return (
    <Card className={`place-card ${compact ? 'place-card--compact' : ''}`}>
      <div className="place-card__image-container">
        <Image
          src={place.image_url || '/images/place-placeholder.jpg'}
          alt={place.name}
          className="place-card__image"
        />
        {place.partner_id && (
          <Badge variant="primary" className="place-card__partner-badge">
            {t('places.partnerPlace')}
          </Badge>
        )}
        {place.amacoins_value > 0 && (
          <Badge variant="warning" className="place-card__amacoins-badge">
            {place.amacoins_value} {t('common.amacoins')}
          </Badge>
        )}
      </div>

      <div className="place-card__content">
        <h3 className="place-card__title">{place.name}</h3>
        
        <div className="place-card__type">
          <Badge variant="info">
            {t(`places.types.${place.type}`)}
          </Badge>
          {place.wifi_available && (
            <Badge variant="secondary" className="ms-2">
              <FaWifi /> {t('places.wifi')}
            </Badge>
          )}
        </div>
        
        {!compact && (
          <p className="place-card__description">
            {place.description.length > 120
              ? `${place.description.substring(0, 120)}...`
              : place.description}
          </p>
        )}
        
        <div className="place-card__location">
          <FaMapMarkerAlt className="place-card__location-icon" />
          <span className="place-card__address">
            {place.address}
          </span>
        </div>
        
        {place.distance && (
          <div className="place-card__distance">
            <span className="place-card__distance-value">
              {place.distance < 1
                ? `${Math.round(place.distance * 1000)}m`
                : `${place.distance.toFixed(1)}km`}
            </span>
            <span className="place-card__distance-label">
              {t('places.away')}
            </span>
          </div>
        )}
        
        {place.rating && (
          <div className="place-card__rating">
            <FaStar className="place-card__rating-icon" />
            <span className="place-card__rating-value">
              {place.rating.toFixed(1)}
            </span>
            <span className="place-card__rating-count">
              ({place.rating_count})
            </span>
          </div>
        )}
      </div>

      <div className="place-card__footer">
        <Link to={`/places/${place.id}`} className="place-card__link">
          <Button variant="outline" className="place-card__button">
            {t('places.viewDetails')}
          </Button>
        </Link>
        
        {place.distance && place.distance < 0.5 && (
          <Link to={`/places/${place.id}/checkin`} className="place-card__checkin-link">
            <Button variant="primary" className="place-card__checkin-button">
              {t('places.checkIn')}
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
};

PlaceCard.propTypes = {
  place: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    address: PropTypes.string.isRequired,
    image_url: PropTypes.string,
    type: PropTypes.string.isRequired,
    partner_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    amacoins_value: PropTypes.number,
    wifi_available: PropTypes.bool,
    rating: PropTypes.number,
    rating_count: PropTypes.number,
    distance: PropTypes.number,
    latitude: PropTypes.number,
    longitude: PropTypes.number
  }).isRequired,
  compact: PropTypes.bool
};

export default PlaceCard;