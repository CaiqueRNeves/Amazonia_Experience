import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { logout } from '../../redux/slices/authSlice';
import Button from '../common/Button';

/**
 * Botão para realizar logout
 * Pode ser renderizado como botão normal ou como outro componente
 */
const LogoutButton = ({ className, variant, icon, children, as: Component = Button }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Handler para logout
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Component
      onClick={handleLogout}
      className={className}
      variant={variant}
      leftIcon={icon}
    >
      {children || t('auth.logout')}
    </Component>
  );
};

LogoutButton.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.string,
  icon: PropTypes.node,
  children: PropTypes.node,
  as: PropTypes.elementType
};

export default LogoutButton;