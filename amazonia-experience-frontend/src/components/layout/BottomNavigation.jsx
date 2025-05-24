import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  HomeIcon, 
  CalendarIcon, 
  MapPinIcon, 
  GiftIcon, 
  ChatBubbleLeftRightIcon 
} from '@heroicons/react/24/outline';

/**
 * Navegação inferior para dispositivos móveis
 * Exibe os links mais importantes da aplicação
 */
const BottomNavigation = () => {
  const { t } = useTranslation();
  
  // Links principais para a navegação inferior
  const navItems = [
    { path: '/', icon: <HomeIcon className="h-6 w-6" />, label: t('nav.home') },
    { path: '/events', icon: <CalendarIcon className="h-6 w-6" />, label: t('nav.events') },
    { path: '/places', icon: <MapPinIcon className="h-6 w-6" />, label: t('nav.places') },
    { path: '/rewards', icon: <GiftIcon className="h-6 w-6" />, label: t('nav.rewards') },
    { path: '/chat', icon: <ChatBubbleLeftRightIcon className="h-6 w-6" />, label: t('nav.chat') },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden">
      <div className="grid grid-cols-5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex flex-col items-center justify-center py-2 text-xs font-medium ${
                isActive
                  ? 'text-amazon-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`
            }
            end={item.path === '/'}
          >
            <span className="inline-block mb-1">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;