import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { PhoneIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

import Container from './Container';
import PageHeader from './PageHeader';

/**
 * Layout específico para páginas de emergência
 * Inclui informações de contato de emergência e avisos importantes
 */
const EmergencyLayout = ({ children, title, showEmergencyContacts = true }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Banner de emergência */}
      {showEmergencyContacts && (
        <div className="bg-red-600 text-white p-4">
          <Container>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
                <span className="font-bold">{t('emergency.emergencyTitle')}</span>
              </div>
              <div className="mt-2 md:mt-0 flex flex-wrap gap-4">
                
                  href="tel:190"
                  className="inline-flex items-center bg-white text-red-600 px-3 py-1 rounded-md text-sm font-medium"
                >
                  <PhoneIcon className="h-4 w-4 mr-1" />
                  190 - {t('emergency.police')}
                </a>
                
                  href="tel:192"
                  className="inline-flex items-center bg-white text-red-600 px-3 py-1 rounded-md text-sm font-medium"
                >
                  <PhoneIcon className="h-4 w-4 mr-1" />
                  192 - {t('emergency.ambulance')}
                </a>
                
                  href="tel:193"
                  className="inline-flex items-center bg-white text-red-600 px-3 py-1 rounded-md text-sm font-medium"
                >
                  <PhoneIcon className="h-4 w-4 mr-1" />
                  193 - {t('emergency.fireDepartment')}
                </a>
              </div>
            </div>
          </Container>
        </div>
      )}
      
      <PageHeader 
        title={title || t('emergency.title')} 
        description={t('emergency.description')}
      />
      
      <Container>
        {/* Dica de segurança */}
        <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <InformationCircleIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                {t('emergency.safetyTip')}
              </p>
            </div>
          </div>
        </div>
        
        {/* Conteúdo principal */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {children}
        </div>
      </Container>
    </div>
  );
};

EmergencyLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  showEmergencyContacts: PropTypes.bool,
};

export default EmergencyLayout;