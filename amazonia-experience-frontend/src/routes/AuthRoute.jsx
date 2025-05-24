import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * AuthRoute component
 * For routes that should only be accessible to non-authenticated users
 * Redirects authenticated users to home page or a specified redirect path
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if not authenticated
 * @param {string} props.redirectPath - Path to redirect to if authenticated (defaults to home)
 * @returns {React.ReactElement} Auth route or redirect
 */
const AuthRoute = ({ children, redirectPath = '/' }) => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);
  
  // If there's a redirect path in the location state, use that instead
  const finalRedirectPath = location.state?.redirectTo || redirectPath;

  // While checking authentication status, show nothing or a loading indicator
  if (isLoading) {
    return null;
  }

  // If authenticated, redirect to the home page or the specified redirect path
  if (isAuthenticated) {
    return <Navigate to={finalRedirectPath} replace />;
  }

  // If not authenticated, render the auth content
  return children;
};

AuthRoute.propTypes = {
  children: PropTypes.node.isRequired,
  redirectPath: PropTypes.string,
};

export default AuthRoute;