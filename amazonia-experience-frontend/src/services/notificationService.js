import apiService from './apiService';
import errorService from './errorService';
import i18nService from './i18nService';
import { toast } from 'react-toastify';

/**
 * Serviço para gerenciamento de notificações
 * Gerencia notificações push, alertas e toasts do sistema
 */
const notificationService = {
  /**
   * Obtém alertas do usuário
   * @param {boolean} includeRead - Incluir alertas já lidos
   * @param {Object} params - Parâmetros adicionais (página, limite)
   * @returns {Promise<Object>} Alertas do usuário
   */
  async getAlerts(includeRead = false, params = {}) {
    try {
      const queryParams = {
        ...params,
        include_read: includeRead
      };
      
      const response = await apiService.get('/users/alerts', { params: queryParams });
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao obter alertas do usuário',
        error
      });
      throw error;
    }
  },

  /**
   * Marca um alerta como lido
   * @param {number} alertId - ID do alerta
   * @returns {Promise<Object>} Confirmação da operação
   */
  async markAlertAsRead(alertId) {
    try {
      const response = await apiService.put(`/users/alerts/${alertId}/read`);
      return response.data;
    } catch (error) {
      errorService.logError({
        message: `Erro ao marcar alerta ${alertId} como lido`,
        error
      });
      throw error;
    }
  },

  /**
   * Exibe uma notificação toast
   * @param {string} message - Mensagem a ser exibida
   * @param {string} type - Tipo de notificação (success, error, info, warning)
   * @param {Object} options - Opções de configuração do toast
   */
  showToast(message, type = 'info', options = {}) {
    // Configura o tipo de toast
    switch (type) {
      case 'success':
        toast.success(message, options);
        break;
      case 'error':
        toast.error(message, options);
        break;
      case 'warning':
        toast.warn(message, options);
        break;
      case 'info':
      default:
        toast.info(message, options);
        break;
    }
  },

  /**
   * Verifica se o navegador suporta notificações push
   * @returns {boolean} Verdadeiro se suportado
   */
  isPushSupported() {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  },

  /**
   * Verifica o status da permissão de notificações
   * @returns {string} Status da permissão ('default', 'granted', 'denied')
   */
  getPushPermission() {
    if (!this.isPushSupported()) {
      return 'unsupported';
    }
    
    return Notification.permission;
  },

  /**
   * Solicita permissão para enviar notificações push
   * @returns {Promise<boolean>} Verdadeiro se a permissão foi concedida
   */
  async requestPushPermission() {
    if (!this.isPushSupported()) {
      this.showToast(
        i18nService.translate('notifications.pushNotSupported'),
        'error'
      );
      return false;
    }
    
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        await this.setupPushSubscription();
        return true;
      } else {
        this.showToast(
          i18nService.translate('notifications.pushPermissionDenied'),
          'info'
        );
        return false;
      }
    } catch (error) {
      errorService.logError({
        message: 'Erro ao solicitar permissão para notificações',
        error
      });
      
      this.showToast(
        i18nService.translate('notifications.pushPermissionError'),
        'error'
      );
      
      return false;
    }
  },

  /**
   * Configura assinatura para notificações push
   * @returns {Promise<PushSubscription>} Assinatura push
   */
  async setupPushSubscription() {
    if (!this.isPushSupported() || Notification.permission !== 'granted') {
      return null;
    }
    
    try {
      // Obtém o service worker registrado
      const registration = await navigator.serviceWorker.ready;
      
      // Obtém assinatura existente ou cria uma nova
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Se não houver assinatura, criar uma nova
        const vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;
        
        if (!vapidPublicKey) {
          throw new Error('Chave VAPID pública não configurada');
        }
        
        // Converte a chave VAPID para o formato correto
        const convertedKey = this.urlBase64ToUint8Array(vapidPublicKey);
        
        // Cria a assinatura
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey
        });
      }
      
      // Envia a assinatura para o servidor
      await this.sendSubscriptionToServer(subscription);
      
      return subscription;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao configurar assinatura push',
        error
      });
      
      this.showToast(
        i18nService.translate('notifications.pushSubscriptionError'),
        'error'
      );
      
      return null;
    }
  },

  /**
   * Cancela a assinatura de notificações push
   * @returns {Promise<boolean>} Verdadeiro se a assinatura foi cancelada
   */
  async unsubscribeFromPush() {
    if (!this.isPushSupported()) {
      return false;
    }
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        // Cancela a assinatura
        const result = await subscription.unsubscribe();
        
        if (result) {
          // Remove a assinatura do servidor
          await this.deleteSubscriptionFromServer(subscription);
        }
        
        return result;
      }
      
      return false;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao cancelar assinatura push',
        error
      });
      
      this.showToast(
        i18nService.translate('notifications.pushUnsubscriptionError'),
        'error'
      );
      
      return false;
    }
  },

  /**
   * Envia assinatura para o servidor
   * @param {PushSubscription} subscription - Assinatura a ser enviada
   * @returns {Promise<boolean>} Verdadeiro se a operação foi bem-sucedida
   */
  async sendSubscriptionToServer(subscription) {
    try {
      await apiService.post('/notifications/subscribe', subscription);
      return true;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao enviar assinatura para o servidor',
        error
      });
      return false;
    }
  },

  /**
   * Remove assinatura do servidor
   * @param {PushSubscription} subscription - Assinatura a ser removida
   * @returns {Promise<boolean>} Verdadeiro se a operação foi bem-sucedida
   */
  async deleteSubscriptionFromServer(subscription) {
    try {
      await apiService.post('/notifications/unsubscribe', subscription);
      return true;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao remover assinatura do servidor',
        error
      });
      return false;
    }
  },

  /**
   * Exibe uma notificação local
   * @param {string} title - Título da notificação
   * @param {Object} options - Opções da notificação
   * @returns {Promise<boolean>} Verdadeiro se a notificação foi exibida
   */
  async showNotification(title, options = {}) {
    // Se as notificações do navegador não estiverem disponíveis ou
    // a permissão não for concedida, exibe um toast
    if (!this.isPushSupported() || Notification.permission !== 'granted') {
      this.showToast(title, options.type || 'info');
      return false;
    }
    
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Configura opções padrão
      const defaultOptions = {
        icon: '/images/logo192.png',
        badge: '/images/badge.png',
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          applicationUrl: window.location.origin
        },
        requireInteraction: false,
        silent: false
      };
      
      // Mescla opções padrão com as fornecidas
      const notificationOptions = { ...defaultOptions, ...options };
      
      // Exibe a notificação
      await registration.showNotification(title, notificationOptions);
      return true;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao exibir notificação',
        error
      });
      
      // Fallback para toast
      this.showToast(title, options.type || 'info');
      return false;
    }
  },

  /**
   * Fecha uma notificação específica
   * @param {string} tag - Tag da notificação a ser fechada
   */
  async closeNotification(tag) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const notifications = await registration.getNotifications({ tag });
      
      notifications.forEach(notification => notification.close());
    } catch (error) {
      errorService.logError({
        message: 'Erro ao fechar notificação',
        error
      });
    }
  },

  /**
   * Fecha todas as notificações
   */
  async closeAllNotifications() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const notifications = await registration.getNotifications();
      
      notifications.forEach(notification => notification.close());
    } catch (error) {
      errorService.logError({
        message: 'Erro ao fechar todas as notificações',
        error
      });
    }
  },

  /**
   * Atualiza preferências de notificação
   * @param {Object} preferences - Novas preferências
   * @returns {Promise<Object>} Preferências atualizadas
   */
  async updatePreferences(preferences) {
    try {
      const response = await apiService.put('/users/notification-preferences', preferences);
      return response.data.data;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao atualizar preferências de notificação',
        error
      });
      throw error;
    }
  },

  /**
   * Converte uma chave base64 URL segura para um Uint8Array
   * @param {string} base64String - String em base64
   * @returns {Uint8Array} Array convertido
   */
  urlBase64ToUint8Array(base64String) {
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
  }
};

export default notificationService;