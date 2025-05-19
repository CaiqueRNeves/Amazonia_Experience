import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

/**
 * Hook personalizado para lidar com serviços de emergência
 * Gerencia acesso a contatos, frases úteis e localização de serviços
 * 
 * @param {Object} options - Opções de configuração
 * @returns {Object} Funções e estados para serviços de emergência
 */
const useEmergency = (options = {}) => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const currentLanguage = i18n.language;
  
  // Estados do Redux relacionados a serviços de emergência
  const {
    services,
    servicesByType,
    nearbyServices,
    contacts,
    phrases
  } = useSelector((state) => state.emergency);
  
  // Estado local para números de telefone de emergência
  const [emergencyNumbers, setEmergencyNumbers] = useState({
    police: '190',   // Polícia
    ambulance: '192', // SAMU
    fire: '193'      // Bombeiros
  });
  
  // Importar ações do Redux
  const {
    getEmergencyServices,
    getServicesByType,
    getNearbyServices,
    getContactsByLanguage,
    getPhrasesByLanguage
  } = require('../redux/slices/emergencySlice');
  
  // Carregar contatos de emergência no idioma atual
  useEffect(() => {
    // Só busca se não tivermos os contatos ou se o idioma mudou
    if (!contacts.data || contacts.language !== currentLanguage) {
      dispatch(getContactsByLanguage(currentLanguage));
    }
  }, [dispatch, getContactsByLanguage, currentLanguage, contacts.data, contacts.language]);
  
  // Carregar frases úteis no idioma atual
  useEffect(() => {
    // Só busca se não tivermos as frases ou se o idioma mudou
    if (!phrases.data || phrases.language !== currentLanguage) {
      dispatch(getPhrasesByLanguage(currentLanguage));
    }
  }, [dispatch, getPhrasesByLanguage, currentLanguage, phrases.data, phrases.language]);
  
  // Atualizar números de emergência quando os contatos mudarem
  useEffect(() => {
    if (contacts.data && contacts.data.emergency) {
      setEmergencyNumbers(prev => ({
        ...prev,
        ...contacts.data.emergency
      }));
    }
  }, [contacts.data]);
  
  // Buscar serviços de emergência com filtros
  const fetchServices = useCallback(async (params = {}) => {
    try {
      const resultAction = await dispatch(getEmergencyServices(params));
      return getEmergencyServices.fulfilled.match(resultAction);
    } catch (error) {
      console.error('Error fetching emergency services:', error);
      return false;
    }
  }, [dispatch, getEmergencyServices]);
  
  // Buscar serviços por tipo
  const fetchServicesByType = useCallback(async (type, params = {}) => {
    try {
      const resultAction = await dispatch(getServicesByType({ type, params }));
      return getServicesByType.fulfilled.match(resultAction);
    } catch (error) {
      console.error(`Error fetching ${type} services:`, error);
      return false;
    }
  }, [dispatch, getServicesByType]);
  
  // Buscar serviços próximos
  const fetchNearbyServices = useCallback(async ({ latitude, longitude, radius = 5, type = null, page = 1, limit = 10 } = {}) => {
    try {
      const resultAction = await dispatch(getNearbyServices({
        latitude,
        longitude,
        radius,
        type,
        page,
        limit
      }));
      return getNearbyServices.fulfilled.match(resultAction);
    } catch (error) {
      console.error('Error fetching nearby emergency services:', error);
      return false;
    }
  }, [dispatch, getNearbyServices]);
  
  // Fazer uma chamada de emergência
  const callEmergency = useCallback((serviceType = 'police') => {
    // Determinar o número correto com base no tipo
    let phoneNumber = emergencyNumbers.police; // padrão
    
    if (serviceType === 'ambulance' && emergencyNumbers.ambulance) {
      phoneNumber = emergencyNumbers.ambulance;
    } else if (serviceType === 'fire' && emergencyNumbers.fire) {
      phoneNumber = emergencyNumbers.fire;
    }
    
    // Verificar se o dispositivo suporta chamadas telefônicas
    if ('tel' in window) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      // Exibir o número se não puder fazer a chamada
      toast.info(t('emergency.callNumber', { number: phoneNumber }));
    }
  }, [emergencyNumbers, t]);
  
  // Formatar tipos de serviço para exibição
  const formatServiceType = useCallback((type) => {
    switch (type) {
      case 'hospital':
        return t('emergency.serviceTypes.hospital');
      case 'pharmacy':
        return t('emergency.serviceTypes.pharmacy');
      case 'police':
        return t('emergency.serviceTypes.police');
      case 'fire_department':
        return t('emergency.serviceTypes.fireDepartment');
      case 'embassy':
        return t('emergency.serviceTypes.embassy');
      case 'tourist_police':
        return t('emergency.serviceTypes.touristPolice');
      default:
        return type;
    }
  }, [t]);
  
  // Obter uma frase útil específica
  const getPhrase = useCallback((category, index = 0) => {
    if (!phrases.data || !phrases.data[category] || !phrases.data[category][index]) {
      return null;
    }
    
    return phrases.data[category][index];
  }, [phrases.data]);
  
  // Verificar se um serviço está aberto agora
  const isServiceOpen = useCallback((service) => {
    if (!service) return false;
    
    // Se o serviço funciona 24h, está sempre aberto
    if (service.is_24h) return true;
    
    // Se não temos informações de horário, assumimos que está fechado
    if (!service.opening_hours) return false;
    
    // Implementação simples - na prática, seria necessário analisar o formato do opening_hours
    // e comparar com o horário atual
    const now = new Date();
    const day = now.getDay(); // 0 (domingo) a 6 (sábado)
    const hour = now.getHours();
    
    // Exemplo simples - assumindo que o campo opening_hours tem um formato específico
    // Esta implementação deve ser adaptada para o formato real dos dados
    try {
      // Este código é um exemplo e deve ser adaptado para o formato real dos dados
      if (service.opening_hours.includes('24 horas')) {
        return true;
      }
      
      // Verifica se está fechado aos finais de semana
      if ((day === 0 || day === 6) && service.opening_hours.includes('Segunda a sexta')) {
        return false;
      }
      
      // Verifica horário de funcionamento básico (8h às 18h)
      if (hour >= 8 && hour < 18) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking if service is open:', error);
      return false;
    }
  }, []);
  
  return {
    // Estados
    services: services.data,
    servicesLoading: services.isLoading,
    servicesError: services.error,
    servicesByType: servicesByType.data,
    servicesByTypeLoading: servicesByType.isLoading,
    nearbyServices: nearbyServices.data,
    nearbyServicesLoading: nearbyServices.isLoading,
    contacts: contacts.data,
    contactsLoading: contacts.isLoading,
    phrases: phrases.data,
    phrasesLoading: phrases.isLoading,
    emergencyNumbers,
    
    // Funções
    fetchServices,
    fetchServicesByType,
    fetchNearbyServices,
    callEmergency,
    formatServiceType,
    getPhrase,
    isServiceOpen
  };
};

export default useEmergency;