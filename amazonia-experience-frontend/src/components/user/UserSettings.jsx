import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import {
  updateNotificationPreferences,
  changePassword
} from '../../redux/slices/userSlice';
import { Card, Form, Input, Switch, Button, Tabs, TabPane } from '../ui';
import { useForm } from '../../hooks';

const UserSettings = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { user, isLoading, isUpdating } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState('notifications');

  // Configurações de notificação
  const [notifications, setNotifications] = useState({
    events: true,
    rewards: true,
    quizzes: true,
    emergency: true
  });

  useEffect(() => {
    if (user?.notification_preferences) {
      setNotifications(user.notification_preferences);
    }
  }, [user]);

  const handleNotificationChange = (key) => {
    const updatedPreferences = {
      ...notifications,
      [key]: !notifications[key]
    };
    
    setNotifications(updatedPreferences);
    dispatch(updateNotificationPreferences(updatedPreferences));
    toast.success(t('settings.notificationUpdated'));
  };

  // Formulário de alteração de senha
  const passwordValidate = (values) => {
    const errors = {};
    
    if (!values.currentPassword) {
      errors.currentPassword = t('validation.required');
    }
    
    if (!values.newPassword) {
      errors.newPassword = t('validation.required');
    } else if (values.newPassword.length < 6) {
      errors.newPassword = t('validation.passwordLength');
    }
    
    if (!values.confirmPassword) {
      errors.confirmPassword = t('validation.required');
    } else if (values.confirmPassword !== values.newPassword) {
      errors.confirmPassword = t('validation.passwordMatch');
    }
    
    return errors;
  };

  const {
    values: passwordValues,
    errors: passwordErrors,
    handleChange: handlePasswordChange,
    handleSubmit: handlePasswordSubmit,
    resetForm: resetPasswordForm
  } = useForm(
    {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    async (formData) => {
      try {
        await dispatch(changePassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })).unwrap();
        
        toast.success(t('settings.passwordChanged'));
        resetPasswordForm();
      } catch (err) {
        toast.error(t('settings.passwordError'));
      }
    },
    passwordValidate
  );

  // Seleção de idioma
  const languages = [
    { value: 'pt-BR', label: 'Português' },
    { value: 'en-US', label: 'English' },
    { value: 'es-ES', label: 'Español' },
    { value: 'fr-FR', label: 'Français' },
    { value: 'de-DE', label: 'Deutsch' },
    { value: 'zh-CN', label: '中文' },
    { value: 'ru-RU', label: 'Русский' }
  ];

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    toast.success(t('settings.languageChanged'));
  };

  return (
    <div className="user-settings">
      <Card>
        <h2>{t('settings.title')}</h2>
        
        <Tabs active={activeTab} onChange={setActiveTab}>
          <TabPane id="notifications" title={t('settings.notifications')}>
            <div className="notification-settings">
              <h3>{t('settings.notificationPreferences')}</h3>
              
              <Form.Group className="notification-item">
                <div className="notification-label">
                  <Form.Label>{t('settings.notifyEvents')}</Form.Label>
                  <p className="text-muted">{t('settings.notifyEventsDesc')}</p>
                </div>
                <Switch
                  checked={notifications.events}
                  onChange={() => handleNotificationChange('events')}
                  disabled={isUpdating}
                />
              </Form.Group>

              <Form.Group className="notification-item">
                <div className="notification-label">
                  <Form.Label>{t('settings.notifyRewards')}</Form.Label>
                  <p className="text-muted">{t('settings.notifyRewardsDesc')}</p>
                </div>
                <Switch
                  checked={notifications.rewards}
                  onChange={() => handleNotificationChange('rewards')}
                  disabled={isUpdating}
                />
              </Form.Group>

              <Form.Group className="notification-item">
                <div className="notification-label">
                  <Form.Label>{t('settings.notifyQuizzes')}</Form.Label>
                  <p className="text-muted">{t('settings.notifyQuizzesDesc')}</p>
                </div>
                <Switch
                  checked={notifications.quizzes}
                  onChange={() => handleNotificationChange('quizzes')}
                  disabled={isUpdating}
                />
              </Form.Group>

              <Form.Group className="notification-item">
                <div className="notification-label">
                  <Form.Label>{t('settings.notifyEmergency')}</Form.Label>
                  <p className="text-muted">{t('settings.notifyEmergencyDesc')}</p>
                </div>
                <Switch
                  checked={notifications.emergency}
                  onChange={() => handleNotificationChange('emergency')}
                  disabled={isUpdating}
                />
              </Form.Group>
            </div>
          </TabPane>
          
          <TabPane id="password" title={t('settings.security')}>
            <div className="password-settings">
              <h3>{t('settings.changePassword')}</h3>
              
              <Form onSubmit={handlePasswordSubmit}>
                <Form.Group>
                  <Form.Label htmlFor="currentPassword">
                    {t('settings.currentPassword')}
                  </Form.Label>
                  <Input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordValues.currentPassword}
                    onChange={handlePasswordChange}
                    error={passwordErrors.currentPassword}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label htmlFor="newPassword">
                    {t('settings.newPassword')}
                  </Form.Label>
                  <Input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordValues.newPassword}
                    onChange={handlePasswordChange}
                    error={passwordErrors.newPassword}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label htmlFor="confirmPassword">
                    {t('settings.confirmPassword')}
                  </Form.Label>
                  <Input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordValues.confirmPassword}
                    onChange={handlePasswordChange}
                    error={passwordErrors.confirmPassword}
                  />
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading || isUpdating}
                >
                  {isUpdating ? t('common.saving') : t('settings.updatePassword')}
                </Button>
              </Form>
            </div>
          </TabPane>
          
          <TabPane id="language" title={t('settings.language')}>
            <div className="language-settings">
              <h3>{t('settings.selectLanguage')}</h3>
              
              <Form.Group>
                <Form.Label htmlFor="language">
                  {t('settings.appLanguage')}
                </Form.Label>
                <select
                  id="language"
                  value={i18n.language}
                  onChange={handleLanguageChange}
                  className="form-select"
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </Form.Group>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default UserSettings;