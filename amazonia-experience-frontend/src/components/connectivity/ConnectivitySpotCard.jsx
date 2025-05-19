import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  WifiIcon, 
  MapPinIcon, 
  CheckBadgeIcon,
  ClockIcon,
  StarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

import { geoService } from '../../services';

const ConnectivitySpotCard = ({ spot, userLocation }) => {
  const { t } = useTranslation();
  
  // Renderizar ícones de intensidade do WiFi
  const renderWifiStrength = (speed) => {
    switch (speed) {
      case 'fast':
        return (
          <div className="wifi-strength high">
            <WifiIcon className="icon" />
            <WifiIcon className="icon" />
            <WifiIcon className="icon" />
            <span>{t('connectivity.speeds.fast')}</span>
          </div>
        );
      case 'medium':
        return (
          <div className="wifi-strength medium">
            <WifiIcon className="icon" />
            <WifiIcon className="icon" />
            <WifiIcon className="icon-empty" />
            <span>{t('connectivity.speeds.medium')}</span>
          </div>
        );
      case 'slow':
        return (
          <div className="wifi-strength low">
            <WifiIcon className="icon" />
            <WifiIcon className="icon-empty" />
            <WifiIcon className="icon-empty" />
            <span>{t('connectivity.speeds.slow')}</span>
          </div>
        );
      default:
        return (
          <div className="wifi-strength unknown">
            <WifiIcon className="icon" />
            <span>{t('connectivity.speeds.unknown')}</span>
          </div>
        );
    }
  };
  
  // Calcular distância se a localização do usuário estiver disponível
  const renderDistance = () => {
    if (!userLocation || !spot.latitude || !spot.longitude) return null;
    
    const distance = geoService.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      spot.latitude,
      spot.longitude
    );
    
    // Formatar distância: se menor que 1km, mostrar em metros
    let formattedDistance;
    if (distance < 1) {
      formattedDistance = `${Math.round(distance * 1000)}m`;
    } else {
      formattedDistance = `${distance.toFixed(1)}km`;
    }
    
    return (
      <div className="distance-info">
        <MapPinIcon className="icon" />
        <span>{formattedDistance}</span>
      </div>
    );
  };
  
  // Renderizar indicador de status de atividade
  const renderWorkingStatus = () => {
    if (spot.working_percentage === undefined) return null;
    
    const isWorking = spot.working_percentage > 80;
    
    return (
      <div className={`working-status ${isWorking ? 'active' : 'inactive'}`}>
        {isWorking ? (
          <CheckBadgeIcon className="icon" />
        ) : (
          <XMarkIcon className="icon" />
        )}
        <span>
          {isWorking 
            ? t('connectivity.activeWifi') 
            : t('connectivity.inactiveWifi')}
        </span>
      </div>
    );
  };
  
  // Renderizar avaliação do ponto de conectividade
  const renderRating = () => {
    if (!spot.avg_signal_strength) return null;
    
    // Converte avaliação de 0-10 para 0-5 estrelas
    const stars = Math.round(spot.avg_signal_strength / 2);
    
    return (
      <div className="spot-rating">
        {[...Array(5)].map((_, i) => (
          <StarIcon 
            key={i} 
            className={`icon ${i < stars ? 'filled' : 'empty'}`} 
          />
        ))}
        <span>({spot.avg_signal_strength.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className={`connectivity-spot-card ${spot.is_verified ? 'verified' : ''}`}>
      {spot.is_verified && (
        <div className="verified-badge">
          <CheckBadgeIcon className="icon" />
          <span>{t('connectivity.verified')}</span>
        </div>
      )}
      
      <div className="spot-header">
        <h3 className="spot-name">{spot.name}</h3>
        <div className="price-tag">
          {spot.is_free ? (
            <span className="free">{t('connectivity.free')}</span>
          ) : (
            <span className="paid">{t('connectivity.paid')}</span>
          )}
        </div>
      </div>
      
      <div className="spot-address">
        <MapPinIcon className="icon" />
        <span>{spot.address}</span>
      </div>
      
      <div className="spot-info">
        {renderWifiStrength(spot.wifi_speed)}
        
        {spot.opening_hours && (
          <div className="opening-hours">
            <ClockIcon className="icon" />
            <span>{spot.opening_hours}</span>
          </div>
        )}
        
        {renderWorkingStatus()}
        {renderRating()}
        {renderDistance()}
      </div>
      
      <div className="spot-actions">
        <Link 
          to={`/connectivity/${spot.id}`} 
          className="btn btn-primary"
        >
          {t('connectivity.viewDetails')}
        </Link>
        
        <a 
          href={`https://maps.google.com/maps?daddr=${spot.latitude},${spot.longitude}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-outline"
        >
          {t('connectivity.directions')}
        </a>
      </div>
    </div>
  );
};

export default ConnectivitySpotCard;