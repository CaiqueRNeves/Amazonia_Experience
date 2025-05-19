import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Icon from '../common/Icon';
import Badge from '../common/Badge';

/**
 * Componente que exibe um cartão de serviço de emergência
 * Mostra informações como nome, endereço, tipo de serviço e ícones de status
 * 
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.service - Dados do serviço de emergência
 * @param {Function} props.onClick - Função chamada quando o cartão é clicado
 * @param {number} props.distance - Distância do serviço (opcional)
 */
const EmergencyServiceCard = ({ service, onClick, distance }) => {
  const { t } = useTranslation();

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

  // Formata a lista de idiomas falados
  const formatLanguages = (languages) => {
    if (!languages) return null;
    
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

  // Renderiza badges dos idiomas falados
  const renderLanguageBadges = () => {
    const languages = formatLanguages(service.languages_spoken);
    
    if (!languages || languages.length === 0) return null;
    
    return (
      <div className="language-badges flex flex-wrap gap-1 mt-2">
        {languages.map((lang) => (
          <Badge key={lang} text={lang} color="blue" size="sm" />
        ))}
      </div>
    );
  };

  return (
    <div 
      className="emergency-service-card bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start">
        {/* Ícone do serviço */}
        <div className="service-icon bg-primary bg-opacity-10 rounded-full p-3 mr-3">
          <Icon name={getServiceIcon(service.service_type)} className="text-primary text-xl" />
        </div>
        
        {/* Informações do serviço */}
        <div className="service-info flex-1">
          <h3 className="text-lg font-semibold line-clamp-1">{service.name}</h3>
          
          <div className="service-type text-sm text-gray-600 mb-1">
            {formatServiceType(service.service_type)}
          </div>
          
          {service.address && (
            <div className="service-address text-sm text-gray-700 flex items-start mt-1">
              <Icon name="map-pin" className="text-gray-500 mr-1 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{service.address}</span>
            </div>
          )}
          
          {service.phone_number && (
            <div className="service-phone text-sm text-gray-700 flex items-center mt-1">
              <Icon name="phone" className="text-gray-500 mr-1 flex-shrink-0" />
              <span>{service.phone_number}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Rodapé com informações adicionais */}
      <div className="card-footer mt-3 pt-2 border-t border-gray-100 flex justify-between items-center">
        {/* Status (24h, etc) */}
        <div className="status-indicators flex items-center">
          {service.is_24h && (
            <Badge 
              text={t('emergency.open24h')} 
              color="green" 
              icon="clock"
              size="sm"
            />
          )}
        </div>
        
        {/* Distância, se fornecida */}
        {distance !== undefined && (
          <div className="distance text-sm text-gray-600 flex items-center">
            <Icon name="location-marker" className="mr-1" />
            <span>{typeof distance === 'number' ? `${distance.toFixed(1)} km` : distance}</span>
          </div>
        )}
      </div>
      
      {/* Badges de idiomas */}
      {renderLanguageBadges()}
    </div>
  );
};

EmergencyServiceCard.propTypes = {
  service: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    service_type: PropTypes.string.isRequired,
    address: PropTypes.string,
    phone_number: PropTypes.string,
    is_24h: PropTypes.bool,
    languages_spoken: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array
    ])
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  distance: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ])
};

export default EmergencyServiceCard;