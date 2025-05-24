import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { changePassword } from '../../redux/slices/authSlice';
import Button from '../common/Button';
import Input from '../common/Input';
import Loader from '../common/Loader';

/**
 * Formulário para alteração de senha do usuário
 */
const PasswordChangeForm = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);

  // Estados locais
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  // Handler para mudança nos campos do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Limpa o erro do campo quando ele é editado
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Validação do formulário
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = t('auth.errors.currentPasswordRequired');
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = t('auth.errors.newPasswordRequired');
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = t('auth.errors.passwordLength');
    } else if (!/[A-Z]/.test(formData.newPassword)) {
      newErrors.newPassword = t('auth.errors.passwordUppercase');
    } else if (!/[0-9]/.test(formData.newPassword)) {
      newErrors.newPassword = t('auth.errors.passwordNumber');
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.errors.passwordsMatch');
    }
    
    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = t('auth.errors.passwordsDifferent');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handler para envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Valida o formulário antes de enviar
    if (!validateForm()) {
      return;
    }
    
    try {
      // Prepara os dados para envio
      const passwordData = {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      };
      
      // Dispara a ação de alteração de senha
      const resultAction = await dispatch(changePassword(passwordData));
      
      // Se a alteração foi bem-sucedida
      if (changePassword.fulfilled.match(resultAction)) {
        toast.success(t('profile.passwordChangeSuccess'));
        
        // Limpa o formulário
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        // Se houve erro, trata especificamente
        const errorMessage = resultAction.error.message;
        toast.error(errorMessage || t('profile.passwordChangeError'));
      }
    } catch (error) {
      // Erro genérico
      toast.error(t('profile.passwordChangeError'));
      console.error('Password change error:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h3 className="text-xl font-semibold text-amazon-green-600 mb-4">
        {t('profile.changePassword')}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Senha atual */}
        <Input
          label={t('auth.currentPassword')}
          type="password"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
          placeholder="••••••••"
          error={errors.currentPassword}
          required
        />
        
        {/* Nova senha */}
        <Input
          label={t('auth.newPassword')}
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          placeholder="••••••••"
          error={errors.newPassword}
          required
        />
        
        {/* Confirmar nova senha */}
        <Input
          label={t('auth.confirmPassword')}
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          error={errors.confirmPassword}
          required
        />
        
        {/* Requisitos de senha */}
        <div className="text-xs text-gray-600 space-y-1">
          <p>{t('auth.passwordRequirements.title')}:</p>
          <ul className="list-disc pl-5">
            <li>{t('auth.passwordRequirements.length')}</li>
            <li>{t('auth.passwordRequirements.uppercase')}</li>
            <li>{t('auth.passwordRequirements.number')}</li>
          </ul>
        </div>
        
        {/* Botão de salvar */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-amazon-green hover:bg-amazon-green-700"
          >
            {isLoading ? (
              <Loader size="sm" color="white" />
            ) : (
              t('profile.updatePasswordButton')
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PasswordChangeForm;