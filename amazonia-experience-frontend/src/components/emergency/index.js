/**
 * Exportações da pasta emergency
 * Facilita o acesso a todos os componentes, hooks e utilidades
 */

// Componentes principais
import EmergencyPage from './EmergencyPage';
import EmergencyServiceList from './EmergencyServiceList';
import EmergencyServiceCard from './EmergencyServiceCard';
import EmergencyServiceDetail from './EmergencyServiceDetail';
import EmergencyMap from './EmergencyMap';
import EmergencyContacts from './EmergencyContacts';
import EmergencyPhrases from './EmergencyPhrases';
import EmergencyCallButton from './EmergencyCallButton';
import EmergencyServiceTypes from './EmergencyServiceTypes';
import NearbyEmergencyService from './NearbyEmergencyService';

// Contexto
import EmergencyContext, { EmergencyProvider, useEmergencyContext } from './EmergencyContext';

// Hooks personalizados
import EmergencyHooks from './EmergencyHooks';
const { 
  useEmergency, 
  useNearbyEmergency, 
  useEmergencyContacts, 
  useEmergencyPhrases 
} = EmergencyHooks;

// Utilidades
import EmergencyUtils from './EmergencyUtils';

// Redux Slice
import emergencyReducer, {
  getEmergencyServices,
  getServicesByType,
  getNearbyServices,
  getContactsByLanguage,
  getPhrasesByLanguage,
  getServiceById,
  setSelectedService,
  clearSelectedService,
  setFilters,
  clearFilters
} from './EmergencySlice';

// Estilos
import './Emergency.css';

// Exportações individuais
export {
  // Componentes
  EmergencyPage,
  EmergencyServiceList,
  EmergencyServiceCard,
  EmergencyServiceDetail,
  EmergencyMap,
  EmergencyContacts,
  EmergencyPhrases,
  EmergencyCallButton,
  EmergencyServiceTypes,
  NearbyEmergencyService,
  
  // Contexto
  EmergencyContext,
  EmergencyProvider,
  useEmergencyContext,
  
  // Hooks
  useEmergency,
  useNearbyEmergency,
  useEmergencyContacts,
  useEmergencyPhrases,
  
  // Utilitários
  EmergencyUtils,
  
  // Redux Slice e Actions
  emergencyReducer,
  getEmergencyServices,
  getServicesByType,
  getNearbyServices,
  getContactsByLanguage,
  getPhrasesByLanguage,
  getServiceById,
  setSelectedService,
  clearSelectedService,
  setFilters,
  clearFilters
};

// Exportação padrão
export default EmergencyPage;