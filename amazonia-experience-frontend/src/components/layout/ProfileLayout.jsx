import React from 'react';
import PropTypes from 'prop-types';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { 
  UserIcon, 
  ClockIcon, 
  GiftIcon, 
  AcademicCapIcon, 
  BellIcon, 
  CogIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

import Container from './Container';
import PageHeader from './PageHeader';

/**
 * Layout específico para as páginas de perfil do usuário
 * Inclui navegação secundária para seções do perfil
 */
const ProfileLayout = ({ children, title }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  
  // Links para a navegação de perfil
  const profileLinks = [
    { path: '/profile', icon: <UserIcon className="h-5 w-5" />, label: t('profile.general') },
    { path: '/profile/visits', icon: <ClockIcon className="h-5 w-5" />, label: t('profile.visits') },
    { path: '/profile/rewards', icon: <GiftIcon className="h-5 w-5" />, label: t('profile.rewards') },
    { path: '/profile/quizzes', icon: <AcademicCapIcon className="h-5 w-5" />, label: t('profile.quizzes') },
    { path: '/profile/notifications', icon: <BellIcon className="h-5 w-5" />, label: t('profile.notifications') },
    { path: '/profile/security', icon: <ShieldCheckIcon className="h-5 w-5" />, label: t('profile.security') },
    { path: '/profile/settings', icon: <CogIcon className="h-5 w-5" />, label: t('profile.settings') },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <PageHeader 
        title={title || t('profile.title')} 
        description={t('profile.description')}
      />
      
      <Container>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Cabeçalho do perfil */}
          <div className="p-6 bg-amazon-green-50 border-b border-amazon-green-100">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-4">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-20 w-20 rounded-full border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-amazon-green-200 flex items-center justify-center border-4 border-white shadow-md">
                    <UserIcon className="h-10 w-10 text-amazon-green-600" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                <p className="text-gray-600">{user?.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amazon-green-100 text-amazon-green-800">
                    <GiftIcon className="h-4 w-4 mr-1" />
                    {user?.amacoins || 0} AmaCoins
                  </div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amazon-river-100 text-amazon-river-800">
                    <AcademicCapIcon className="h-4 w-4 mr-1" />
                    {user?.quiz_points || 0} {t('profile.quizPoints')}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Navegação do perfil */}
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="-mb-px flex" aria-label="Tabs">
              {profileLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/profile'}
                  className={({ isActive }) =>
                    `whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center ${
                      isActive
                        ? 'border-amazon-green-500 text-amazon-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`
                  }
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
          
          {/* Conteúdo */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </Container>
    </div>
  );
};

ProfileLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
};

export default ProfileLayout;