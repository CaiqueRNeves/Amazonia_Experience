import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { updateNotificationPreferences } from '../../redux/slices/authSlice';
import Button from '../common/Button';
import Switch from '../common/Switch';
import Loader from '../common/Loader';

/**
 * Componente para configuração de preferências de notificação
 */
const NotificationSettings = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);

  // Estado local para preferências
  const [preferences, setPreferences] = useState({
    events: true,
    rewards: true,
    quizzes: true,
    emergency: true
  });

  // Carrega as preferências do usuário quando o componente montar
  useEffect(() => {
    if (user?.notification_preferences) {
      setPreferences(user.notification_preferences);
    }
  }, [user]);

  // Handler para alteração de preferência
  const handleToggle = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Handler para salvar preferências
  const handleSave = async () => {
    try {
      // Dispara a ação de atualização de preferências
      const resultAction = await dispatch(updateNotificationPreferences(preferences));
      
      // Se a atualização foi bem-sucedida
      if (updateNotificationPreferences.fulfilled.match(resultAction)) {
        toast.success(t('profile.preferencesUpdateSuccess'));
      } else {
        // Se houve erro, trata especificamente
        const errorMessage = resultAction.error.message;
        toast.error(errorMessage || t('profile.preferencesUpdateError'));
      }
    } catch (error) {
      // Erro genérico
      toast.error(t('profile.preferencesUpdateError'));
      console.error('Notification preferences update error:', error);
    }
  };

  // Se ainda não há dados do usuário, mostra um carregador
  if (!user && !isLoading) {
    return <Loader />;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h3 className="text-xl font-semibold text-amazon-green-600 mb-4">
        {t('profile.notificationPreferences')}
      </h3>
      
      <div className="space-y-4">
        {/* Explicação */}
        <p className="text-sm text-gray-600 mb-2">
          {t('profile.notificationExplanation')}
        </p>
        
        {/* Notificações de eventos */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-800">
              {t('profile.eventNotifications')}
            </h4>
            <p className="text-sm text-gray-600">
              {t('profile.eventNotificationsDesc')}
            </p>
          </div>
          <Switch
            checked={preferences.events}
            onChange={() => handleToggle('events')}
            aria-label={t('profile.eventNotifications')}
          />
        </div>
        
        {/* Notificações de recompensas */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-800">
              {t('profile.rewardNotifications')}
            </h4>
            <p className="text-sm text-gray-600">
              {t('profile.rewardNotificationsDesc')}
            </p>
          </div>
          <Switch
            checked={preferences.rewards}
            onChange={() => handleToggle('rewards')}
            aria-label={t('profile.rewardNotifications')}
          />
        </div>
        
        {/* Notificações de quizzes */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-800">
              {t('profile.quizNotifications')}
            </h4>
            <p className="text-sm text-gray-600">
              {t('profile.quizNotificationsDesc')}
            </p>
          </div>
          <Switch
            checked={preferences.quizzes}
            onChange={() => handleToggle('quizzes')}
            aria-label={t('profile.quizNotifications')}
          />
        </div>
        
        {/* Notificações de emergência */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-800">
              {t('profile.emergencyNotifications')}
            </h4>
            <p className="text-sm text-gray-600">
              {t('profile.emergencyNotificationsDesc')}
            </p>
          </div>
          <Switch
            checked={preferences.emergency}
            onChange={() => handleToggle('emergency')}
            aria-label={t('profile.emergencyNotifications')}
          />
        </div>
        
        {/* Nota sobre notificações de emergência */}
        <div className="text-xs text-gray-500 italic mt-2">
          {t('profile.emergencyNotificationsNote')}
        </div>
        
        {/* Botão de salvar */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-amazon-green hover:bg-amazon-green-700"
          >
            {isLoading ? (
              <Loader size="sm" color="white" />
            ) : (
              t('profile.savePreferencesButton')
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;