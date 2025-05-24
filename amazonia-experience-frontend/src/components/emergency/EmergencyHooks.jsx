import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { 
  getEmergencyServices, 
  getServicesByType, 
  getNearbyServices, 
  getContactsByLanguage, 
  getPhrasesByLanguage 
} from '../redux/slices/emergencySlice';
import emergencyService from '../services/emergencyService';
import { useGeolocation } from './useGeolocation';
import errorService from '../services/errorService';

/**
 * Hook personalizado para gerenciamento de serviços de emergência
 * Fornece dados e funções para componentes de emergência
 * 
 * @returns {Object} Objeto com dados e funções relacionadas a emergência
 */
export const useEmergency = () => {
  const { i18n } = useTranslation();
  const dispatch = useDispatch();
  
  // Selecionar dados do estado Redux
  const services = useSelector(state => state.emergency.services.data || []);
  const servicesLoading = useSelector(state => state.emergency.services.isLoading);
  const servicesError = useSelector(state => state.emergency.services.error);
  
  const servicesByType = useSelector(state => state.emergency.servicesByType.data || []);
  const servicesByTypeLoading = useSelector(state => state.emergency.servicesByType.isLoading);
  
  const contacts = useSelector(state => state.emergency.contacts.data || {});
  const contactsLoading = useSelector(state => state.emergency.contacts.isLoading);
  
  const phrases = useSelector(state => state.emergency.phrases.data || {});
  const phrasesLoading = useSelector(state => state.emergency.phrases.isLoading);
  
  // Carregar serviços de emergência
  useEffect(() => {
    dispatch(getEmergencyServices());
  }, [dispatch]);
  
  // Carregar contatos e frases no idioma atual
  useEffect(() => {
    dispatch(getContactsByLanguage(i18n.language));
    dispatch(getPhrasesByLanguage(i18n.language));
  }, [dispatch, i18n.language]);
  
  /**
   * Carrega serviços de emergência por tipo
   * @param {string} type - Tipo de serviço 
   */
  const loadServicesByType = useCallback((type) => {
    if (type) {
      dispatch(getServicesByType({ type }));
    } else {
      dispatch(getEmergencyServices());
    }
  }, [dispatch]);
  
  /**
   * Formata o tipo de serviço para exibição
   * @param {string} type - Tipo de serviço
   * @returns {string} Tipo formatado
   */
  const formatServiceType = useCallback((type) => {
    const serviceTypes = {
      hospital: 'Hospital',
      pharmacy: 'Farmácia',
      police: 'Polícia',
      fire_department: 'Bombeiros',
      embassy: 'Embaixada',
      tourist_police: 'Polícia Turística'
    };
    
    return serviceTypes[type] || type;
  }, []);
  
  /**
   * Verifica se um serviço está aberto agora
   * @param {number} serviceId - ID do serviço
   * @returns {Promise<boolean>} Verdadeiro se o serviço estiver aberto
   */
  const isServiceOpen = useCallback(async (serviceId) => {
    try {
      return await emergencyService.isServiceOpen(serviceId);
    } catch (error) {
      errorService.logError({
        message: `Erro ao verificar status do serviço ${serviceId}`,
        error
      });
      return false;
    }
  }, []);
  
  return {
    services,
    servicesLoading,
    servicesError,
    servicesByType,
    servicesByTypeLoading,
    contacts,
    contactsLoading,
    phrases,
    phrasesLoading,
    loadServicesByType,
    formatServiceType,
    isServiceOpen
  };
};

/**
 * Hook para gerenciar emergências próximas baseadas na localização
 * 
 * @param {string} entityType - Tipo de entidade ('emergency', 'place', 'event')
 * @returns {Object} Objetos e funções para lidar com entidades próximas
 */
export const useNearbyEmergency = (entityType = 'emergency') => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [nearby, setNearby] = useState([]);
  const [error, setError] = useState(null);
  
  // Obter localização do usuário
  const { location, error: locationError, loading: locationLoading } = useGeolocation();
  const locationAvailable = !locationError && !locationLoading && location?.latitude && location?.longitude;
  
  /**
   * Busca serviços de emergência próximos
   * @param {Object} params - Parâmetros de busca
   */
  const fetchNearby = useCallback(async (params = {}) => {
    // Verificar se a localização está disponível
    if (!locationAvailable && !params.latitude && !params.longitude) {
      setError({ message: 'Localização não disponível' });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Configurar parâmetros de busca
      const searchParams = {
        latitude: params.latitude || location.latitude,
        longitude: params.longitude || location.longitude,
        radius: params.radius || 5,
        type: params.type || null,
        limit: params.limit || 10
      };
      
      // Buscar serviços próximos
      const response = await dispatch(getNearbyServices(searchParams)).unwrap();
      setNearby(response.services || []);
      setError(null);
    } catch (error) {
      setError(error);
      setNearby([]);
      errorService.logError({
        message: 'Erro ao buscar serviços de emergência próximos',
        error
      });
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, location, locationAvailable]);
  
  // Efeito para buscar serviços próximos quando a localização mudar
  useEffect(() => {
    if (locationAvailable) {
      fetchNearby();
    }
  }, [fetchNearby, locationAvailable]);
  
  /**
   * Formata distância para exibição
   * @param {number} distance - Distância em quilômetros
   * @returns {string} Distância formatada
   */
  const formatDistance = useCallback((distance) => {
    if (distance === undefined || distance === null) {
      return '';
    }
    
    if (typeof distance === 'string') {
      return distance;
    }
    
    // Formatar com base na distância
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    } else {
      return `${distance.toFixed(1)} km`;
    }
  }, []);
  
  return {
    nearby,
    isLoading,
    error,
    locationAvailable,
    fetchNearby,
    formatDistance
  };
};

/**
 * Hook para gerenciar contatos de emergência
 * 
 * @returns {Object} Dados e funções relacionadas a contatos de emergência
 */
export const useEmergencyContacts = () => {
  const { i18n } = useTranslation();
  const dispatch = useDispatch();
  
  // Selecionar contatos do estado Redux
  const contacts = useSelector(state => state.emergency.contacts.data || {});
  const contactsLoading = useSelector(state => state.emergency.contacts.isLoading);
  const contactsError = useSelector(state => state.emergency.contacts.error);
  const contactsLanguage = useSelector(state => state.emergency.contacts.language);
  
  // Carregar contatos no idioma atual se necessário
  useEffect(() => {
    if (contactsLanguage !== i18n.language) {
      dispatch(getContactsByLanguage(i18n.language));
    }
  }, [dispatch, i18n.language, contactsLanguage]);
  
  /**
   * Atualiza os contatos no idioma atual
   */
  const refreshContacts = useCallback(() => {
    dispatch(getContactsByLanguage(i18n.language));
  }, [dispatch, i18n.language]);
  
  return {
    contacts,
    contactsLoading,
    contactsError,
    refreshContacts
  };
};

/**
 * Hook para gerenciar frases úteis em emergências
 * 
 * @returns {Object} Dados e funções relacionadas a frases de emergência
 */
export const useEmergencyPhrases = () => {
  const { i18n } = useTranslation();
  const dispatch = useDispatch();
  
  // Selecionar frases do estado Redux
  const phrases = useSelector(state => state.emergency.phrases.data || {});
  const phrasesLoading = useSelector(state => state.emergency.phrases.isLoading);
  const phrasesError = useSelector(state => state.emergency.phrases.error);
  const phrasesLanguage = useSelector(state => state.emergency.phrases.language);
  
  // Estado local para busca
  const [searchTerm, setSearchTerm] = useState('');
  
  // Carregar frases no idioma atual se necessário
  useEffect(() => {
    if (phrasesLanguage !== i18n.language) {
      dispatch(getPhrasesByLanguage(i18n.language));
    }
  }, [dispatch, i18n.language, phrasesLanguage]);
  
  /**
   * Atualiza as frases no idioma atual
   */
  const refreshPhrases = useCallback(() => {
    dispatch(getPhrasesByLanguage(i18n.language));
  }, [dispatch, i18n.language]);
  
  /**
   * Filtra frases com base no termo de busca
   * @returns {Object} Categorias de frases filtradas
   */
  const filteredPhrases = useCallback(() => {
    if (!searchTerm) return phrases;
    
    // Filtrar frases por termo de busca
    const result = {};
    
    Object.entries(phrases).forEach(([category, categoryPhrases]) => {
      const filtered = categoryPhrases.filter(phrase => 
        phrase.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        phrase.translation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        phrase.pronunciation?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (filtered.length > 0) {
        result[category] = filtered;
      }
    });
    
    return result;
  }, [phrases, searchTerm]);
  
  return {
    phrases,
    phrasesLoading,
    phrasesError,
    searchTerm,
    setSearchTerm,
    filteredPhrases: filteredPhrases(),
    refreshPhrases
  };
};

export default {
  useEmergency,
  useNearbyEmergency,
  useEmergencyContacts,
  useEmergencyPhrases
};