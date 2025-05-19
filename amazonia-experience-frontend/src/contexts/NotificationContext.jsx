import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { fetchAlerts, markAlertAsRead, clearAlerts } from '../redux/slices/notificationsSlice';
import { useAuth } from './AuthContext';

// Criação do contexto
export const NotificationContext = createContext(null);

/**
 * Provedor de notificações da aplicação
 * Gerencia notificações push, alertas do sistema e preferências
 */
export const NotificationProvider = ({ children }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useAuth();
  
  // Estados para gerenciar notificações
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState('default');
  const [pushSubscription, setPushSubscription] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  
  // Seleciona alertas do Redux
  const { alerts, isLoading, error } = useSelector((state) => state.notifications);
  
  // Verificar suporte a notificações push
  useEffect(() => {
    // Verifica se o navegador suporta notificações push
    const checkPushSupport = () => {
      return 'serviceWorker' in navigator && 'PushManager' in window;
    };
    
    // Verifica o status da permissão atual
    const checkPermission = () => {
      return Notification.permission;
    };
    
    // Atualiza os estados
    setPushSupported(checkPushSupport());
    setPushPermission(checkPermission());
  }, []);
  
  // Carregar alertas quando usuário estiver autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserAlerts();
    }
  }, [isAuthenticated, user]);
  
  /**
   * Busca alertas do usuário
   * @param {boolean} showLoading - Se deve mostrar indicador de carregamento
   */
  const fetchUserAlerts = useCallback(async (showLoading = false) => {
    if (!isAuthenticated) return;
    
    try {
      const resultAction = await dispatch(fetchAlerts({
        showLoading
      }));
      
      if (fetchAlerts.fulfilled.match(resultAction)) {
        setLastFetched(new Date());
        
        // Exibe toast para novos alertas não lidos
        const unreadAlerts = resultAction.payload.filter(alert => !alert.is_read);
        
        if (unreadAlerts.length > 0) {
          // Se houver muitos alertas, agrupa em uma mensagem
          if (unreadAlerts.length > 3) {
            toast.info(t('notifications.newAlertsCount', { count: unreadAlerts.length }));
          } else {
            // Se houver poucos, mostra cada um
            unreadAlerts.forEach(alert => {
              const toastType = getAlertToastType(alert.alert_type);
              toast[toastType](alert.title);
            });
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
    }
  }, [isAuthenticated, dispatch, t]);
  
  /**
   * Solicita permissão para notificações push
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  const requestPushPermission = useCallback(async () => {
    if (!pushSupported) {
      toast.error(t('notifications.pushNotSupported'));
      return false;
    }
    
    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);
      
      if (permission === 'granted') {
        // Se a permissão foi concedida, configura a assinatura
        await subscribeToPush();
        return true;
      } else {
        toast.info(t('notifications.pushPermissionDenied'));
        return false;
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão de notificações:', error);
      toast.error(t('notifications.pushPermissionError'));
      return false;
    }
  }, [pushSupported, t]);
  
  /**
   * Assina notificações push
   * @returns {Promise<PushSubscription|null>} - Assinatura push ou null
   */
  const subscribeToPush = useCallback(async () => {
    if (!pushSupported || Notification.permission !== 'granted') {
      return null;
    }
    
    try {
      // Registrar o service worker se ainda não estiver registrado
      const registration = await navigator.serviceWorker.ready;
      
      // Verificar se já existe uma assinatura
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Se não houver assinatura, cria uma nova
        const vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;
        
        if (!vapidPublicKey) {
          console.error('Chave VAPID pública não configurada');
          return null;
        }
        
        // Converte a chave VAPID para o formato esperado
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
        
        // Cria a assinatura
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });
      }
      
      // Salva a assinatura no estado
      setPushSubscription(subscription);
      
      // Envia a assinatura para o servidor (via API)
      await sendSubscriptionToServer(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Erro ao assinar notificações push:', error);
      toast.error(t('notifications.pushSubscriptionError'));
      return null;
    }
  }, [pushSupported, t]);
  
  /**
   * Cancela a assinatura de notificações push
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  const unsubscribeFromPush = useCallback(async () => {
    if (!pushSupported) {
      return false;
    }
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        // Cancela a assinatura
        await subscription.unsubscribe();
        
        // Remove a assinatura do servidor
        await deleteSubscriptionFromServer(subscription);
        
        setPushSubscription(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao cancelar assinatura de notificações push:', error);
      toast.error(t('notifications.pushUnsubscriptionError'));
      return false;
    }
  }, [pushSupported, t]);
  
  /**
   * Envia a assinatura push para o servidor
   * @param {PushSubscription} subscription - Assinatura push
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  const sendSubscriptionToServer = async (subscription) => {
    if (!isAuthenticated || !subscription) return false;
    
    try {
      // API para salvar a assinatura do usuário
      const response = await fetch('/api/users/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
      });
      
      return response.ok;
    } catch (error) {
      console.error('Erro ao enviar assinatura push para o servidor:', error);
      return false;
    }
  };
  
  /**
   * Remove a assinatura push do servidor
   * @param {PushSubscription} subscription - Assinatura push
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  const deleteSubscriptionFromServer = async (subscription) => {
    if (!isAuthenticated || !subscription) return false;
    
    try {
      // API para remover a assinatura do usuário
      const response = await fetch('/api/users/push-subscription', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ endpoint: subscription.endpoint })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Erro ao remover assinatura push do servidor:', error);
      return false;
    }
  };
  
  /**
   * Marca um alerta como lido
   * @param {number} alertId - ID do alerta
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  const markAsRead = useCallback(async (alertId) => {
    if (!isAuthenticated) return false;
    
    try {
      const resultAction = await dispatch(markAlertAsRead(alertId));
      return markAlertAsRead.fulfilled.match(resultAction);
    } catch (error) {
      console.error('Erro ao marcar alerta como lido:', error);
      return false;
    }
  }, [isAuthenticated, dispatch]);
  
  /**
   * Limpa todos os alertas
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  const clearAllAlerts = useCallback(async () => {
    if (!isAuthenticated) return false;
    
    try {
      const resultAction = await dispatch(clearAlerts());
      return clearAlerts.fulfilled.match(resultAction);
    } catch (error) {
      console.error('Erro ao limpar alertas:', error);
      return false;
    }
  }, [isAuthenticated, dispatch]);
  
  /**
   * Exibe uma notificação ao usuário
   * @param {string} title - Título da notificação
   * @param {Object} options - Opções da notificação
   */
  const showNotification = useCallback((title, options = {}) => {
    // Se não houver suporte a Notification API, usa toast
    if (!('Notification' in window)) {
      const toastType = options.type || 'info';
      toast[toastType](title, options);
      return;
    }
    
    // Se a permissão não foi concedida, usa toast
    if (Notification.permission !== 'granted') {
      const toastType = options.type || 'info';
      toast[toastType](title, options);
      return;
    }
    
    // Mostra notificação nativa
    try {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          body: options.body,
          icon: options.icon || '/logo192.png',
          badge: options.badge || '/logo192.png',
          vibrate: options.vibrate || [200, 100, 200],
          tag: options.tag,
          data: options.data,
          actions: options.actions || []
        });
      });
    } catch (error) {
      console.error('Erro ao mostrar notificação:', error);
      // Fallback para toast
      const toastType = options.type || 'info';
      toast[toastType](title, options);
    }
  }, []);
  
  /**
   * Define o tipo de toast com base no tipo de alerta
   * @param {string} alertType - Tipo de alerta
   * @returns {string} - Tipo de toast
   */
  const getAlertToastType = (alertType) => {
    switch (alertType) {
      case 'emergency_alert':
        return 'error';
      case 'event_reminder':
        return 'info';
      case 'quiz_available':
        return 'success';
      case 'system_notification':
      default:
        return 'info';
    }
  };
  
  /**
   * Converte uma string base64 para Uint8Array
   * (Necessário para as chaves VAPID)
   * @param {string} base64String - String em base64
   * @returns {Uint8Array} - Array de bytes
   */
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
      
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  };
  
  // Filtra alertas por tipo
  const getAlertsByType = useCallback((type) => {
    return alerts.filter(alert => alert.alert_type === type);
  }, [alerts]);
  
  // Obtém alertas não lidos
  const getUnreadAlerts = useCallback(() => {
    return alerts.filter(alert => !alert.is_read);
  }, [alerts]);
  
  // Valores expostos pelo contexto
  const value = {
    // Estados
    pushSupported,
    pushPermission,
    pushSubscription,
    alerts,
    isLoading,
    error,
    lastFetched,
    
    // Funções
    fetchUserAlerts,
    requestPushPermission,
    subscribeToPush,
    unsubscribeFromPush,
    markAsRead,
    clearAllAlerts,
    showNotification,
    getAlertsByType,
    getUnreadAlerts,
    
    // Helpers
    hasUnreadAlerts: alerts.some(alert => !alert.is_read),
    unreadAlertsCount: alerts.filter(alert => !alert.is_read).length,
    emergencyAlerts: getAlertsByType('emergency_alert'),
    eventReminders: getAlertsByType('event_reminder'),
    quizNotifications: getAlertsByType('quiz_available'),
    systemNotifications: getAlertsByType('system_notification')
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook personalizado para usar o contexto de notificações
export const useNotifications = () => {
  const context = React.useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
  }
  
  return context;
};

export default { NotificationContext, NotificationProvider, useNotifications };