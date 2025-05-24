import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Avatar from '../common/Avatar';
import AmacoinBalance from '../user/AmacoinBalance';
import LogoutButton from './LogoutButton';

/**
 * Componente que exibe o status de autenticação do usuário
 * Usado no cabeçalho para mostrar avatar, nome e saldo de AmaCoins
 * Ou botões de login/registro caso não esteja autenticado
 */
const AuthStatus = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Se não estiver autenticado, mostra botões de login e registro
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center space-x-3">
        <Link 
          to="/login" 
          className="text-white hover:text-green-100 transition-colors"
        >
          {t('auth.login')}
        </Link>
        <span className="text-white opacity-50">|</span>
        <Link 
          to="/register" 
          className="text-white hover:text-green-100 transition-colors"
        >
          {t('auth.register')}
        </Link>
      </div>
    );
  }

  // Se estiver autenticado, mostra informações do usuário
  return (
    <div className="flex items-center">
      {/* Saldo de AmaCoins */}
      <div className="mr-4">
        <AmacoinBalance value={user.amacoins} compact />
      </div>
      
      {/* Perfil do usuário (dropdown) */}
      <div className="relative group">
        <button 
          className="flex items-center space-x-2 focus:outline-none"
          aria-label={t('profile.myProfile')}
        >
          <Avatar 
            src={user.avatar} 
            name={user.name} 
            size="sm"
          />
          <span className="text-white hidden md:block max-w-[100px] truncate">
            {user.name}
          </span>
          <svg 
            className="w-4 h-4 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M19 9l-7 7-7-7" 
            />
          </svg>
        </button>
        
        {/* Dropdown menu */}
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
          <Link 
            to="/profile" 
            className="block px-4 py-2 text-gray-800 hover:bg-amazon-green-50 hover:text-amazon-green-600"
          >
            {t('profile.myProfile')}
          </Link>
          <Link 
            to="/profile/visits" 
            className="block px-4 py-2 text-gray-800 hover:bg-amazon-green-50 hover:text-amazon-green-600"
          >
            {t('profile.myVisits')}
          </Link>
          <Link 
            to="/profile/rewards" 
            className="block px-4 py-2 text-gray-800 hover:bg-amazon-green-50 hover:text-amazon-green-600"
          >
            {t('profile.myRewards')}
          </Link>
          <Link 
            to="/profile/settings" 
            className="block px-4 py-2 text-gray-800 hover:bg-amazon-green-50 hover:text-amazon-green-600"
          >
            {t('profile.settings')}
          </Link>
          <hr className="my-1" />
          <LogoutButton 
            as="button"
            className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-amazon-green-50 hover:text-amazon-green-600"
          />
        </div>
      </div>
    </div>
  );
};

export default AuthStatus;