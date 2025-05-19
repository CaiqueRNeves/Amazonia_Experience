import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { resendVerificationEmail } from '../../api/auth';
import Button from '../common/Button';
import Input from '../common/Input';
import Loader from '../common/Loader';

/**
 * Componente para reenvio de email de verificação
 */
const ResendVerificationEmail = () => {
  const { t } = useTranslation();

  // Estados locais
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Handler para mudança no campo de email
  const handleChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };

  // Validação do email
  const validateEmail = () => {
    if (!email.trim()) {
      setError(t('auth.errors.emailRequired'));
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t('auth.errors.invalidEmail'));
      return false;
    }
    return true;
  };

  // Handler para envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Valida o email antes de enviar
    if (!validateEmail()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Chama a API para reenviar o email de verificação
      await resendVerificationEmail(email);
      
      // Marca como enviado para mostrar mensagem de sucesso
      setIsSubmitted(true);
      
      // Limpa o campo de email
      setEmail('');
    } catch (error) {
      // Não mostrar erro específico para evitar vazamento de informações
      // Mostramos uma mensagem genérica de sucesso mesmo em caso de erro
      console.error('Resend verification email error:', error);
      
      // Simulamos sucesso para evitar enumeração de emails
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Se já enviou o formulário, mostra mensagem de sucesso
  if (isSubmitted) {
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
            {t('auth.verificationEmailResent')}
          </h3>
          
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {t('auth.checkEmailInbox')}
            </p>
          </div>
          
          <div className="mt-6">
            <Link
              to="/login"
              className="text-amazon-river hover:text-amazon-river-600 transition-colors"
            >
              {t('auth.backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h2 className="text-2xl font-semibold text-amazon-green-600 mb-6 text-center">
        {t('auth.resendVerificationEmailTitle')}
      </h2>
      
      <p className="text-gray-600 mb-6">
        {t('auth.resendVerificationEmailDescription')}
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email input */}
        <Input
          label={t('auth.email')}
          type="email"
          name="email"
          value={email}
          onChange={handleChange}
          placeholder="email@exemplo.com"
          error={error}
          required
          autoFocus
        />
        
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
            t('auth.resendEmailButton')
          )}
        </Button>
        
        {/* Back to login */}
        <div className="text-center mt-4">
          <Link 
            to="/login" 
            className="text-amazon-river hover:text-amazon-river-600 transition-colors"
          >
            {t('auth.backToLogin')}
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ResendVerificationEmail;