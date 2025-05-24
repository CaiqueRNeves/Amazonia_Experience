import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { geo } from '../utils';

// Criação do contexto
export const LocationContext = createContext(null);

/**
 * Provedor de localização da aplicação
 * Gerencia acesso à geolocalização e permissões relacionadas
 */
export const LocationProvider = ({ children }) => {
  const { t } = useTranslation();
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [isWatching, setIsWatching] = useState(false);
  const [watchId, setWatchId] = useState(null);

  // Solicita permissão de localização ao iniciar
  useEffect(() => {
    checkLocationPermission();
  }, []);

  // Limpa recursos ao desmontar
  useEffect(() => {
    return () => {
      if (watchId) {
        stopWatchingLocation();
      }
    };
  }, [watchId]);

  /**
   * Verifica se o navegador tem permissão para acessar a localização
   */
  const checkLocationPermission = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError(t('location.notSupported'));
      setHasPermission(false);
      return;
    }

    // Verifica o estado da permissão se disponível
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((result) => {
          if (result.state === 'granted') {
            setHasPermission(true);
          } else if (result.state === 'prompt') {
            setHasPermission(null);
          } else {
            setHasPermission(false);
          }

          // Monitora mudanças no estado da permissão
          result.addEventListener('change', () => {
            if (result.state === 'granted') {
              setHasPermission(true);
            } else {
              setHasPermission(false);
              stopWatchingLocation();
            }
          });
        })
        .catch((error) => {
          console.error('Erro ao verificar permissão de localização:', error);
        });
    }
  }, [t]);

  /**
   * Solicita a localização atual do usuário
   * @param {Object} options - Opções de geolocalização
   * @returns {Promise<Object>} Localização (latitude, longitude)
   */
  const getCurrentLocation = useCallback(async (options = {}) => {
    if (!navigator.geolocation) {
      const error = new Error(t('location.notSupported'));
      setLocationError(error.message);
      throw error;
    }

    setIsLoading(true);
    setLocationError(null);

    try {
      // Configura opções de geolocalização
      const geoOptions = {
        enableHighAccuracy: options.highAccuracy !== false,
        timeout: options.timeout || 10000,
        maximumAge: options.maximumAge || 0
      };

      // Promisifica a API de geolocalização
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, geoOptions);
      });

      const newLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      };

      setLocation(newLocation);
      setHasPermission(true);
      setIsLoading(false);

      return newLocation;
    } catch (error) {
      // Trata diferentes códigos de erro
      let errorMessage;

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = t('location.permissionDenied');
          setHasPermission(false);
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = t('location.positionUnavailable');
          break;
        case error.TIMEOUT:
          errorMessage = t('location.timeout');
          break;
        default:
          errorMessage = t('location.unknown');
      }

      console.error('Erro de geolocalização:', errorMessage);
      setLocationError(errorMessage);
      setIsLoading(false);
      
      // Exibe mensagem de erro se a opção silenciar não estiver ativada
      if (!options.silent) {
        toast.error(errorMessage);
      }

      throw new Error(errorMessage);
    }
  }, [t]);

  /**
   * Inicia o monitoramento contínuo da localização
   * @param {Object} options - Opções de geolocalização
   * @returns {boolean} Sucesso ao iniciar monitoramento
   */
  const startWatchingLocation = useCallback((options = {}) => {
    if (!navigator.geolocation) {
      setLocationError(t('location.notSupported'));
      return false;
    }

    // Para monitoramento anterior se existir
    if (watchId) {
      stopWatchingLocation();
    }

    setIsLoading(true);
    setLocationError(null);

    try {
      // Configura opções de geolocalização
      const geoOptions = {
        enableHighAccuracy: options.highAccuracy !== false,
        timeout: options.timeout || 10000,
        maximumAge: options.maximumAge || 0
      };

      // Inicia o monitoramento
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };

          setLocation(newLocation);
          setHasPermission(true);
          setIsLoading(false);
          setIsWatching(true);

          // Callback opcional de sucesso
          if (options.onSuccess) {
            options.onSuccess(newLocation);
          }
        },
        (error) => {
          // Trata diferentes códigos de erro
          let errorMessage;

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = t('location.permissionDenied');
              setHasPermission(false);
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = t('location.positionUnavailable');
              break;
            case error.TIMEOUT:
              errorMessage = t('location.timeout');
              break;
            default:
              errorMessage = t('location.unknown');
          }

          console.error('Erro ao monitorar localização:', errorMessage);
          setLocationError(errorMessage);
          setIsLoading(false);

          // Callback opcional de erro
          if (options.onError) {
            options.onError(errorMessage);
          }

          // Exibe mensagem de erro se a opção silenciar não estiver ativada
          if (!options.silent) {
            toast.error(errorMessage);
          }
        },
        geoOptions
      );

      setWatchId(id);
      return true;
    } catch (error) {
      console.error('Erro ao iniciar monitoramento de localização:', error);
      setLocationError(error.message);
      setIsLoading(false);
      return false;
    }
  }, [t, watchId]);

  /**
   * Para o monitoramento da localização
   */
  const stopWatchingLocation = useCallback(() => {
    if (watchId && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setIsWatching(false);
    }
  }, [watchId]);

  /**
   * Calcula a distância entre a localização atual e um ponto
   * @param {Object} point - Ponto para calcular distância {latitude, longitude}
   * @param {string} unit - Unidade de medida ('K' para km, 'M' para milhas)
   * @returns {number} Distância ou null se não houver localização
   */
  const getDistanceTo = useCallback((point, unit = 'K') => {
    if (!location || !point) return null;

    return geo.calculateDistance(
      location.latitude,
      location.longitude,
      point.latitude,
      point.longitude,
      unit
    );
  }, [location]);

  /**
   * Verifica se um ponto está próximo da localização atual
   * @param {Object} point - Ponto para verificar {latitude, longitude}
   * @param {number} radiusKm - Raio em quilômetros
   * @returns {boolean} True se estiver dentro do raio
   */
  const isNearby = useCallback((point, radiusKm = 0.5) => {
    if (!location || !point) return false;

    return geo.isPointWithinRadius(
      location,
      point,
      radiusKm
    );
  }, [location]);

  /**
   * Solicita permissão de localização e obtém a posição atual
   * @returns {Promise<Object>} Localização atual
   */
  const requestLocationPermission = useCallback(async () => {
    if (hasPermission === false) {
      // Se a permissão foi negada, instrui o usuário a habilitar
      toast.info(t('location.enableInstructions'), {
        autoClose: false
      });
      return null;
    }

    try {
      const currentLocation = await getCurrentLocation();
      return currentLocation;
    } catch (error) {
      return null;
    }
  }, [hasPermission, getCurrentLocation, t]);

  // Valores expostos pelo contexto
  const value = {
    location,
    locationError,
    isLoading,
    hasPermission,
    isWatching,
    getCurrentLocation,
    startWatchingLocation,
    stopWatchingLocation,
    getDistanceTo,
    isNearby,
    requestLocationPermission
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

// Hook personalizado para usar o contexto de localização
export const useLocation = () => {
  const context = React.useContext(LocationContext);
  
  if (!context) {
    throw new Error('useLocation deve ser usado dentro de um LocationProvider');
  }
  
  return context;
};

export default { LocationContext, LocationProvider, useLocation };