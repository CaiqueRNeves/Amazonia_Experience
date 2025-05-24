import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Modal, Button, Alert, Spinner, Icon } from '../ui';
import { useCheckIn } from '../../hooks';
import { FaMapMarkerAlt, FaCoins } from 'react-icons/fa';

/**
 * Componente para realizar check-in em um local
 */
const PlaceCheckIn = ({ place, onCheckIn, onClose, isModal = true }) => {
  const { t } = useTranslation();
  const { 
    isLoading, 
    error, 
    success, 
    verificationCode, 
    locationAvailable,
    performCheckIn,
    validateProximity,
    currentLocation
  } = useCheckIn('place');
  
  const [status, setStatus] = useState('initial'); // initial, checking, success, error
  const [isNearby, setIsNearby] = useState(null);
  const [checkingLocation, setCheckingLocation] = useState(false);
  
  // Verifica se o usuário está próximo o suficiente do local
  useEffect(() => {
    if (place && locationAvailable && status === 'initial') {
      setCheckingLocation(true);
      const nearby = validateProximity(place.latitude, place.longitude, 0.5); // 500 metros
      setIsNearby(nearby);
      setCheckingLocation(false);
    }
  }, [place, locationAvailable, validateProximity, status]);
  
  // Atualiza o status com base no resultado do check-in
  useEffect(() => {
    if (success) {
      setStatus('success');
    } else if (error) {
      setStatus('error');
    }
  }, [success, error]);
  
  const handleCheckIn = async () => {
    setStatus('checking');
    const success = await performCheckIn(place.id);
    
    if (success) {
      if (onCheckIn) {
        onCheckIn(verificationCode);
      }
    }
  };
  
  const getDistanceText = () => {
    if (!locationAvailable || !currentLocation.latitude) {
      return t('places.checkIn.locationUnknown');
    }
    
    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      place.latitude,
      place.longitude
    );
    
    if (distance < 1) {
      return t('places.checkIn.distanceMeters', { distance: Math.round(distance * 1000) });
    } else {
      return t('places.checkIn.distanceKm', { distance: distance.toFixed(1) });
    }
  };
  
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distância em km
    
    return distance;
  };
  
  const renderContent = () => {
    if (status === 'success') {
      return (
        <div className="place-check-in__success">
          <div className="place-check-in__success-icon">
            <Icon name="check-circle" size={64} color="success" />
          </div>
          <h3>{t('places.checkIn.success')}</h3>
          <p>{t('places.checkIn.successMessage')}</p>
          {verificationCode && (
            <div className="place-check-in__verification">
              <p className="place-check-in__verification-label">
                {t('places.checkIn.verificationCode')}
              </p>
              <div className="place-check-in__verification-code">
                {verificationCode}
              </div>
            </div>
          )}
          <div className="place-check-in__amacoins">
            <FaCoins className="place-check-in__amacoins-icon" />
            <span>+{place.amacoins_value} {t('common.amacoins')}</span>
          </div>
          <Button variant="primary" onClick={onClose} className="mt-4">
            {t('common.close')}
          </Button>
        </div>
      );
    }
    
    if (status === 'error') {
      return (
        <div className="place-check-in__error">
          <div className="place-check-in__error-icon">
            <Icon name="alert-circle" size={64} color="danger" />
          </div>
          <h3>{t('places.checkIn.error')}</h3>
          <p>{error || t('places.checkIn.errorMessage')}</p>
          <Button variant="outline" onClick={() => setStatus('initial')} className="me-2">
            {t('places.checkIn.tryAgain')}
          </Button>
          <Button variant="primary" onClick={onClose}>
            {t('common.close')}
          </Button>
        </div>
      );
    }
    
    if (status === 'checking' || isLoading) {
      return (
        <div className="place-check-in__checking">
          <Spinner size="lg" />
          <h3>{t('places.checkIn.processing')}</h3>
          <p>{t('places.checkIn.wait')}</p>
        </div>
      );
    }
    
    return (
      <div className="place-check-in__initial">
        <h3>{t('places.checkIn.title')}</h3>
        
        <div className="place-check-in__place">
          <div className="place-check-in__place-icon">
            <FaMapMarkerAlt />
          </div>
          <div className="place-check-in__place-details">
            <h4>{place.name}</h4>
            <p>{place.address}</p>
          </div>
        </div>
        
        <div className="place-check-in__location-status">
          {checkingLocation ? (
            <div className="place-check-in__checking-location">
              <Spinner size="sm" />
              <span>{t('places.checkIn.checkingLocation')}</span>
            </div>
          ) : !locationAvailable ? (
            <Alert variant="warning">
              {t('places.checkIn.locationUnavailable')}
            </Alert>
          ) : isNearby === false ? (
            <Alert variant="warning">
              {t('places.checkIn.tooFar')}
              <div className="place-check-in__distance">
                {getDistanceText()}
              </div>
            </Alert>
          ) : (
            <Alert variant="success">
              {t('places.checkIn.locationVerified')}
              <div className="place-check-in__distance">
                {getDistanceText()}
              </div>
            </Alert>
          )}
        </div>
        
        <div className="place-check-in__amacoins-preview">
          <p>{t('places.checkIn.youWillEarn')}</p>
          <div className="place-check-in__amacoins">
            <FaCoins className="place-check-in__amacoins-icon" />
            <span>{place.amacoins_value} {t('common.amacoins')}</span>
          </div>
        </div>
        
        <div className="place-check-in__actions">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="me-2"
          >
            {t('common.cancel')}
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCheckIn}
            disabled={isLoading || (locationAvailable && isNearby === false)}
          >
            {t('places.checkIn.confirm')}
          </Button>
        </div>
      </div>
    );
  };
  
  if (isModal) {
    return (
      <Modal
        isOpen={true}
        onClose={onClose}
        title={status === 'initial' ? t('places.checkIn.title') : null}
        size={status === 'success' ? 'md' : 'lg'}
        showHeader={status === 'initial'}
        showFooter={false}
      >
        {renderContent()}
      </Modal>
    );
  }
  
  return (
    <div className="place-check-in">
      {renderContent()}
    </div>
  );
};

PlaceCheckIn.propTypes = {
  place: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
    amacoins_value: PropTypes.number.isRequired
  }).isRequired,
  onCheckIn: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  isModal: PropTypes.bool
};

export default PlaceCheckIn;