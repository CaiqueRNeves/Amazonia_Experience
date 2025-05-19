import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import LoadingIndicator from '../common/LoadingIndicator';
import Icon from '../common/Icon';
import EmptyState from '../common/EmptyState';

/**
 * Componente que exibe contatos de emergência importantes
 * 
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.contacts - Objeto com contatos de emergência
 * @param {boolean} props.isLoading - Flag indicando se os dados estão sendo carregados
 */
const EmergencyContacts = ({ contacts, isLoading }) => {
  const { t } = useTranslation();
  
  // Renderiza loader enquanto carrega
  if (isLoading) {
    return <LoadingIndicator message={t('emergency.loadingContacts')} />;
  }
  
  // Se não houver contatos
  if (!contacts || Object.keys(contacts).length === 0) {
    return (
      <EmptyState
        icon="phone-x"
        title={t('emergency.noContacts')}
        message={t('emergency.noContactsMessage')}
      />
    );
  }
  
  // Organiza os contatos por categorias
  const contactCategories = {
    emergency: {
      title: t('emergency.contacts.emergency'),
      icon: 'bell-alert',
      contacts: contacts.emergency || {}
    },
    health: {
      title: t('emergency.contacts.health'),
      icon: 'heart-pulse',
      contacts: contacts.health || {}
    },
    security: {
      title: t('emergency.contacts.security'),
      icon: 'shield-check',
      contacts: contacts.security || {}
    },
    tourist: {
      title: t('emergency.contacts.tourist'),
      icon: 'information-circle',
      contacts: contacts.tourist || {}
    },
    embassies: {
      title: t('emergency.contacts.embassies'),
      icon: 'flag',
      contacts: contacts.embassies || {}
    },
    other: {
      title: t('emergency.contacts.other'),
      icon: 'phone',
      contacts: contacts.other || {}
    }
  };
  
  // Função para renderizar um cartão de contato
  const renderContactCard = (name, number, description = null) => (
    <div key={`${name}-${number}`} className="contact-card bg-white rounded-lg shadow-sm p-4 mb-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-base">{name}</h4>
          {description && <p className="text-gray-600 text-sm">{description}</p>}
        </div>
        <a 
          href={`tel:${number}`}
          className="call-button bg-primary text-white rounded-full p-2 hover:bg-primary-dark transition-colors"
          aria-label={t('emergency.call')}
        >
          <Icon name="phone" className="text-xl" />
        </a>
      </div>
    </div>
  );
  
  // Função para renderizar uma categoria de contatos
  const renderContactCategory = (category) => {
    const { title, icon, contacts } = category;
    
    // Pula categorias vazias
    if (!contacts || Object.keys(contacts).length === 0) {
      return null;
    }
    
    return (
      <div className="contact-category mb-6" key={title}>
        <div className="category-header flex items-center mb-3">
          <Icon name={icon} className="text-primary text-xl mr-2" />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        
        <div className="category-content">
          {Object.entries(contacts).map(([name, info]) => {
            // Se o contato for um objeto com número e descrição
            if (typeof info === 'object' && info.number) {
              return renderContactCard(name, info.number, info.description);
            }
            // Se for apenas o número
            else if (typeof info === 'string') {
              return renderContactCard(name, info);
            }
            return null;
          })}
        </div>
      </div>
    );
  };
  
  return (
    <div className="emergency-contacts">
      <p className="text-base text-gray-700 mb-4">
        {t('emergency.contactsDescription')}
      </p>
      
      {/* Renderiza cada categoria de contatos */}
      {Object.values(contactCategories).map(category => renderContactCategory(category))}
      
      {/* Nota de rodapé */}
      <div className="note text-sm text-gray-500 bg-gray-50 p-3 rounded-lg mt-2">
        <Icon name="information-circle" className="inline-block mr-1" />
        {t('emergency.callNote')}
      </div>
    </div>
  );
};

EmergencyContacts.propTypes = {
  contacts: PropTypes.object,
  isLoading: PropTypes.bool
};

EmergencyContacts.defaultProps = {
  contacts: {},
  isLoading: false
};

export default EmergencyContacts;