import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  getEmergencyServices, 
  getContactsByLanguage, 
  getPhrasesByLanguage,
  getNearbyServices,
  setSelectedService,
  clearSelectedService,
  setFilters,
  clearFilters
} from '../redux/slices/emergencySlice';
import { openModal } from '../redux/slices/uiSlice';
import { useGeolocation } from '../hooks';
import emergencyService from '../services/emergencyService';
import analyticsService from '../services/analyticsService';

// Criação do contexto
const EmergencyContext = createContext(null);

/**
 * Provedor de contexto para a seção de emergência
 * Centraliza estado e funções relacionadas a serviços de emergência
 */
export const EmergencyProvider = ({ children }) => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Hooks para obter localização e dados da loja Redux
  const { location: userLocation, error: locationError, loading: locationLoading } = useGeolocation();
  
  // Estados locais
  const [activeTab, setActiveTab] = useState('nearby');
  const [serviceType, setServiceType] = useState(null);
  
  // Selectors do Redux
  const services = useSelector(state => state.emergency.services.data);
  const servicesLoading = useSelector(state => state.emergency.services.isLoading);
  const servicesError = useSelector(state => state.emergency.services.error);
  
  const nearbyServices = useSelector(state => state.emergency.nearbyServices.data);
  const nearbyLoading = useSelector(state => state.emergency.nearbyServices.isLoading);
  const nearbyError = useSelector(state => state.emergency.nearbyServices.error);
  
  const contacts = useSelector(state => state.emergency.contacts.data);
  const contactsLoading = useSelector(state => state.emergency.contacts.isLoading);
  
  const phrases = useSelector(state => state.emergency.phrases.data);
  const phrasesLoading = useSelector(state => state.emergency.phrases.isLoading);
  
  const selectedService = useSelector(state => state.emergency.selectedService);
  
  // Efeito para carregar serviços de emergência
  useEffect(() => {
    dispatch(getEmergencyServices());
    dispatch(getContactsByLanguage(i18n.language));
    dispatch(getPhrasesByLanguage(i18n.language));
  }, [dispatch, i18n.language]);
  
  // Efeito para carregar serviços próximos quando a localização mudar
  useEffect(() => {
    if (userLocation.latitude && userLocation.longitude) {
      dispatch(getNearbyServices({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        radius: 10, // 10km
        type: serviceType,
        limit: 50
      }));
    }
  }, [dispatch, userLocation, serviceType]);
  
  // Efeito para obter o tipo de serviço da URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    if (type) {
      setServiceType(type);
      dispatch(setFilters({ type }));
    } else {
      setServiceType(null);
      dispatch(clearFilters());
    }
  }, [dispatch, location.search]);
  
  // Funções do contexto
  
  /**
   * Altera o tipo de serviço selecionado
   * @param {string} type - Tipo de serviço
   */
  const handleServiceTypeChange = useCallback((type) => {
    setServiceType(type);
    dispatch(setFilters({ type }));
    
    // Atualiza a URL com o tipo selecionado
    const params = new URLSearchParams(location.search);
    if (type) {
      params.set('type', type);
    } else {
      params.delete('type');
    }
    
    navigate({
      pathname: location.pathname,
      search: params.toString()
    });
    
    // Registrar evento de analytics
    analyticsService.trackEvent(analyticsService.events.BUTTON_CLICK, {
      element: 'emergency_service_type',
      selected_type: type || 'all'
    });
  }, [dispatch, location.search, location.pathname, navigate]);
  
  /**
   * Abre os detalhes de um serviço de emergência
   * @param {Object} service - Serviço de emergência
   */
  const handleServiceClick = useCallback((service) => {
    dispatch(setSelectedService(service));
    dispatch(openModal({
      type: 'emergency-service-detail',
      data: { service }
    }));
    
    // Registrar evento de analytics
    analyticsService.trackEvent(analyticsService.events.CONTENT_VIEW, {
      content_type: 'emergency_service',
      service_id: service.id,
      service_type: service.service_type,
      service_name: service.name
    });
  }, [dispatch]);
  
  /**
   * Fecha os detalhes de um serviço de emergência
   */
  const handleCloseServiceDetail = useCallback(() => {
    dispatch(clearSelectedService());
  }, [dispatch]);
  
  /**
   * Alterna entre as abas da seção de emergência
   * @param {string} tabId - ID da aba
   */
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    
    // Registrar evento de analytics
    analyticsService.trackEvent(analyticsService.events.BUTTON_CLICK, {
      element: 'emergency_tab',
      selected_tab: tabId
    });
  }, []);
  
  /**
   * Obtém contatos de emergência para o idioma atual
   */
  const refreshContacts = useCallback(() => {
    dispatch(getContactsByLanguage(i18n.language));
  }, [dispatch, i18n.language]);
  
  /**
   * Obtém frases de emergência para o idioma atual
   */
  const refreshPhrases = useCallback(() => {
    dispatch(getPhrasesByLanguage(i18n.language));
  }, [dispatch, i18n.language]);
  
  /**
   * Verifica se um serviço está aberto no momento
   * @param {number} serviceId - ID do serviço
   * @returns {Promise<boolean>} Verdadeiro se o serviço estiver aberto
   */
  const checkServiceStatus = useCallback(async (serviceId) => {
    try {
      return await emergencyService.isServiceOpen(serviceId);
    } catch (error) {
      return false;
    }
  }, []);
  
  // Valor a ser fornecido pelo contexto
  const contextValue = {
    // Estados
    services,
    servicesLoading,
    servicesError,
    nearbyServices,
    nearbyLoading,
    nearbyError,
    contacts,
    contactsLoading,
    phrases,
    phrasesLoading,
    selectedService,
    activeTab,
    serviceType,
    userLocation,
    locationError,
    locationLoading,
    
    // Funções
    handleServiceTypeChange,
    handleServiceClick,
    handleCloseServiceDetail,
    handleTabChange,
    refreshContacts,
    refreshPhrases,
    checkServiceStatus
  };
  
  return (
    <EmergencyContext.Provider value={contextValue}>
      {children}
    </EmergencyContext.Provider>
  );
};

/**
 * Hook personalizado para acessar o contexto de emergência
 * @returns {Object} Contexto de emergência
 */
export const useEmergencyContext = () => {
  const context = useContext(EmergencyContext);
  
  if (!context) {
    throw new Error('useEmergencyContext deve ser usado dentro de um EmergencyProvider');
  }
  
  return context;
};

export default EmergencyContext;