import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import useGeolocation from './useGeolocation';

/**
 * Hook personalizado para gerenciar locais próximos ao usuário
 * Fornece funções para buscar locais, eventos ou serviços próximos
 * 
 * @param {string} type - Tipo de entidade a buscar ('places', 'events', 'emergency', 'connectivity')
 * @param {Object} options - Opções de configuração
 * @returns {Object} Funções e estados para gerenciar locais próximos
 */
const useNearby = (type = 'places', options = {}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  
  // Configurações padrão
  const config = {
    radius: options.radius || 5, // raio em km
    autoFetch: options.autoFetch !== undefined ? options.autoFetch : true,
    page: options.page || 1,
    limit: options.limit || 10,
    ...options
  };
  
  // Obter a localização atual do usuário
  const { location, error: locationError, loading: locationLoading } = useGeolocation({
    watchPosition: config.watchPosition
  });
  
  // Seleciona o estado correto do Redux com base no tipo
  const getNearbyState = () => {
    switch (type) {
      case 'places':
        return useSelector((state) => state.places.nearbyPlaces);
      case 'events':
        return useSelector((state) => state.events.nearbyEvents);
      case 'emergency':
        return useSelector((state) => state.emergency.nearbyServices);
      case 'connectivity':
        return useSelector((state) => state.connectivity.nearbySpots);
      default:
        return { data: [], isLoading: false, error: null };
    }
  };
  
  // Obtém o estado para o tipo selecionado
  const nearbyState = getNearbyState();
  
  // Importa as ações relevantes com base no tipo
  const getNearbyAction = () => {
    switch (type) {
      case 'places':
        return require('../redux/slices/placesSlice').getNearbyPlaces;
      case 'events':
        return require('../redux/slices/eventsSlice').getNearbyEvents;
      case 'emergency':
        return require('../redux/slices/emergencySlice').getNearbyServices;
      case 'connectivity':
        return require('../redux/slices/connectivitySlice').getNearbySpots;
      default:
        return null;
    }
  };
  
  // Obtém a ação correta
  const nearbyAction = getNearbyAction();
  
  // Função para buscar itens próximos
  const fetchNearby = useCallback(async (params = {}) => {
    if (!nearbyAction) return;
    
    // Não buscar se a localização não estiver disponível
    if (locationLoading || locationError || !location.latitude) {
      return false;
    }
    
    // Monta os parâmetros para a busca
    const searchParams = {
      latitude: params.latitude || location.latitude,
      longitude: params.longitude || location.longitude,
      radius: params.radius || config.radius,
      page: params.page || config.page,
      limit: params.limit || config.limit,
      ...params // Outros parâmetros específicos
    };
    
    try {
      const resultAction = await dispatch(nearbyAction(searchParams));
      return nearbyAction.fulfilled.match(resultAction);
    } catch (error) {
      console.error(`Error fetching nearby ${type}:`, error);
      return false;
    }
  }, [dispatch, nearbyAction, location, locationLoading, locationError, config]);
  
  // Função para calcular a distância entre o usuário e um ponto
  const calculateDistance = useCallback((lat, lng) => {
    if (!location.latitude || !location.longitude) return null;
    
    const R = 6371; // Raio da Terra em km
    const dLat = (lat - location.latitude) * Math.PI / 180;
    const dLng = (lng - location.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(location.latitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distância em km
    
    return distance;
  }, [location]);
  
  // Função para ordenar os itens por distância
  const sortByDistance = useCallback((items) => {
    if (!location.latitude || !location.longitude || !items) return items;
    
    // Cria uma cópia dos itens com a distância calculada
    const itemsWithDistance = items.map(item => ({
      ...item,
      distance: calculateDistance(item.latitude, item.longitude)
    }));
    
    // Ordena por distância
    return itemsWithDistance.sort((a, b) => a.distance - b.distance);
  }, [location, calculateDistance]);
  
  // Função para filtrar itens dentro de um raio específico
  const filterByRadius = useCallback((items, radius = config.radius) => {
    if (!location.latitude || !location.longitude || !items) return items;
    
    return items.filter(item => {
      const distance = calculateDistance(item.latitude, item.longitude);
      return distance <= radius;
    });
  }, [location, calculateDistance, config.radius]);
  
  // Formatar distância para exibição
  const formatDistance = useCallback((distance) => {
    if (distance === null || distance === undefined) return '';
    
    if (distance < 1) {
      // Se for menos de 1km, converter para metros
      return `${Math.round(distance * 1000)}m`;
    } else {
      // Caso contrário, mostrar em km com 1 casa decimal
      return `${distance.toFixed(1)}km`;
    }
  }, []);
  
  return {
    // Estados
    nearby: nearbyState.data,
    isLoading: nearbyState.isLoading || locationLoading,
    error: nearbyState.error || locationError,
    location,
    locationAvailable: !locationLoading && !locationError && Boolean(location.latitude),
    
    // Funções
    fetchNearby,
    calculateDistance,
    sortByDistance,
    filterByRadius,
    formatDistance
  };
};

export default useNearby;