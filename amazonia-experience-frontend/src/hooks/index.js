/**
 * Índice de hooks personalizados
 * Exporta todos os hooks da aplicação para facilitar importações
 */

// Importação de hooks
import useAuth from './useAuth';
import useForm from './useForm';
import useGeolocation from './useGeolocation';
import useMap from './useMap';
import useNearby from './useNearby';
import useOfflineStorage from './useOfflineStorage';
import useQuiz from './useQuiz';
import useRewards from './useRewards';
import useCheckIn from './useCheckIn';
import useChatbot from './useChatbot';
import useEmergency from './useEmergency';
import useLocalStorage from './useLocalStorage';
import useNetworkStatus from './useNetworkStatus';
import useTranslations from './useTranslations';
import useNotifications from './useNotifications';
import useDebounce from './useDebounce';
import useModal from './useModal';

// Exportação de hooks
export {
  useAuth,
  useForm,
  useGeolocation,
  useMap,
  useNearby,
  useOfflineStorage,
  useQuiz,
  useRewards,
  useCheckIn,
  useChatbot,
  useEmergency,
  useLocalStorage,
  useNetworkStatus,
  useTranslations,
  useNotifications,
  useDebounce,
  useModal
};

// Exportação padrão
export default {
  useAuth,
  useForm,
  useGeolocation,
  useMap,
  useNearby,
  useOfflineStorage,
  useQuiz,
  useRewards,
  useCheckIn,
  useChatbot,
  useEmergency,
  useLocalStorage,
  useNetworkStatus,
  useTranslations,
  useNotifications,
  useDebounce,
  useModal
};