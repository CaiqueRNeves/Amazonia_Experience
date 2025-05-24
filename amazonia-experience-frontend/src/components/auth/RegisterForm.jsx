import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import { register } from '../../redux/slices/authSlice';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Loader from '../common/Loader';
import { countries } from '../../utils/constants';

/**
 * Formulário de registro de novos usuários
 * Gerencia entrada de dados e validações
 */
const RegisterForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Estados locais
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    nationality: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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
    
    if (!formData.email.trim()) {
      newErrors.email = t('auth.errors.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.errors.invalidEmail');
    }
    
    if (!formData.password) {
      newErrors.password = t('auth.errors.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.errors.passwordLength');
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = t('auth.errors.passwordUppercase');
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = t('auth.errors.passwordNumber');
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.errors.passwordsMatch');
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
    
    setIsLoading(true);
    
    try {
      // Prepara os dados para envio
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        nationality: formData.nationality,
      };
      
      // Dispara a ação de registro usando Redux
      const resultAction = await dispatch(register(userData));
      
      // Se o registro foi bem-sucedido
      if (register.fulfilled.match(resultAction)) {
        toast.success(t('auth.registerSuccess'));
        navigate('/verify-email-sent');
      } else {
        // Se houve erro, trata especificamente
        const errorMessage = resultAction.error.message;
        toast.error(errorMessage || t('auth.registerError'));
      }
    } catch (error) {
      // Erro genérico
      toast.error(t('auth.registerError'));
      console.error('Register error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h2 className="text-2xl font-semibold text-amazon-green-600 mb-6 text-center">
        {t('auth.registerTitle')}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
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
          autoFocus
        />
        
        {/* Email */}
        <Input
          label={t('auth.email')}
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="email@exemplo.com"
          error={errors.email}
          required
        />
        
        {/* Senha */}
        <Input
          label={t('auth.password')}
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          error={errors.password}
          required
        />
        
        {/* Confirmar senha */}
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
        
        {/* Informação sobre verificação de email */}
        <div className="text-xs text-gray-600 italic">
          {t('auth.verificationInfo')}
        </div>
        
        {/* Botão de registro */}
        <Button
          type="submit"
          fullWidth
          disabled={isLoading}
          className="bg-amazon-green hover:bg-amazon-green-700 mt-4"
        >
          {isLoading ? (
            <Loader size="sm" color="white" />
          ) : (
            t('auth.registerButton')
          )}
        </Button>
        
        {/* Link para login */}
        <div className="text-center mt-4">
          <span className="text-gray-600">{t('auth.alreadyHaveAccount')} </span>
          <Link 
            to="/login" 
            className="text-amazon-river hover:text-amazon-river-600 transition-colors font-medium"
          >
            {t('auth.loginHere')}
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;