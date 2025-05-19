import { useState, useEffect } from 'react';

/**
 * Hook personalizado para gerenciar geolocalização
 * Fornece a localização atual do usuário e estados relacionados
 * 
 * @param {Object} options - Opções para a geolocalização
 * @param {boolean} options.enableHighAccuracy - Se deve usar alta precisão
 * @param {number} options.timeout - Tempo limite em ms
 * @param {number} options.maximumAge - Idade máxima de uma posição em cache em ms
 * @param {boolean} options.watchPosition - Se deve observar mudanças de posição
 * @returns {Object} Objeto com localização e estados relacionados
 */
const useGeolocation = ({
  enableHighAccuracy = true,
  timeout = 5000,
  maximumAge = 0,
  watchPosition = false,
} = {}) => {
  // Estado para armazenar a localização e status
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Função de sucesso - chamada quando a geolocalização é obtida com sucesso
    const handleSuccess = (position) => {
      const { coords } = position;
      setLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        altitude: coords.altitude,
        altitudeAccuracy: coords.altitudeAccuracy,
        heading: coords.heading,
        speed: coords.speed,
      });
      setError(null);
      setLoading(false);
    };

    // Função de erro - chamada quando ocorre um erro ao obter a geolocalização
    const handleError = (err) => {
      setError(err.message);
      setLoading(false);
    };

    // Verificar se a geolocalização é suportada pelo navegador
    if (!navigator.geolocation) {
      setError('Geolocalização não é suportada pelo seu navegador');
      setLoading(false);
      return;
    }

    const geoOptions = {
      enableHighAccuracy,
      timeout,
      maximumAge,
    };

    // ID para limpar o watch se necessário
    let watchId;

    if (watchPosition) {
      // Observar mudanças de posição
      watchId = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        geoOptions
      );
    } else {
      // Obter a posição apenas uma vez
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        geoOptions
      );
    }

    // Limpar o observador quando o componente for desmontado
    return () => {
      if (watchPosition && watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [enableHighAccuracy, timeout, maximumAge, watchPosition]);

  return { location, error, loading };
};

export default useGeolocation;