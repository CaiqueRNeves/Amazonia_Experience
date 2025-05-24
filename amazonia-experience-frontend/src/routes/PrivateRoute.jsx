import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * PrivateRoute component
 * Protects routes that require authentication
 * Redirects to login page if user is not authenticated
 * Preserves the attempted URL for redirecting back after login
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @returns {React.ReactElement} Protected route or redirect
 */
const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);

  // While checking authentication status, show nothing or a loading indicator
  if (isLoading) {
    return null;
  }

  // If not authenticated, redirect to login page and remember the current location
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // If authenticated, render the protected content
  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrivateRoute;