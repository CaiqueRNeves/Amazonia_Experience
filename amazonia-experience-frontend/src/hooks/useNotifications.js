import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

/**
 * Hook personalizado para gerenciar notificações do sistema
 * Inclui suporte a notificações push, caso permitido pelo usuário
 * 
 * @returns {Object} Funções e estados para gerenciar notificações
 */
const useNotifications = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  // Estados locais
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState('default');
  const [pushSubscription, setPushSubscription] = useState(null);
  
  // Seleciona as notificações do Redux
  const { alerts, isLoading, error } = useSelector((state) => state.notifications);
  
  // Importa as ações do Redux
  const { 
    fetchAlerts, 
    markAlertAsRead, 
    clearAlerts 
  } = require('../redux/slices/notificationsSlice');
  
  // Verificar suporte a notificações push quando o componente montar
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
    
    // Carrega as notificações ao montar o componente
    dispatch(fetchAlerts());
  }, [dispatch, fetchAlerts]);
  
  // Função para solicitar permissão de notificações push
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
      console.error('Error requesting push permission:', error);
      toast.error(t('notifications.pushPermissionError'));
      return false;
    }
  }, [pushSupported, t]);
  
  // Função para assinar notificações push
  const subscribeToPush = useCallback(async () => {
    if (!pushSupported || Notification.permission !== 'granted') {
      return null;
    }
    
    try {
      // Obter o service worker registrado
      const registration = await navigator.serviceWorker.ready;
      
      // Obter a assinatura existente ou criar uma nova
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Se não houver assinatura, cria uma nova
        const vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
        
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });
      }
      
      // Salva a assinatura no estado
      setPushSubscription(subscription);
      
      // Envia a assinatura para o servidor (implementação dependente da API)
      await sendSubscriptionToServer(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast.error(t('notifications.pushSubscriptionError'));
      return null;
    }
  }, [pushSupported, t]);
  
  // Função para cancelar a assinatura de notificações push
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
      console.error('Error unsubscribing from push notifications:', error);
      toast.error(t('notifications.pushUnsubscriptionError'));
      return false;
    }
  }, [pushSupported, t]);
  
  // Função para enviar a assinatura ao servidor
  const sendSubscriptionToServer = async (subscription) => {
    // Implementação dependente da API do backend
    try {
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error sending push subscription to server:', error);
      return false;
    }
  };
  
  // Função para remover a assinatura do servidor
  const deleteSubscriptionFromServer = async (subscription) => {
    // Implementação dependente da API do backend
    try {
      const response = await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error removing push subscription from server:', error);
      return false;
    }
  };
  
  // Função para marcar um alerta como lido
  const markAsRead = useCallback((alertId) => {
    dispatch(markAlertAsRead(alertId));
  }, [dispatch, markAlertAsRead]);
  
  // Função para limpar todos os alertas
  const clearAllAlerts = useCallback(() => {
    dispatch(clearAlerts());
  }, [dispatch, clearAlerts]);
  
  // Função para mostrar uma notificação local
  const showNotification = useCallback((title, options = {}) => {
    // Mostra um toast se as notificações do navegador não estiverem disponíveis
    // ou se a permissão não for concedida
    if (!pushSupported || Notification.permission !== 'granted') {
      toast(title, {
        type: options.type || 'info',
        ...options
      });
      return;
    }
    
    // Mostra uma notificação do navegador
    try {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          icon: '/logo192.png',
          badge: '/logo192.png',
          ...options
        });
      });
    } catch (error) {
      console.error('Error showing notification:', error);
      // Fallback para toast
      toast(title, {
        type: options.type || 'info',
        ...options
      });
    }
  }, [pushSupported]);
  
  // Função auxiliar para converter a chave VAPID
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
  
  return {
    // Estados
    alerts,
    isLoading,
    error,
    pushSupported,
    pushPermission,
    pushSubscription,
    
    // Funções
    requestPushPermission,
    subscribeToPush,
    unsubscribeFromPush,
    markAsRead,
    clearAllAlerts,
    showNotification,
    
    // Métodos auxiliares
    hasUnreadAlerts: alerts.some(alert => !alert.is_read),
    unreadAlertsCount: alerts.filter(alert => !alert.is_read).length,
    emergencyAlerts: alerts.filter(alert => alert.alert_type === 'emergency_alert')
  };
};

export default useNotifications;