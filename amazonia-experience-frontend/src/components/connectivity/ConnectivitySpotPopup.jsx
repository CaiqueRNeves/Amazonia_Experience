import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  WifiIcon, 
  CheckBadgeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const ConnectivitySpotPopup = ({ spot }) => {
  const { t } = useTranslation();
  
  // Renderizar ícones de velocidade do WiFi de forma compacta
  const renderWifiSpeed = (speed) => {
    switch (speed) {
      case 'fast':
        return (
          <div className="wifi-speed-indicator fast">
            <WifiIcon className="icon" />
            <span>{t('connectivity.speeds.fast')}</span>
          </div>
        );
      case 'medium':
        return (
          <div className="wifi-speed-indicator medium">
            <WifiIcon className="icon" />
            <span>{t('connectivity.speeds.medium')}</span>
          </div>
        );
      case 'slow':
        return (
          <div className="wifi-speed-indicator slow">
            <WifiIcon className="icon" />
            <span>{t('connectivity.speeds.slow')}</span>
          </div>
        );
      default:
        return (
          <div className="wifi-speed-indicator unknown">
            <WifiIcon className="icon" />
            <span>{t('connectivity.speeds.unknown')}</span>
          </div>
        );
    }
  };

  return (
    <div className="connectivity-spot-popup">
      <div className="spot-popup-header">
        <h3 className="spot-name">{spot.name}</h3>
        
        {spot.is_verified && (
          <div className="verified-badge small">
            <CheckBadgeIcon className="icon-small" />
          </div>
        )}
      </div>
      
      <div className="spot-popup-content">
        <div className="spot-address-compact">
          <MapPinIcon className="icon-small" />
          <span>{spot.address}</span>
        </div>
        
        <div className="spot-details-compact">
          {renderWifiSpeed(spot.wifi_speed)}
          
          <div className="spot-price-tag">
            {spot.is_free ? (
              <span className="free">{t('connectivity.free')}</span>
            ) : (
              <span className="paid">{t('connectivity.paid')}</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="spot-popup-footer">
        <Link 
          to={`/connectivity/${spot.id}`} 
          className="btn btn-small btn-primary"
        >
          {t('connectivity.viewDetails')}
        </Link>
        
        <a 
          href={`https://maps.google.com/maps?daddr=${spot.latitude},${spot.longitude}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-small btn-secondary"
        >
          {t('connectivity.directions')}
        </a>
      </div>
    </div>
  );
};

ConnectivitySpotPopup.propTypes = {
  spot: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
    wifi_speed: PropTypes.string,
    is_free: PropTypes.bool,
    is_verified: PropTypes.bool
  }).isRequired
};

export default ConnectivitySpotPopup;