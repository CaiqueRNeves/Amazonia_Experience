import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMap } from '../../hooks';
import LoadingIndicator from '../common/LoadingIndicator';

/**
 * Componente que exibe um mapa interativo com serviços de emergência
 * 
 * @param {Object} props - Propriedades do componente
 * @param {Array} props.services - Lista de serviços de emergência para exibir
 * @param {Object} props.userLocation - Localização do usuário { latitude, longitude }
 * @param {Function} props.onServiceClick - Função chamada ao clicar em um serviço
 */
const EmergencyMap = ({ services, userLocation, onServiceClick }) => {
  const { t } = useTranslation();
  const mapContainerRef = useRef(null);
  
  // Usa o hook useMap para gerenciar o mapa
  const { 
    mapRef,
    isMapInitialized,
    addMarker,
    clearMarkers,
    panTo
  } = useMap({
    center: userLocation 
      ? { lat: userLocation.latitude, lng: userLocation.longitude }
      : { lat: -1.455833, lng: -48.503889 }, // Coordenadas padrão de Belém do Pará
    zoom: 13,
    initialMarkers: []
  });
  
  // Função para obter a cor baseada no tipo de serviço
  const getServiceColor = (type) => {
    switch (type) {
      case 'hospital':
        return '#E53E3E'; // Vermelho
      case 'pharmacy':
        return '#38A169'; // Verde
      case 'police':
        return '#3182CE'; // Azul
      case 'fire_department':
        return '#DD6B20'; // Laranja
      case 'embassy':
        return '#6B46C1'; // Roxo
      case 'tourist_police':
        return '#0987A0'; // Azul claro
      default:
        return '#718096'; // Cinza
    }
  };
  
  // Função para obter o ícone baseado no tipo de serviço
  const getServiceIcon = (type) => {
    const serviceIcons = {
      hospital: 'medical-building',
      pharmacy: 'medicine-bottle',
      police: 'police-badge',
      fire_department: 'fire-truck',
      embassy: 'flag-banner',
      tourist_police: 'badge-help'
    };
    
    return serviceIcons[type] || 'first-aid';
  };
  
  // Adiciona marcadores de serviços e da localização do usuário
  useEffect(() => {
    if (!isMapInitialized || !mapRef.current) return;
    
    // Limpa marcadores existentes
    clearMarkers();
    
    // Adiciona marcador da localização do usuário
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      addMarker({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
        icon: {
          url: '/images/user-location-marker.svg',
          size: [32, 32],
          anchor: [16, 16]
        },
        title: t('common.yourLocation')
      });
      
      // Centraliza o mapa na localização do usuário
      panTo({ lat: userLocation.latitude, lng: userLocation.longitude });
    }
    
    // Adiciona marcadores para cada serviço
    services.forEach(service => {
      if (service.latitude && service.longitude) {
        // Cria conteúdo do popup
        const popupContent = `
          <div class="emergency-popup">
            <h3 class="font-semibold">${service.name}</h3>
            <p>${t('emergency.serviceTypes.' + service.service_type)}</p>
            ${service.address ? `<p>${service.address}</p>` : ''}
            ${service.phone_number ? `<p>${t('common.phone')}: ${service.phone_number}</p>` : ''}
            ${service.is_24h ? `<p class="text-green-600">${t('emergency.open24h')}</p>` : ''}
          </div>
        `;
        
        // Adiciona o marcador
        addMarker({
          lat: service.latitude,
          lng: service.longitude,
          title: service.name,
          popup: popupContent,
          icon: {
            url: `/images/markers/${getServiceIcon(service.service_type)}.svg`,
            size: [32, 32],
            anchor: [16, 32]
          },
          id: service.id
        });
      }
    });
    
    // Se temos serviços suficientes, ajusta o mapa para mostrar todos
    if (services.length > 1) {
      const bounds = L.latLngBounds(
        services
          .filter(s => s.latitude && s.longitude)
          .map(s => [s.latitude, s.longitude])
      );
      
      // Adiciona a localização do usuário ao bound
      if (userLocation && userLocation.latitude && userLocation.longitude) {
        bounds.extend([userLocation.latitude, userLocation.longitude]);
      }
      
      // Ajusta o mapa para mostrar todos os pontos
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [isMapInitialized, services, userLocation, mapRef, addMarker, clearMarkers, panTo, t]);
  
  return (
    <div className="emergency-map w-full">
      {!isMapInitialized && (
        <LoadingIndicator message={t('common.loadingMap')} />
      )}
      
      <div 
        ref={mapContainerRef}
        className="map-container h-96 rounded-lg overflow-hidden shadow-md"
      >
        <div ref={mapRef} className="h-full w-full" />
      </div>
      
      {/* Legenda do mapa */}
      <div className="map-legend mt-4 grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
        {['hospital', 'pharmacy', 'police', 'fire_department', 'embassy', 'tourist_police'].map((type) => (
          <div key={type} className="legend-item flex items-center">
            <span 
              className="legend-color w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: getServiceColor(type) }}
            />
            <span>{t(`emergency.serviceTypes.${type}`)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

EmergencyMap.propTypes = {
  services: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      service_type: PropTypes.string.isRequired,
      address: PropTypes.string,
      phone_number: PropTypes.string,
      latitude: PropTypes.number,
      longitude: PropTypes.number,
      is_24h: PropTypes.bool
    })
  ).isRequired,
  userLocation: PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number
  }),
  onServiceClick: PropTypes.func
};

EmergencyMap.defaultProps = {
  services: [],
  onServiceClick: () => {}
};

export default EmergencyMap;