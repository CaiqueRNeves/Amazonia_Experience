import React from 'react';
import PropTypes from 'prop-types';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  HomeIcon, 
  UsersIcon, 
  CalendarIcon,
  MapPinIcon,
  AcademicCapIcon,
  GiftIcon,
  ShieldExclamationIcon,
  WifiIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';

import Container from './Container';
import PageHeader from './PageHeader';

/**
 * Layout específico para páginas administrativas
 * Inclui uma navegação secundária para seções de administração
 */
const AdminLayout = ({ children, title, description }) => {
  const { t } = useTranslation();
  const location = useLocation();
  
  // Links para a navegação de administração
  const adminLinks = [
    { path: '/admin', icon: <HomeIcon className="h-5 w-5" />, label: t('admin.dashboard') },
    { path: '/admin/users', icon: <UsersIcon className="h-5 w-5" />, label: t('admin.users') },
    { path: '/admin/events', icon: <CalendarIcon className="h-5 w-5" />, label: t('admin.events') },
    { path: '/admin/places', icon: <MapPinIcon className="h-5 w-5" />, label: t('admin.places') },
    { path: '/admin/quizzes', icon: <AcademicCapIcon className="h-5 w-5" />, label: t('admin.quizzes') },
    { path: '/admin/rewards', icon: <GiftIcon className="h-5 w-5" />, label: t('admin.rewards') },
    { path: '/admin/emergency', icon: <ShieldExclamationIcon className="h-5 w-5" />, label: t('admin.emergency') },
    { path: '/admin/connectivity', icon: <WifiIcon className="h-5 w-5" />, label: t('admin.connectivity') },
    { path: '/admin/analytics', icon: <ChartBarIcon className="h-5 w-5" />, label: t('admin.analytics') },
    { path: '/admin/settings', icon: <CogIcon className="h-5 w-5" />, label: t('admin.settings') },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <PageHeader 
        title={title || t('admin.title')} 
        description={description || t('admin.description')}
      />
      
      <Container>
        <div className="flex flex-col md:flex-row md:space-x-8">
          {/* Navegação lateral administrativa */}
          <aside className="w-full md:w-64 flex-shrink-0 mb-6 md:mb-0">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-4 bg-amazon-green-700 text-white">
                <h2 className="text-lg font-semibold">{t('admin.adminPanel')}</h2>
              </div>
              <nav className="p-4">
                <ul className="space-y-2">
                  {adminLinks.map((link) => (
                    <li key={link.path}>
                      <NavLink
                        to={link.path}
                        end={link.path === '/admin'}
                        className={({ isActive }) =>
                          `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                            isActive
                              ? 'bg-amazon-green-50 text-amazon-green-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`
                        }
                      >
                        <span className="mr-3">{link.icon}</span>
                        {link.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>
          
          {/* Conteúdo principal */}
          <div className="flex-1">
            <div className="bg-white shadow rounded-lg p-6">
              {children}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

AdminLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
};

export default AdminLayout;