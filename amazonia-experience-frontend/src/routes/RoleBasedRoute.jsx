import React from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

/**
 * RoleBasedRoute component
 * Protects routes based on user roles
 * Redirects to a fallback page if user doesn't have required role
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if role matches
 * @param {Array<string>} props.allowedRoles - List of roles that can access this route
 * @param {string} props.fallbackPath - Path to redirect if role check fails
 * @returns {React.ReactElement} Role-based protected route or redirect
 */
const RoleBasedRoute = ({ children, allowedRoles = [], fallbackPath = '/' }) => {
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);

  // While checking authentication status, show nothing
  if (isLoading) {
    return null;
  }

  // If not authenticated, this should be handled by PrivateRoute
  // This is an additional check
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user role is in allowed roles list
  const hasRequiredRole = allowedRoles.includes(user.role);

  // If user doesn't have the required role, redirect to fallback path
  if (!hasRequiredRole) {
    return <Navigate to={fallbackPath} replace />;
  }

  // User has required role, render children
  return children;
};

RoleBasedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
  fallbackPath: PropTypes.string,
};

export default RoleBasedRoute;