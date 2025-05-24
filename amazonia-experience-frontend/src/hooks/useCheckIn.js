import { useCallback, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import useGeolocation from './useGeolocation';

/**
 * Hook personalizado para check-ins em eventos e lugares
 * Gerencia processo de check-in, validação de localização e feedback
 * 
 * @param {string} type - Tipo de check-in ('event' ou 'place')
 * @returns {Object} Funções e estados para gerenciar check-ins
 */
const useCheckIn = (type = 'event') => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  // Obtém a localização atual do usuário
  const { location, error: locationError, loading: locationLoading } = useGeolocation();
  
  // Estado para armazenar o código de verificação após check-in
  const [verificationCode, setVerificationCode] = useState(null);
  
  // Obtém estados do Redux baseado no tipo de check-in
  const checkInState = useSelector((state) => 
    type === 'event' ? state.events.checkIn : state.places.checkIn
  );
  
  // Obtém as ações relevantes com base no tipo
  const { checkInEvent, resetCheckIn: resetEventCheckIn } = require('../redux/slices/eventsSlice');
  const { checkInPlace, resetCheckIn: resetPlaceCheckIn } = require('../redux/slices/placesSlice');
  
  // Determina a ação de check-in e reset com base no tipo
  const checkInAction = type === 'event' ? checkInEvent : checkInPlace;
  const resetCheckInAction = type === 'event' ? resetEventCheckIn : resetPlaceCheckIn;
  
  // Limpa o estado de check-in quando o componente é desmontado
  useEffect(() => {
    return () => {
      dispatch(resetCheckInAction());
    };
  }, [dispatch, resetCheckInAction]);
  
  // Atualiza o código de verificação quando o check-in é bem-sucedido
  useEffect(() => {
    if (checkInState.success && checkInState.data?.verification_code) {
      setVerificationCode(checkInState.data.verification_code);
    }
  }, [checkInState.success, checkInState.data]);
  
  // Função para validar a proximidade do usuário ao local/evento
  const validateProximity = useCallback((targetLat, targetLng, maxDistance = 0.5) => {
    if (locationLoading || locationError) return false;
    
    if (!location.latitude || !location.longitude) {
      toast.error(t('checkIn.locationNotAvailable'));
      return false;
    }
    
    // Calcula a distância entre a localização do usuário e o destino
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      targetLat,
      targetLng
    );
    
    // Verifica se está dentro da distância máxima (em km)
    if (distance > maxDistance) {
      toast.error(t('checkIn.tooFarAway', { distance: distance.toFixed(2) }));
      return false;
    }
    
    return true;
  }, [location, locationLoading, locationError, t]);
  
  // Função para realizar o check-in
  const performCheckIn = useCallback(async (id, requireProximity = true, coordinates = null) => {
    let canCheckIn = true;
    
    // Se a proximidade é necessária e coordenadas foram fornecidas, valida a proximidade
    if (requireProximity && coordinates) {
      canCheckIn = validateProximity(coordinates.latitude, coordinates.longitude);
    }
    
    if (!canCheckIn) return false;
    
    try {
      const resultAction = await dispatch(checkInAction(id));
      
      if (checkInAction.fulfilled.match(resultAction)) {
        toast.success(t(`checkIn.${type}Success`));
        return true;
      } else {
        toast.error(resultAction.error.message || t(`checkIn.${type}Error`));
        return false;
      }
    } catch (error) {
      toast.error(t(`checkIn.${type}Error`));
      console.error(`Check-in error (${type}):`, error);
      return false;
    }
  }, [dispatch, checkInAction, validateProximity, t, type]);
  
  // Função para calcular a distância entre duas coordenadas (fórmula de Haversine)
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
  
  // Função para resetar o estado do check-in
  const resetCheckIn = useCallback(() => {
    dispatch(resetCheckInAction());
    setVerificationCode(null);
  }, [dispatch, resetCheckInAction]);
  
  return {
    // Estados
    isLoading: checkInState.isLoading,
    error: checkInState.error,
    success: checkInState.success,
    verificationCode,
    locationAvailable: !locationLoading && !locationError && Boolean(location.latitude),
    locationError,
    locationLoading,
    currentLocation: location,
    
    // Funções
    performCheckIn,
    validateProximity,
    resetCheckIn,
    calculateDistance
  };
};

export default useCheckIn;