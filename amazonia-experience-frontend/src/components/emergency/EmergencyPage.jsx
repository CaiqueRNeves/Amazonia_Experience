import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { getEmergencyServices, getContactsByLanguage, getPhrasesByLanguage } from '../../redux/slices/emergencySlice';
import { openModal } from '../../redux/slices/uiSlice';
import { useGeolocation, useEmergency } from '../../hooks';

import EmergencyServiceTypes from './EmergencyServiceTypes';
import EmergencyServiceList from './EmergencyServiceList';
import NearbyEmergencyServices from './NearbyEmergencyServices';
import EmergencyContacts from './EmergencyContacts';
import EmergencyPhrases from './EmergencyPhrases';
import EmergencyCallButton from './EmergencyCallButton';
import LocationRequiredAlert from '../common/LocationRequiredAlert';
import PageTitle from '../common/PageTitle';
import LoadingIndicator from '../common/LoadingIndicator';
import ErrorMessage from '../common/ErrorMessage';
import Tabs from '../common/Tabs';

/**
 * Página principal da seção de Emergência
 * Mostra serviços de emergência próximos, contatos importantes e frases úteis
 */
const EmergencyPage = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estado local
  const [activeTab, setActiveTab] = useState('nearby');
  const [selectedServiceType, setSelectedServiceType] = useState(null);
  
  // Obtém a localização atual
  const { location: userLocation, error: locationError, loading: locationLoading } = useGeolocation();
  
  // Obtém os serviços de emergência do Redux
  const { 
    services, 
    servicesLoading, 
    servicesError,
    contacts,
    contactsLoading,
    phrases,
    phrasesLoading 
  } = useEmergency();
  
  // Carrega os serviços de emergência ao montar o componente
  useEffect(() => {
    dispatch(getEmergencyServices());
    dispatch(getContactsByLanguage(i18n.language));
    dispatch(getPhrasesByLanguage(i18n.language));
  }, [dispatch, i18n.language]);
  
  // Carrega os contatos e frases quando o idioma muda
  useEffect(() => {
    dispatch(getContactsByLanguage(i18n.language));
    dispatch(getPhrasesByLanguage(i18n.language));
  }, [dispatch, i18n.language]);
  
  // Obtém o tipo de serviço da URL, se existir
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    if (type) {
      setSelectedServiceType(type);
    }
  }, [location.search]);
  
  // Tabs da página
  const tabs = [
    { id: 'nearby', label: t('emergency.tabs.nearby'), icon: 'location-marker' },
    { id: 'contacts', label: t('emergency.tabs.contacts'), icon: 'phone' },
    { id: 'phrases', label: t('emergency.tabs.phrases'), icon: 'translate' }
  ];
  
  // Filtra serviços pelo tipo selecionado
  const filteredServices = selectedServiceType 
    ? services.filter(service => service.service_type === selectedServiceType)
    : services;
  
  // Handler para mudar o tipo de serviço
  const handleServiceTypeChange = (type) => {
    setSelectedServiceType(type);
    
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
  };
  
  // Handler para abrir detalhes de um serviço
  const handleServiceClick = (service) => {
    dispatch(openModal({
      type: 'emergency-service-detail',
      data: { service }
    }));
  };
  
  // Handler para ativar uma tab
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };
  
  // Renderiza alerta caso a localização seja necessária mas não esteja disponível
  const renderLocationAlert = () => {
    if (activeTab === 'nearby' && locationError && !locationLoading) {
      return <LocationRequiredAlert message={t('emergency.locationRequired')} />;
    }
    return null;
  };
  
  // Renderiza o conteúdo da tab ativa
  const renderTabContent = () => {
    switch (activeTab) {
      case 'nearby':
        return (
          <NearbyEmergencyServices 
            selectedType={selectedServiceType}
            onServiceClick={handleServiceClick}
          />
        );
      case 'contacts':
        return <EmergencyContacts contacts={contacts} isLoading={contactsLoading} />;
      case 'phrases':
        return <EmergencyPhrases phrases={phrases} isLoading={phrasesLoading} />;
      default:
        return null;
    }
  };
  
  return (
    <div className="emergency-page">
      <div className="container mx-auto px-4 py-6">
        <PageTitle 
          title={t('emergency.title')} 
          subtitle={t('emergency.subtitle')}
          icon="first-aid"
        />
        
        {/* Botões de chamada de emergência */}
        <div className="emergency-call-buttons flex flex-wrap gap-2 my-4">
          <EmergencyCallButton 
            serviceType="ambulance" 
            label={t('emergency.buttons.ambulance')}
          />
          <EmergencyCallButton 
            serviceType="police" 
            label={t('emergency.buttons.police')}
          />
          <EmergencyCallButton 
            serviceType="fire" 
            label={t('emergency.buttons.fire')}
          />
        </div>
        
        {/* Alerta de localização, se necessário */}
        {renderLocationAlert()}
        
        {/* Filtro por tipo de serviço */}
        <div className="service-types-container my-4">
          <EmergencyServiceTypes 
            selectedType={selectedServiceType} 
            onChange={handleServiceTypeChange}
          />
        </div>
        
        {/* Tabs */}
        <Tabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
        />
        
        {/* Conteúdo da tab ativa */}
        <div className="tab-content mt-4">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default EmergencyPage;