import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { verifyEmail } from '../../api/auth';
import Loader from '../common/Loader';
import Button from '../common/Button';

/**
 * Componente para verificação de email
 * Processa o token de verificação recebido por email
 */
const VerifyEmail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Estados locais
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Processa o token de verificação quando o componente monta
  useEffect(() => {
    const verifyEmailToken = async () => {
      const searchParams = new URLSearchParams(location.search);
      const token = searchParams.get('token');
      
      if (!token) {
        setError(t('auth.invalidVerificationLink'));
        setIsLoading(false);
        return;
      }
      
      try {
        await verifyEmail(token);
        setIsSuccess(true);
      } catch (error) {
        const errorMessage = error.response?.data?.message || t('auth.verificationError');
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyEmailToken();
  }, [location.search, t]);

  // Redireciona para login após sucesso com atraso
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  // Handler para solicitar novo email de verificação
  const handleResendVerification = () => {
    // Redireciona para uma página específica para reenviar o email
    navigate('/resend-verification');
  };

  // Mostra carregador enquanto está processando
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader size="lg" />
        <p className="mt-4 text-gray-600">
          {t('auth.verifyingEmail')}
        </p>
      </div>
    );
  }

  // Se a verificação foi bem-sucedida
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
            {t('auth.emailVerified')}
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

  // Se houve erro na verificação
  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <svg 
            className="h-6 w-6 text-red-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900">
          {t('auth.emailVerificationFailed')}
        </h3>
        
        <div className="mt-4">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
        
        <div className="mt-6 space-y-4">
          <Button
            onClick={handleResendVerification}
            fullWidth
            className="bg-amazon-green hover:bg-amazon-green-700"
          >
            {t('auth.resendVerificationEmail')}
          </Button>
          
          <div>
            <Link
              to="/login"
              className="text-amazon-river hover:text-amazon-river-600 transition-colors"
            >
              {t('auth.backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;