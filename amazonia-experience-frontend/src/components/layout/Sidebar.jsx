import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { 
  HomeIcon, 
  CalendarIcon, 
  MapPinIcon, 
  GiftIcon, 
  AcademicCapIcon, 
  WifiIcon, 
  ShieldExclamationIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

import { navMenuItems } from '../../routes/routes';

/**
 * Componente de sidebar para navegação principal
 * Responsivo para dispositivos móveis
 */
const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  // Mapear ícones para cada rota
  const getIcon = (path) => {
    switch (path) {
      case '/':
        return <HomeIcon className="h-6 w-6" />;
      case '/events':
        return <CalendarIcon className="h-6 w-6" />;
      case '/places':
        return <MapPinIcon className="h-6 w-6" />;
      case '/rewards':
        return <GiftIcon className="h-6 w-6" />;
      case '/quizzes':
        return <AcademicCapIcon className="h-6 w-6" />;
      case '/connectivity':
        return <WifiIcon className="h-6 w-6" />;
      case '/emergency':
        return <ShieldExclamationIcon className="h-6 w-6" />;
      case '/chat':
        return <ChatBubbleLeftRightIcon className="h-6 w-6" />;
      case '/profile':
        return <UserIcon className="h-6 w-6" />;
      default:
        return <HomeIcon className="h-6 w-6" />;
    }
  };

  return (
    <>
      {/* Overlay para dispositivos móveis */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 w-64 h-full md:h-[calc(100vh-4rem)] bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } md:mt-16 pt-4 overflow-y-auto`}
      >
        {/* Cabeçalho da sidebar em mobile */}
        <div className="flex items-center justify-between px-4 pb-4 border-b border-gray-200 md:hidden">
          <h2 className="text-xl font-semibold text-amazon-green-600">
            AmazôniaExperience
          </h2>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={onClose}
            aria-label={t('nav.close')}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* Seção de usuário */}
        {isAuthenticated && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-amazon-green-100 flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-amazon-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 flex items-center">
                  <GiftIcon className="h-3 w-3 mr-1" />
                  <span>{user?.amacoins || 0} AmaCoins</span>
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Menu de navegação */}
        <nav className="py-4 px-2">
          <ul className="space-y-1">
            {navMenuItems.map((item) => {
              // Pular itens que requerem autenticação se o usuário não estiver logado
              if (item.private && !isAuthenticated) {
                return null;
              }
              
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => 
                      `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-amazon-green-50 text-amazon-green-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`
                    }
                    onClick={onClose}
                  >
                    <span className="mr-3">
                      {getIcon(item.path)}
                    </span>
                    {t(item.title)}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Área informativa */}
        <div className="mt-auto p-4 bg-amazon-green-50 border-t border-amazon-green-100">
          <h3 className="text-sm font-medium text-amazon-green-800 mb-2">
            {t('sidebar.aboutCOP30')}
          </h3>
          <p className="text-xs text-amazon-green-700">
            {t('sidebar.cop30Description')}
          </p>
          
            href="https://cop30.gov.br"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-xs text-amazon-green-600 hover:text-amazon-green-800"
          >
            {t('sidebar.learnMore')} →
          </a>
        </div>
      </aside>
    </>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Sidebar;