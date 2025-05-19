import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { logout } from '../../redux/auth/authSlice';
import { Bars3Icon, XMarkIcon, UserCircleIcon, BellIcon } from '@heroicons/react/24/outline';
import Logo from '../common/Logo';
import LanguageSwitcher from '../common/LanguageSwitcher';
import ThemeToggle from '../common/ThemeToggle';
import NotificationsPopover from '../notifications/NotificationsPopover';

/**
 * Barra de navegação superior da aplicação
 * Exibe o logo, menu de hambúrguer para mobile, idiomas e itens de autenticação
 */
const Navbar = ({ onMenuClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Lado esquerdo */}
          <div className="flex items-center">
            {/* Botão do menu (mobile) */}
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-700 md:hidden"
              onClick={onMenuClick}
              aria-label={t('nav.toggleMenu')}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center ml-2 md:ml-0">
              <Logo className="h-8 w-auto" />
              <span className="ml-2 font-semibold text-amazon-green-600 hidden md:block">
                AmazôniaExperience
              </span>
            </Link>
          </div>
          
          {/* Lado direito */}
          <div className="flex items-center space-x-3 md:space-x-4">
            {/* Seletor de idioma */}
            <LanguageSwitcher />
            
            {/* Toggle de tema (claro/escuro) */}
            <ThemeToggle />
            
            {/* Notificações (apenas se autenticado) */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  type="button"
                  className="relative p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  aria-label={t('nav.notifications')}
                >
                  <BellIcon className="h-6 w-6" />
                  {/* Badge de notificações não lidas */}
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                </button>
                
                {/* Popover de notificações */}
                {notificationsOpen && (
                  <NotificationsPopover onClose={() => setNotificationsOpen(false)} />
                )}
              </div>
            )}
            
            {/* Menu de autenticação */}
            {isAuthenticated ? (
              <div className="relative group">
                <button
                  type="button"
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amazon-green-500"
                  aria-label={t('nav.userMenu')}
                >
                  {user?.name ? (
                    <span className="hidden md:inline-block mr-2 text-gray-700">{user.name}</span>
                  ) : null}
                  <UserCircleIcon className="h-8 w-8 text-gray-600" />
                </button>
                
                {/* Dropdown menu */}
                <div className="hidden group-hover:block absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 origin-top-right z-50">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      {t('nav.profile')}
                    </Link>
                    <Link
                      to="/profile/visits"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      {t('nav.myVisits')}
                    </Link>
                    <Link
                      to="/profile/rewards"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      {t('nav.myRewards')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      {t('nav.logout')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  className="text-amazon-green-600 hover:text-amazon-green-800 px-3 py-1 rounded-md text-sm font-medium"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="bg-amazon-green-500 hover:bg-amazon-green-600 text-white px-3 py-1 rounded-md text-sm font-medium"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

Navbar.propTypes = {
  onMenuClick: PropTypes.func.isRequired,
};

export default Navbar;