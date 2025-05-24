import React, { createContext, useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { getUserProfile, login, register, logout } from '../redux/slices/authSlice';
import { getAuthTokens, setAuthTokens, clearAuthTokens, isAuthenticated as checkAuth } from '../utils/authStorage';
import { analytics } from '../utils';

// Criação do contexto
export const AuthContext = createContext(null);

/**
 * Provedor de autenticação da aplicação
 * Gerencia estado de autenticação, login, registro e logout
 */
export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar autenticação ao iniciar
  useEffect(() => {
    const checkAuthentication = async () => {
      setIsLoading(true);
      setError(null);

      // Verifica se há tokens de autenticação
      const isUserAuthenticated = checkAuth();
      setIsAuthenticated(isUserAuthenticated);

      if (isUserAuthenticated) {
        try {
          // Busca dados do usuário usando token existente
          const { tokens, userData } = await getAuthTokens();
          const resultAction = await dispatch(getUserProfile());

          if (getUserProfile.fulfilled.match(resultAction)) {
            setUser(resultAction.payload.user);
            // Configura ID do usuário para analytics
            analytics.setUserId(resultAction.payload.user.id);
          } else {
            // Falha ao obter perfil, limpa tokens
            setError(resultAction.error.message);
            await handleLogout();
          }
        } catch (err) {
          console.error('Erro ao verificar autenticação:', err);
          setError('Erro ao verificar autenticação. Por favor, faça login novamente.');
          await handleLogout();
        }
      }

      setIsLoading(false);
    };

    checkAuthentication();
  }, [dispatch]);

  /**
   * Efetua login de usuário
   * @param {Object} credentials - Credenciais (email, senha)
   * @returns {Promise<boolean>} Sucesso do login
   */
  const handleLogin = useCallback(async (credentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const resultAction = await dispatch(login(credentials));

      if (login.fulfilled.match(resultAction)) {
        const { user, token, refreshToken } = resultAction.payload;
        
        // Salva tokens e dados do usuário
        setAuthTokens({ token, refreshToken, user });
        setUser(user);
        setIsAuthenticated(true);
        
        // Registra login no analytics
        analytics.trackUserLogin({
          id: user.id,
          name: user.name,
          role: user.role,
          amacoins: user.amacoins
        });

        setIsLoading(false);
        return true;
      } else {
        setError(resultAction.error.message || 'Falha no login. Verifique suas credenciais.');
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      console.error('Erro no login:', err);
      setError('Ocorreu um erro ao tentar fazer login. Tente novamente.');
      setIsLoading(false);
      return false;
    }
  }, [dispatch]);

  /**
   * Registra um novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Promise<boolean>} Sucesso do registro
   */
  const handleRegister = useCallback(async (userData) => {
    setIsLoading(true);
    setError(null);

    try {
      const resultAction = await dispatch(register(userData));

      if (register.fulfilled.match(resultAction)) {
        const { user, token, refreshToken } = resultAction.payload;
        
        // Salva tokens e dados do usuário
        setAuthTokens({ token, refreshToken, user });
        setUser(user);
        setIsAuthenticated(true);
        
        // Registra novo usuário no analytics
        analytics.trackUserRegistration({
          id: user.id,
          name: user.name,
          role: user.role,
          nationality: user.nationality
        });

        setIsLoading(false);
        return true;
      } else {
        setError(resultAction.error.message || 'Falha no registro. Verifique os dados informados.');
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      console.error('Erro no registro:', err);
      setError('Ocorreu um erro ao tentar fazer o registro. Tente novamente.');
      setIsLoading(false);
      return false;
    }
  }, [dispatch]);

  /**
   * Efetua logout do usuário
   * @returns {Promise<boolean>} Sucesso do logout
   */
  const handleLogout = useCallback(async () => {
    setIsLoading(true);

    try {
      // Limpa dados no Redux
      await dispatch(logout());
      
      // Limpa tokens locais
      await clearAuthTokens();
      
      // Limpa estado local
      setUser(null);
      setIsAuthenticated(false);
      
      // Limpa ID do usuário no analytics
      analytics.clearUserId();

      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Erro no logout:', err);
      setError('Ocorreu um erro ao tentar fazer logout.');
      setIsLoading(false);
      return false;
    }
  }, [dispatch]);

  /**
   * Atualiza os dados do usuário no contexto
   * @param {Object} updatedUser - Dados atualizados do usuário
   */
  const updateUserData = useCallback((updatedUser) => {
    setUser(prevUser => ({ ...prevUser, ...updatedUser }));
  }, []);

  // Verificar se o usuário tem uma função específica
  const hasRole = useCallback((role) => {
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  }, [user]);

  // Valores expostos pelo contexto
  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateUserData,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};

export default { AuthContext, AuthProvider, useAuth };