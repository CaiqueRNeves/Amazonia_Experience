import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getNearbyServices } from '../../redux/slices/emergencySlice';
import { useGeolocation, useEmergency, useNearby } from '../../hooks';

import EmergencyServiceList from './EmergencyServiceList';
import EmergencyMap from './EmergencyMap';
import LoadingIndicator from '../common/LoadingIndicator';
import ErrorMessage from '../common/ErrorMessage';
import LocationRequiredAlert from '../common/LocationRequiredAlert';
import TabControl from '../common/TabControl';
import EmptyState from '../common/EmptyState';

/**
 * Componente que mostra serviços de emergência próximos
 * Filtra por tipo e usa a localização do usuário
 * 
 * @param {Object} props - Propriedades do componente
 * @param {string} props.selectedType - Tipo de serviço selecionado para filtro
 * @param {Function} props.onServiceClick - Função chamada quando um serviço é clicado
 */
const NearbyEmergencyServices = ({ selectedType, onServiceClick }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  // Estado local
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'map'
  
  // Obtém a localização do usuário
  const { location, error: locationError, loading: locationLoading } = useGeolocation();
  
  // Usa o hook useNearby para gerenciar entidades próximas
  const { 
    nearby: nearbyServices, 
    isLoading: nearbyLoading, 
    error: nearbyError,
    locationAvailable,
    fetchNearby,
    formatDistance 
  } = useNearby('emergency');
  
  // Efeito para buscar serviços próximos quando a localização mudar
  useEffect(() => {
    if (location.latitude && location.longitude) {
      fetchNearby({
        latitude: location.latitude,
        longitude: location.longitude,
        radius: 10, // 10km
        type: selectedType || null,
        limit: 50
      });
    }
  }, [location, selectedType, fetchNearby]);
  
  // Opções para alternar visualização
  const viewOptions = [
    { id: 'list', label: t('common.list'), icon: 'list-bullet' },
    { id: 'map', label: t('common.map'), icon: 'map' }
  ];
  
  // Formata serviços para exibição com distância
  const formatServicesWithDistance = () => {
    return nearbyServices.map(service => {
      const distance = formatDistance(
        service.distance || 
        calculateDistance(location, { latitude: service.latitude, longitude: service.longitude })
      );
      return { ...service, formattedDistance: distance };
    });
  };
  
  // Calcula distância entre dois pontos
  const calculateDistance = (point1, point2) => {
    if (!point1 || !point2 || !point1.latitude || !point2.latitude) return null;
    
    const R = 6371; // Raio da Terra em km
    const dLat = toRadians(point2.latitude - point1.latitude);
    const dLon = toRadians(point2.longitude - point1.longitude);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRadians(point1.latitude)) * Math.cos(toRadians(point2.latitude)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };
  
  const toRadians = (degrees) => {
    return degrees * (Math.PI / 180);
  };
  
  // Manipula clique em serviço com dados de distância
  const handleServiceClick = (service) => {
    const distance = calculateDistance(
      location, 
      { latitude: service.latitude, longitude: service.longitude }
    );
    
    onServiceClick({
      ...service,
      distance,
      formattedDistance: formatDistance(distance)
    });
  };
  
  // Renderiza o conteúdo do componente
  const renderContent = () => {
    // Se a localização estiver sendo carregada
    if (locationLoading) {
      return <LoadingIndicator message={t('common.gettingLocation')} />;
    }
    
    // Se houver erro de localização
    if (locationError) {
      return <LocationRequiredAlert message={t('emergency.needLocation')} />;
    }
    
    // Se estiver carregando serviços
    if (nearbyLoading) {
      return <LoadingIndicator message={t('emergency.loadingNearbyServices')} />;
    }
    
    // Se houver erro nos serviços
    if (nearbyError) {
      return <ErrorMessage message={t('emergency.errorLoadingNearbyServices')} error={nearbyError} />;
    }
    
    // Se não houver serviços
    if (!nearbyServices || nearbyServices.length === 0) {
      return (
        <EmptyState
          icon="map-pin-off"
          title={t('emergency.noNearbyServices')}
          message={selectedType 
            ? t('emergency.noNearbyServicesOfType', { type: formatServiceType(selectedType) }) 
            : t('emergency.noNearbyServicesMessage')
          }
        />
      );
    }
    
    // Renderiza a visualização escolhida
    return (
      <>
        {viewMode === 'list' ? (
          <EmergencyServiceList
            services={formatServicesWithDistance()}
            onServiceClick={handleServiceClick}
          />
        ) : (
          <EmergencyMap
            services={nearbyServices}
            userLocation={location}
            onServiceClick={handleServiceClick}
          />
        )}
      </>
    );
  };
  
  // Formata tipo de serviço para mensagem
  const formatServiceType = (type) => {
    const types = {
      hospital: t('emergency.serviceTypes.hospital'),
      pharmacy: t('emergency.serviceTypes.pharmacy'),
      police: t('emergency.serviceTypes.police'),
      fire_department: t('emergency.serviceTypes.fireDepartment'),
      embassy: t('emergency.serviceTypes.embassy'),
      tourist_police: t('emergency.serviceTypes.touristPolice')
    };
    
    return types[type] || type;
  };
  
  return (
    <div className="nearby-emergency-services">
      {/* Cabeçalho com título e controles de visualização */}
      <div className="header flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {selectedType 
            ? t('emergency.nearbyServicesOfType', { type: formatServiceType(selectedType) })
            : t('emergency.nearbyServices')
          }
        </h2>
        
        {nearbyServices && nearbyServices.length > 0 && (
          <TabControl 
            options={viewOptions} 
            activeTab={viewMode}
            onChange={setViewMode}
          />
        )}
      </div>
      
      {/* Conteúdo principal */}
      <div className="content">
        {renderContent()}
      </div>
    </div>
  );
};

export default NearbyEmergencyServices;