import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { BellIcon, BellSlashIcon, CheckIcon } from '@heroicons/react/24/outline';

import { useToast } from '../../hooks/useToast';
import { notificationService } from '../../services';

const EventReminder = ({ event }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [reminderSet, setReminderSet] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Verificar se o evento já está no passado
  const isPastEvent = new Date(event.end_time) < new Date();
  
  // Verificar se o usuário já configurou um lembrete para este evento
  useEffect(() => {
    const checkExistingReminder = async () => {
      if (!isAuthenticated || !user) return;
      
      try {
        // Supondo que há um endpoint para verificar lembretes existentes
        const response = await notificationService.checkEventReminder(event.id);
        setReminderSet(response.exists);
      } catch (error) {
        console.error('Erro ao verificar lembrete:', error);
      }
    };
    
    checkExistingReminder();
  }, [isAuthenticated, user, event.id]);
  
  // Configurar lembrete para o evento
  const setReminder = async () => {
    if (!isAuthenticated) {
      showToast(t('auth.loginRequired'), 'info');
      return;
    }
    
    try {
      setLoading(true);
      
      // Verificar permissão para notificações
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        
        if (permission !== "granted") {
          showToast(t('notifications.permissionDenied'), 'warning');
          return;
        }
      }
      
      // Criar lembrete para o evento
      await notificationService.setEventReminder(event.id);
      
      setReminderSet(true);
      showToast(t('events.reminderSet'), 'success');
    } catch (error) {
      console.error('Erro ao configurar lembrete:', error);
      showToast(t('events.reminderError'), 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Remover lembrete para o evento
  const removeReminder = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      
      // Remover lembrete para o evento
      await notificationService.removeEventReminder(event.id);
      
      setReminderSet(false);
      showToast(t('events.reminderRemoved'), 'success');
    } catch (error) {
      console.error('Erro ao remover lembrete:', error);
      showToast(t('events.reminderRemoveError'), 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Se o evento já passou, não mostrar botão de lembrete
  if (isPastEvent) {
    return null;
  }
  
  return (
    <div className="event-reminder">
      {reminderSet ? (
        <button
          onClick={removeReminder}
          className="btn btn-reminder active"
          disabled={loading}
          aria-label={t('events.removeReminder')}
        >
          <CheckIcon className="icon" />
          <span>{t('events.reminderActive')}</span>
        </button>
      ) : (
        <button
          onClick={setReminder}
          className="btn btn-reminder"
          disabled={loading}
          aria-label={t('events.setReminder')}
        >
          <BellIcon className="icon" />
          <span>{t('events.reminder')}</span>
        </button>
      )}
    </div>
  );
};

export default EventReminder;