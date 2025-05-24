import { AuthContext, AuthProvider, useAuth } from './AuthContext';
import { LocationContext, LocationProvider, useLocation } from './LocationContext';
import { NotificationContext, NotificationProvider, useNotifications } from './NotificationContext';
import { ThemeContext, ThemeProvider, useTheme } from './ThemeContext';
import { LanguageContext, LanguageProvider, useLanguage } from './LanguageContext';
import { AppContext, AppProvider, useApp } from './AppContext';
import { ModalContext, ModalProvider, useModal } from './ModalContext';

// Exportação de todos os contextos e provedores
export {
  // Contextos
  AuthContext,
  LocationContext,
  NotificationContext,
  ThemeContext,
  LanguageContext,
  AppContext,
  ModalContext,
  
  // Provedores
  AuthProvider,
  LocationProvider,
  NotificationProvider,
  ThemeProvider,
  LanguageProvider,
  AppProvider,
  ModalProvider,
  
  // Hooks
  useAuth,
  useLocation,
  useNotifications,
  useTheme,
  useLanguage,
  useApp,
  useModal
};

/**
 * Componente que combina todos os provedores de contexto
 * Facilita o uso em app.jsx
 */
export const ContextProviders = ({ children }) => (
  <AppProvider>
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <LocationProvider>
            <NotificationProvider>
              <ModalProvider>
                {children}
              </ModalProvider>
            </NotificationProvider>
          </LocationProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  </AppProvider>
);

export default {
  ContextProviders,
  
  // Contextos individuais
  AuthContext,
  LocationContext,
  NotificationContext,
  ThemeContext,
  LanguageContext,
  AppContext,
  ModalContext,
  
  // Provedores individuais
  AuthProvider,
  LocationProvider,
  NotificationProvider,
  ThemeProvider,
  LanguageProvider,
  AppProvider,
  ModalProvider,
  
  // Hooks
  useAuth,
  useLocation,
  useNotifications,
  useTheme,
  useLanguage,
  useApp,
  useModal
};