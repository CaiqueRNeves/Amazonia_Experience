import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import { login } from '../../redux/slices/authSlice';
import Button from '../common/Button';
import Input from '../common/Input';
import Loader from '../common/Loader';

/**
 * Formulário de login dos usuários
 * Gerencia entrada de email/senha e interação com a API
 */
const LoginForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Estados locais
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
    
    if (!formData.email.trim()) {
      newErrors.email = t('auth.errors.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.errors.invalidEmail');
    }
    
    if (!formData.password) {
      newErrors.password = t('auth.errors.passwordRequired');
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
      // Dispara a ação de login usando Redux
      const resultAction = await dispatch(login(formData));
      
      // Se o login foi bem-sucedido
      if (login.fulfilled.match(resultAction)) {
        toast.success(t('auth.loginSuccess'));
        
        // Redireciona para a página inicial ou a página que estava tentando acessar
        const from = location.state?.from || '/';
        navigate(from, { replace: true });
      } else {
        // Se houve erro, trata especificamente
        const errorMessage = resultAction.error.message;
        toast.error(errorMessage || t('auth.loginError'));
      }
    } catch (error) {
      // Erro genérico
      toast.error(t('auth.loginError'));
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h2 className="text-2xl font-semibold text-amazon-green-600 mb-6 text-center">
        {t('auth.loginTitle')}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email input */}
        <Input
          label={t('auth.email')}
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="email@exemplo.com"
          error={errors.email}
          required
          autoFocus
        />
        
        {/* Password input */}
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
        
        {/* Forgot password link */}
        <div className="text-right">
          <Link 
            to="/forgot-password" 
            className="text-sm text-amazon-river hover:text-amazon-river-600 transition-colors"
          >
            {t('auth.forgotPassword')}
          </Link>
        </div>
        
        {/* Submit button */}
        <Button
          type="submit"
          fullWidth
          disabled={isLoading}
          className="bg-amazon-green hover:bg-amazon-green-700"
        >
          {isLoading ? (
            <Loader size="sm" color="white" />
          ) : (
            t('auth.loginButton')
          )}
        </Button>
        
        {/* Register link */}
        <div className="text-center mt-4">
          <span className="text-gray-600">{t('auth.noAccount')} </span>
          <Link 
            to="/register" 
            className="text-amazon-river hover:text-amazon-river-600 transition-colors font-medium"
          >
            {t('auth.registerNow')}
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;