import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { resetPassword } from '../../api/auth';
import Button from '../common/Button';
import Input from '../common/Input';
import Loader from '../common/Loader';

/**
 * Formulário de redefinição de senha
 * Usado após o usuário clicar no link recebido por email
 */
const ResetPasswordForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Estados locais
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [token, setToken] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Extrai o token da URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenFromUrl = searchParams.get('token');
    
    if (!tokenFromUrl) {
      toast.error(t('auth.invalidResetLink'));
      navigate('/forgot-password');
      return;
    }
    
    setToken(tokenFromUrl);
  }, [location.search, navigate, t]);

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
      // Chama a API para redefinir a senha
      await resetPassword(token, formData.password);
      
      // Marca como sucesso para mostrar mensagem
      setIsSuccess(true);
      
      // Limpa o formulário
      setFormData({
        password: '',
        confirmPassword: '',
      });
      
      // Redireciona para login após alguns segundos
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (error) {
      // Erro específico
      const errorMessage = error.response?.data?.message || t('auth.resetPasswordError');
      toast.error(errorMessage);
      
      // Se o token for inválido ou expirado, redireciona para a página de recuperação
      if (error.response?.status === 400) {
        navigate('/forgot-password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Se a redefinição foi bem-sucedida, mostra mensagem de sucesso
  if (isSuccess) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg 
              className="h-6 w-6 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900">
            {t('auth.resetPasswordSuccess')}
          </h3>
          
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {t('auth.redirectingToLogin')}
            </p>
          </div>
          
          <div className="mt-6">
            <Link
              to="/login"
              className="text-amazon-river hover:text-amazon-river-600 transition-colors"
            >
              {t('auth.goToLoginNow')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h2 className="text-2xl font-semibold text-amazon-green-600 mb-6 text-center">
        {t('auth.resetPasswordTitle')}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nova senha */}
        <Input
          label={t('auth.newPassword')}
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          error={errors.password}
          required
          autoFocus
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
            t('auth.resetPasswordButton')
          )}
        </Button>
      </form>
    </div>
  );
};

export default ResetPasswordForm;