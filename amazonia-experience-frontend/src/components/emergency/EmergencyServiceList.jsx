import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import LoadingIndicator from '../common/LoadingIndicator';
import EmptyState from '../common/EmptyState';
import EmergencyServiceCard from './EmergencyServiceCard';

/**
 * Componente que exibe uma lista de serviços de emergência
 * 
 * @param {Object} props - Propriedades do componente
 * @param {Array} props.services - Lista de serviços a serem exibidos
 * @param {boolean} props.isLoading - Flag indicando se os dados estão sendo carregados
 * @param {string} props.error - Mensagem de erro, se houver
 * @param {function} props.onServiceClick - Função chamada quando um serviço é clicado
 */
const EmergencyServiceList = ({ services, isLoading, error, onServiceClick }) => {
  const { t } = useTranslation();

  // Renderiza o indicador de carregamento
  if (isLoading) {
    return <LoadingIndicator message={t('emergency.loadingServices')} />;
  }

  // Renderiza mensagem de erro
  if (error) {
    return (
      <div className="error-container text-center p-4 bg-red-50 rounded-lg">
        <p className="text-red-600">{t('emergency.errorLoadingServices')}</p>
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  // Renderiza estado vazio se não houver serviços
  if (!services || services.length === 0) {
    return (
      <EmptyState
        icon="medical-cross"
        title={t('emergency.noServices')}
        message={t('emergency.noServicesMessage')}
      />
    );
  }

  // Renderiza a lista de serviços
  return (
    <div className="emergency-service-list">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <EmergencyServiceCard
            key={service.id}
            service={service}
            onClick={() => onServiceClick(service)}
          />
        ))}
      </div>
    </div>
  );
};

EmergencyServiceList.propTypes = {
  services: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      service_type: PropTypes.string.isRequired,
      address: PropTypes.string,
      phone_number: PropTypes.string,
      is_24h: PropTypes.bool,
      latitude: PropTypes.number,
      longitude: PropTypes.number,
      languages_spoken: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array
      ])
    })
  ),
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  onServiceClick: PropTypes.func.isRequired
};

EmergencyServiceList.defaultProps = {
  services: [],
  isLoading: false,
  error: null
};

export default EmergencyServiceList;