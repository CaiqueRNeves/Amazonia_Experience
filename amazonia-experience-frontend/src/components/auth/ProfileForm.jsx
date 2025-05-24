import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { updateProfile } from '../../redux/slices/authSlice';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Loader from '../common/Loader';
import { countries } from '../../utils/constants';

/**
 * Formulário de edição de perfil do usuário
 * Permite atualizar informações pessoais
 */
const ProfileForm = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);

  // Estados locais
  const [formData, setFormData] = useState({
    name: '',
    nationality: '',
  });
  const [errors, setErrors] = useState({});

  // Carrega os dados do usuário quando o componente montar
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        nationality: user.nationality || '',
      });
    }
  }, [user]);

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
    
    if (!formData.name.trim()) {
      newErrors.name = t('auth.errors.nameRequired');
    } else if (formData.name.trim().length < 3) {
      newErrors.name = t('auth.errors.nameLength');
    }
    
    if (!formData.nationality) {
      newErrors.nationality = t('auth.errors.nationalityRequired');
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
      // Dispara a ação de atualização do perfil
      const resultAction = await dispatch(updateProfile(formData));
      
      // Se a atualização foi bem-sucedida
      if (updateProfile.fulfilled.match(resultAction)) {
        toast.success(t('profile.updateSuccess'));
      } else {
        // Se houve erro, trata especificamente
        const errorMessage = resultAction.error.message;
        toast.error(errorMessage || t('profile.updateError'));
      }
    } catch (error) {
      // Erro genérico
      toast.error(t('profile.updateError'));
      console.error('Profile update error:', error);
    }
  };

  // Se ainda não há dados do usuário, mostra um carregador
  if (!user && !isLoading) {
    return <Loader />;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h3 className="text-xl font-semibold text-amazon-green-600 mb-4">
        {t('profile.personalInfo')}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email (apenas visualização) */}
        <Input
          label={t('auth.email')}
          type="email"
          value={user?.email || ''}
          disabled
          readOnly
          className="bg-gray-50"
        />
        
        {/* Nome completo */}
        <Input
          label={t('auth.name')}
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder={t('auth.namePlaceholder')}
          error={errors.name}
          required
        />
        
        {/* Nacionalidade */}
        <Select
          label={t('auth.nationality')}
          name="nationality"
          value={formData.nationality}
          onChange={handleChange}
          error={errors.nationality}
          required
        >
          <option value="">{t('auth.selectNationality')}</option>
          {countries.map((country) => (
            <option key={country.code} value={country.name}>
              {country.name}
            </option>
          ))}
        </Select>
        
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
              t('profile.saveButton')
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
