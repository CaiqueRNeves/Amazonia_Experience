import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Icon from '../common/Icon';

/**
 * Componente de botão para chamada de emergência
 * Implementa um link tel: para iniciar uma chamada telefônica
 * 
 * @param {Object} props - Propriedades do componente
 * @param {string} props.serviceType - Tipo de serviço de emergência (ambulance, police, fire)
 * @param {string} props.label - Texto do botão
 * @param {string} props.phoneNumber - Número de telefone opcional (se não fornecido, usa o padrão do tipo)
 */
const EmergencyCallButton = ({ serviceType, label, phoneNumber }) => {
  const { t } = useTranslation();
  
  // Mapeia tipos de serviço para números de telefone padrão
  const defaultNumbers = {
    ambulance: '192', // SAMU no Brasil
    police: '190',    // Polícia no Brasil
    fire: '193',      // Bombeiros no Brasil
    embassy: null,    // Não há número padrão para embaixadas
    tourist_police: null // Varia por localidade
  };
  
  // Define o número a ser usado
  const number = phoneNumber || defaultNumbers[serviceType] || '';
  
  // Se não há número definido, não renderiza o botão
  if (!number) return null;
  
  // Mapeia tipos de serviço para cores e ícones
  const buttonStyles = {
    ambulance: {
      bgColor: 'bg-red-600',
      hoverColor: 'hover:bg-red-700',
      icon: 'ambulance'
    },
    police: {
      bgColor: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
      icon: 'shield-check'
    },
    fire: {
      bgColor: 'bg-orange-600',
      hoverColor: 'hover:bg-orange-700',
      icon: 'fire'
    },
    embassy: {
      bgColor: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700',
      icon: 'building-office-2'
    },
    tourist_police: {
      bgColor: 'bg-cyan-600',
      hoverColor: 'hover:bg-cyan-700',
      icon: 'user-circle'
    },
    default: {
      bgColor: 'bg-primary',
      hoverColor: 'hover:bg-primary-dark',
      icon: 'phone'
    }
  };
  
  // Obtém estilos para o botão com base no tipo
  const style = buttonStyles[serviceType] || buttonStyles.default;
  
  return (
    <a
      href={`tel:${number}`}
      className={`emergency-call-button ${style.bgColor} ${style.hoverColor} text-white py-2 px-4 rounded-lg flex items-center justify-center shadow-md transition-colors`}
    >
      <Icon name={style.icon} className="mr-2" />
      <span>{label || t(`emergency.call${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}`)}</span>
      <span className="ml-2 font-semibold">{number}</span>
    </a>
  );
};

EmergencyCallButton.propTypes = {
  serviceType: PropTypes.oneOf(['ambulance', 'police', 'fire', 'embassy', 'tourist_police']).isRequired,
  label: PropTypes.string,
  phoneNumber: PropTypes.string
};

export default EmergencyCallButton;