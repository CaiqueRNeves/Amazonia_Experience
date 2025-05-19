import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import Icon from '../common/Icon';

/**
 * Componente que exibe os tipos de serviços de emergência disponíveis como filtro
 * 
 * @param {Object} props - Propriedades do componente
 * @param {string} props.selectedType - Tipo de serviço selecionado
 * @param {function} props.onChange - Função chamada quando um tipo é selecionado
 */
const EmergencyServiceTypes = ({ selectedType, onChange }) => {
  const { t } = useTranslation();

  // Lista de tipos de serviços de emergência
  const serviceTypes = [
    { 
      id: 'hospital', 
      label: t('emergency.serviceTypes.hospital'), 
      icon: 'medical-building'
    },
    { 
      id: 'pharmacy', 
      label: t('emergency.serviceTypes.pharmacy'), 
      icon: 'medicine-bottle'
    },
    { 
      id: 'police', 
      label: t('emergency.serviceTypes.police'), 
      icon: 'police-badge'
    },
    { 
      id: 'fire_department', 
      label: t('emergency.serviceTypes.fireDepartment'), 
      icon: 'fire-truck'
    },
    { 
      id: 'embassy', 
      label: t('emergency.serviceTypes.embassy'),
      icon: 'flag-banner'
    },
    { 
      id: 'tourist_police', 
      label: t('emergency.serviceTypes.touristPolice'),
      icon: 'badge-help' 
    }
  ];

  return (
    <div className="emergency-service-types">
      <h3 className="text-lg font-semibold mb-2">{t('emergency.filterByType')}</h3>
      
      <div className="service-types-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {/* Botão "Todos" */}
        <button
          className={`service-type-btn flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
            !selectedType ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'
          }`}
          onClick={() => onChange(null)}
        >
          <Icon name="globe-americas" className="text-2xl mb-1" />
          <span className="text-sm font-medium">{t('common.all')}</span>
        </button>
        
        {/* Botões para cada tipo de serviço */}
        {serviceTypes.map((type) => (
          <button
            key={type.id}
            className={`service-type-btn flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
              selectedType === type.id ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => onChange(type.id)}
          >
            <Icon name={type.icon} className="text-2xl mb-1" />
            <span className="text-sm font-medium">{type.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

EmergencyServiceTypes.propTypes = {
  selectedType: PropTypes.string,
  onChange: PropTypes.func.isRequired
};

export default EmergencyServiceTypes;