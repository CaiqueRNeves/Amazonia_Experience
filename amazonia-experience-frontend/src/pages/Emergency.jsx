import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  PhoneIcon, 
  ShieldExclamationIcon, 
  LanguageIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

import { Container, EmergencyLayout, Section } from '../components/layout';
import { Button, Tabs } from '../components/common';
import { api } from '../services/api';
import { useGeolocation } from '../hooks/useGeolocation';
import EmergencyServicesList from '../components/emergency/EmergencyServicesList';
import EmergencyContactsList from '../components/emergency/EmergencyContactsList';
import EmergencyPhrases from '../components/emergency/EmergencyPhrases';
import EmergencyMap from '../components/emergency/EmergencyMap';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

const tabs = [
  { id: 'contacts', label: 'emergency.contacts' },
  { id: 'services', label: 'emergency.services' },
  { id: 'phrases', label: 'emergency.phrases' },
  { id: 'map', label: 'emergency.map' },
];

const serviceTypes = [
  { id: 'all', label: 'emergency.allServices' },
  { id: 'hospital', label: 'emergency.hospitals' },
  { id: 'pharmacy', label: 'emergency.pharmacies' },
  { id: 'police', label: 'emergency.police' },
  { id: 'embassy', label: 'emergency.embassies' },
];

const Emergency = () => {
  const { t, i18n } = useTranslation();
  const { coordinates, getCurrentPosition } = useGeolocation();
  
  const [activeTab, setActiveTab] = useState('contacts');
  const [services, setServices] = useState([]);
  const [contacts, setContacts] = useState({});
  const [phrases, setPhrases] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeServiceType, setActiveServiceType] = useState('all');
  
  // Obter localização atual ao carregar a página
  useEffect(() => {
    getCurrentPosition();
  }, [getCurrentPosition]);
  
  // Carregar serviços de emergência próximos e contatos
  useEffect(() => {
    const fetchEmergencyData = async () => {
      setLoading(true);
      try {
        // Se temos coordenadas, buscar serviços próximos
        if (coordinates.latitude && coordinates.longitude) {
          let params = {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            radius: 10, // 10km radius
            page: 1,
            limit: 50, // Buscar um número maior para filtrar depois
          };
          
          // Adicionar tipo de serviço ao filtro, se não for "all"
          if (activeServiceType !== 'all') {
            params.type = activeServiceType;
          }
          
          const servicesData = await api.emergency.getNearbyServices(
            coordinates.latitude,
            coordinates.longitude,
            10,
            activeServiceType !== 'all' ? activeServiceType : null,
            1,
            50
          );
          
          setServices(servicesData.services || []);
        } else {
          // Caso contrário, buscar todos os serviços
          let servicesData;
          
          if (activeServiceType !== 'all') {
            servicesData = await api.emergency.getServicesByType(activeServiceType);
          } else {
            servicesData = await api.emergency.getEmergencyServices();
          }
          
          setServices(servicesData.services || []);
        }
        
        // Buscar contatos de emergência no idioma atual
        const contactsData = await api.emergency.getContactsByLanguage(i18n.language);
        setContacts(contactsData.contacts || {});
        
        // Buscar frases de emergência no idioma atual
        const phrasesData = await api.emergency.getPhrasesByLanguage(i18n.language);
        setPhrases(phrasesData.phrases || {});
      } catch (error) {
        console.error('Error fetching emergency data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmergencyData();
  }, [coordinates.latitude, coordinates.longitude, activeServiceType, i18n.language]);
  
  return (
    <EmergencyLayout>
      <Container>
        {/* Tabs principais */}
        <div className="mb-6">
          <Tabs
            tabs={tabs.map(tab => ({ ...tab, label: t(tab.label) }))}
            value={activeTab}
            onChange={setActiveTab}
          />
        </div>
        
        {/* Conteúdo da tab ativa */}
        <div className="mb-8">
          {activeTab === 'contacts' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{t('emergency.emergencyContacts')}</h2>
                    <p className="text-gray-600 mt-1">{t('emergency.contactsDescription')}</p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <div className="flex items-center">
                      <LanguageIcon className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-700 mr-2">{t('emergency.changeLanguage')}</span>
                      <LanguageSwitcher />
                    </div>
                  </div>
                </div>
                
                <EmergencyContactsList contacts={contacts} loading={loading} />
              </div>
            </div>
          )}
          
          {activeTab === 'services' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{t('emergency.emergencyServices')}</h2>
                    <p className="text-gray-600 mt-1">{t('emergency.servicesDescription')}</p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <Button
                      variant="outline"
                      onClick={getCurrentPosition}
                      className="flex items-center"
                      disabled={loading}
                    >
                      <MapPinIcon className="h-5 w-5 mr-2" />
                      {t('emergency.useMyLocation')}
                    </Button>
                  </div>
                </div>
                
                {/* Filtro de tipos de serviço */}
                <div className="mb-6 border-b border-gray-200">
                  <div className="flex overflow-x-auto pb-2 space-x-4">
                    {serviceTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setActiveServiceType(type.id)}
                        className={`whitespace-nowrap px-3 py-2 text-sm font-medium rounded-md ${
                          activeServiceType === type.id
                            ? 'bg-red-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {t(type.label)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <EmergencyServicesList services={services} loading={loading} />
              </div>
            </div>
          )}
          
          {activeTab === 'phrases' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{t('emergency.usefulPhrases')}</h2>
                    <p className="text-gray-600 mt-1">{t('emergency.phrasesDescription')}</p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <div className="flex items-center">
                      <LanguageIcon className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-700 mr-2">{t('emergency.changeLanguage')}</span>
                      <LanguageSwitcher />
                    </div>
                  </div>
                </div>
                
                <EmergencyPhrases phrases={phrases} loading={loading} />
              </div>
            </div>
          )}
          
          {activeTab === 'map' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{t('emergency.emergencyMap')}</h2>
                    <p className="text-gray-600 mt-1">{t('emergency.mapDescription')}</p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <Button
                      variant="outline"
                      onClick={getCurrentPosition}
                      className="flex items-center"
                      disabled={loading}
                    >
                      <MapPinIcon className="h-5 w-5 mr-2" />
                      {t('emergency.useMyLocation')}
                    </Button>
                  </div>
                </div>
                
                <div className="h-96">
                  <EmergencyMap 
                    services={services}
                    userLocation={coordinates}
                    loading={loading}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Instruções de segurança */}
        <Section
          title={t('emergency.safetyInstructions')}
          description={t('emergency.safetyDescription')}
          className="mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-red-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <PhoneIcon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="ml-3 text-lg font-medium text-red-800">{t('emergency.callEmergency')}</h3>
              </div>
              <p className="text-red-700 text-sm">{t('emergency.callInstructions')}</p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <MapPinIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="ml-3 text-lg font-medium text-blue-800">{t('emergency.shareLocation')}</h3>
              </div>
              <p className="text-blue-700 text-sm">{t('emergency.locationInstructions')}</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <ShieldExclamationIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="ml-3 text-lg font-medium text-green-800">{t('emergency.stayCalm')}</h3>
              </div>
              <p className="text-green-700 text-sm">{t('emergency.calmInstructions')}</p>
            </div>
          </div>
        </Section>
        
        {/* Dicas de segurança adicionais */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('emergency.additionalTips')}</h2>
            
            <div className="space-y-4">
              <div className="flex">
                <div className="flex-shrink-0 h-6 w-6 bg-red-100 text-red-800 rounded-full flex items-center justify-center mr-3">
                  1
                </div>
                <p className="text-gray-700">{t('emergency.tip1')}</p>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 h-6 w-6 bg-red-100 text-red-800 rounded-full flex items-center justify-center mr-3">
                  2
                </div>
                <p className="text-gray-700">{t('emergency.tip2')}</p>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 h-6 w-6 bg-red-100 text-red-800 rounded-full flex items-center justify-center mr-3">
                  3
                </div>
                <p className="text-gray-700">{t('emergency.tip3')}</p>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 h-6 w-6 bg-red-100 text-red-800 rounded-full flex items-center justify-center mr-3">
                  4
                </div>
                <p className="text-gray-700">{t('emergency.tip4')}</p>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 h-6 w-6 bg-red-100 text-red-800 rounded-full flex items-center justify-center mr-3">
                  5
                </div>
                <p className="text-gray-700">{t('emergency.tip5')}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Lembrete de número de emergência */}
        <div className="bg-red-600 text-white rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">{t('emergency.remember')}</h2>
          <p className="mb-4">{t('emergency.emergencyReminder')}</p>
          <div className="flex justify-center space-x-6">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold mb-1">190</span>
              <span className="text-sm">{t('emergency.police')}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold mb-1">192</span>
              <span className="text-sm">{t('emergency.ambulance')}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold mb-1">193</span>
              <span className="text-sm">{t('emergency.fireDepartment')}</span>
            </div>
          </div>
        </div>
      </Container>
    </EmergencyLayout>
  );
};

export default Emergency;