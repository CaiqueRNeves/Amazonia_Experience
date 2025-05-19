import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import Button from '../common/Button';

/**
 * Componente exibido após o registro, informando que um email de verificação foi enviado
 */
const EmailVerificationSent = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  
  // Email para exibição (do store ou mensagem genérica)
  const email = user?.email || t('auth.yourEmail');

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
          <svg 
            className="h-6 w-6 text-blue-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
            />
          </svg>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900">
          {t('auth.verificationEmailSent')}
        </h3>
        
        <div className="mt-4 text-sm text-gray-600 space-y-3">
          <p>
            {t('auth.verificationEmailSentTo')} <strong>{email}</strong>
          </p>
          <p>
            {t('auth.verificationEmailInstructions')}
          </p>
          <p className="italic">
            {t('auth.checkSpamFolder')}
          </p>
        </div>
        
        <div className="mt-6 space-y-4">
          <div>
            <Link
              to="/resend-verification"
              className="text-amazon-river hover:text-amazon-river-600 transition-colors"
            >
              {t('auth.didntReceiveEmail')}
            </Link>
          </div>
          
          <Button
            as={Link}
            to="/login"
            fullWidth
            className="bg-amazon-green hover:bg-amazon-green-700"
          >
            {t('auth.backToLogin')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationSent;