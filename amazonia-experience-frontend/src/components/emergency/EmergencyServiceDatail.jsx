import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Icon from '../common/Icon';
import Button from '../common/Button';
import MapDirections from '../common/MapDirections';
import Badge from '../common/Badge';

/**
 * Componente que exibe detalhes de um serviço de emergência
 * Mostra informações completas, opções para ligar e obter direções
 * 
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.service - Dados do serviço de emergência
 * @param {Function} props.onClose - Função chamada ao fechar o modal
 */
const EmergencyServiceDetail = ({ service, onClose }) => {
  const { t } = useTranslation();
  const [showDirections, setShowDirections] = useState(false);
  
  // Formata a lista de idiomas falados
  const formatLanguages = (languages) => {
    if (!languages) return [];
    
    // Se for uma string JSON, tenta parsear
    if (typeof languages === 'string') {
      try {
        const parsed = JSON.parse(languages);
        return Array.isArray(parsed) ? parsed : [languages];
      } catch (e) {
        return [languages];
      }
    }
    
    // Se já for um array, retorna como está
    return Array.isArray(languages) ? languages : [languages];
  };
  
  // Formata o tipo de serviço para exibição
  const formatServiceType = (type) => {
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
  };
  
  // Determina o ícone com base no tipo de serviço
  const getServiceIcon = (type) => {
    switch (type) {
      case 'hospital':
        return 'medical-building';
      case 'pharmacy':
        return 'medicine-bottle';
      case 'police':
        return 'police-badge';
      case 'fire_department':
        return 'fire-truck';
      case 'embassy':
        return 'flag-banner';
      case 'tourist_police':
        return 'badge-help';
      default:
        return 'first-aid';
    }
  };
  
  return (
    <div className="emergency-service-detail">
      <div className="service-header flex items-start mb-4">
        <div className="service-icon bg-primary bg-opacity-10 rounded-full p-3 mr-3">
          <Icon 
            name={getServiceIcon(service.service_type)} 
            className="text-primary text-2xl"
          />
        </div>
        
        <div className="service-title flex-1">
          <h2 className="text-xl font-semibold">{service.name}</h2>
          <div className="service-type text-gray-600">
            {formatServiceType(service.service_type)}
          </div>
          
          {/* Se houver distância, mostrar */}
          {service.distance !== undefined && (
            <div className="distance text-sm text-gray-500 mt-1">
              <Icon name="map-pin" className="inline-block mr-1" />
              {typeof service.distance === 'number' 
                ? `${service.distance.toFixed(1)} km` 
                : service.formattedDistance || service.distance
              }
            </div>
          )}
        </div>
      </div>
      
      {/* Informações de contato e endereço */}
      <div className="service-info bg-gray-50 p-4 rounded-lg mb-4">
        {service.address && (
          <div className="address flex items-start mb-2">
            <Icon name="map-pin" className="text-gray-500 mt-1 mr-2 flex-shrink-0" />
            <span>{service.address}</span>
          </div>
        )}
        
        {service.phone_number && (
          <div className="phone flex items-center mb-2">
            <Icon name="phone" className="text-gray-500 mr-2 flex-shrink-0" />
            <span>{service.phone_number}</span>
          </div>
        )}
        
        {service.email && (
          <div className="email flex items-center mb-2">
            <Icon name="envelope" className="text-gray-500 mr-2 flex-shrink-0" />
            <span>{service.email}</span>
          </div>
        )}
        
        {service.website && (
          <div className="website flex items-center mb-2">
            <Icon name="globe-alt" className="text-gray-500 mr-2 flex-shrink-0" />
            <a 
              href={service.website.startsWith('http') ? service.website : `https://${service.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              {service.website}
            </a>
          </div>
        )}
      </div>
      
      {/* Status e informações adicionais */}
      <div className="service-status flex flex-wrap gap-2 mb-4">
        {service.is_24h && (
          <Badge
            text={t('emergency.open24h')}
            color="green"
            icon="clock"
          />
        )}
        
        {service.has_emergency_room && (
          <Badge
            text={t('emergency.hasEmergencyRoom')}
            color="red"
            icon="first-aid"
          />
        )}
        
        {service.accepts_insurance && (
          <Badge
            text={t('emergency.acceptsInsurance')}
            color="blue"
            icon="document-check"
          />
        )}
      </div>
      
      {/* Idiomas falados */}
      {service.languages_spoken && (
        <div className="languages mb-4">
          <h3 className="text-base font-medium mb-2">
            {t('emergency.languagesSpoken')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {formatLanguages(service.languages_spoken).map((lang) => (
              <Badge key={lang} text={lang} color="indigo" />
            ))}
          </div>
        </div>
      )}
      
      {/* Detalhes adicionais */}
      {service.description && (
        <div className="description mb-4">
          <h3 className="text-base font-medium mb-1">
            {t('common.description')}
          </h3>
          <p className="text-gray-700">{service.description}</p>
        </div>
      )}
      
      {/* Horário de funcionamento */}
      {service.opening_hours && (
        <div className="opening-hours mb-4">
          <h3 className="text-base font-medium mb-1">
            {t('common.openingHours')}
          </h3>
          <p className="text-gray-700">{service.opening_hours}</p>
        </div>
      )}
      
      {/* Mapa de direções */}
      {service.latitude && service.longitude && (
        <>
          {!showDirections ? (
            <Button
              text={t('emergency.getDirections')}
              icon="map"
              onClick={() => setShowDirections(true)}
              className="mb-4 w-full"
            />
          ) : (
            <div className="directions-map mb-4">
              <h3 className="text-base font-medium mb-2">
                {t('emergency.directions')}
              </h3>
              <MapDirections
                destination={{ 
                  latitude: service.latitude, 
                  longitude: service.longitude,
                  name: service.name
                }}
                height={250}
                className="rounded-lg overflow-hidden shadow-sm"
              />
            </div>
          )}
        </>
      )}
      
      {/* Botão de chamada */}
      {service.phone_number && (
        <a
          href={`tel:${service.phone_number}`}
          className="call-button bg-primary text-white py-3 px-4 rounded-lg flex items-center justify-center shadow-md hover:bg-primary-dark transition-colors mb-3 w-full"
        >
          <Icon name="phone" className="mr-2" />
          <span>{t('emergency.callService')}</span>
        </a>
      )}
      
      {/* Botões de ação */}
      <div className="actions flex justify-between gap-3">
        <Button
          text={t('common.close')}
          variant="outline"
          onClick={onClose}
          className="flex-1"
        />
        
        {service.latitude && service.longitude && (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${service.latitude},${service.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="open-maps-btn bg-gray-100 text-gray-800 py-2 px-4 rounded-lg flex items-center justify-center shadow-sm hover:bg-gray-200 transition-colors flex-1"
          >
            <Icon name="map" className="mr-2" />
            <span>{t('emergency.openInMaps')}</span>
          </a>
        )}
      </div>
    </div>
  );
};

EmergencyServiceDetail.propTypes = {
  service: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    service_type: PropTypes.string.isRequired,
    address: PropTypes.string,
    phone_number: PropTypes.string,
    email: PropTypes.string,
    website: PropTypes.string,
    is_24h: PropTypes.bool,
    has_emergency_room: PropTypes.bool,
    accepts_insurance: PropTypes.bool,
    languages_spoken: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array
    ]),
    latitude: PropTypes.number,
    longitude: PropTypes.number,
    distance: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    formattedDistance: PropTypes.string,
    description: PropTypes.string,
    opening_hours: PropTypes.string
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

export default EmergencyServiceDetail;