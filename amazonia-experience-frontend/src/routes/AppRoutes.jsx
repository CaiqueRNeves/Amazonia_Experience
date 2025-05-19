import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

// Routes configuration
import { routes } from './routes';
import PrivateRoute from './PrivateRoute';

// Layouts
import MainLayout from '../components/layout/MainLayout';

// Pages
const Login = React.lazy(() => import('../pages/Login'));
const Register = React.lazy(() => import('../pages/Register'));
const NotFound = React.lazy(() => import('../pages/NotFound'));
const Loading = React.lazy(() => import('../components/common/Loader'));

/**
 * Main application routing component
 * Handles public and private routes, layouts, and page loading
 */
const AppRoutes = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Function to determine which layout to use
  const getRouteElement = (route) => {
    // Common fallback for all lazy-loaded components
    const fallback = <Loading message={t('app.loading')} />;
    
    // If the route requires authentication
    if (route.private) {
      return (
        <PrivateRoute>
          <Suspense fallback={fallback}>
            <MainLayout>
              <route.component />
            </MainLayout>
          </Suspense>
        </PrivateRoute>
      );
    }
    
    // For public routes, just render with the layout
    return (
      <Suspense fallback={fallback}>
        <MainLayout>
          <route.component />
        </MainLayout>
      </Suspense>
    );
  };

  return (
    <Routes>
      {/* Authentication routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <Suspense fallback={<Loading message={t('app.loading')} />}>
              <Login />
            </Suspense>
          )
        }
      />
      
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <Suspense fallback={<Loading message={t('app.loading')} />}>
              <Register />
            </Suspense>
          )
        }
      />

      {/* Dynamic routes from routes configuration */}
      {routes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={getRouteElement(route)}
        />
      ))}

      {/* 404 - Not Found */}
      <Route
        path="*"
        element={
          <Suspense fallback={<Loading message={t('app.loading')} />}>
            <NotFound />
          </Suspense>
        }
      />
    </Routes>
  );
};

export default AppRoutes;