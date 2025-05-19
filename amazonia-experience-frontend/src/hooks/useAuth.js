import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import { login, register, logout, refreshToken, getUserProfile } from '../redux/slices/authSlice';

/**
 * Hook personalizado para gerenciar autenticação
 * Fornece métodos e estado relacionados à autenticação
 */
const useAuth = () => {
  const dispatch = useDispatch();
  const {
    user,
    isAuthenticated,
    isLoading,
    token,
    refreshToken: refreshTokenValue,
    error
  } = useSelector((state) => state.auth);

  // Verificar token e perfil do usuário ao inicializar
  useEffect(() => {
    if (token && !user && !isLoading) {
      dispatch(getUserProfile());
    }
  }, [dispatch, token, user, isLoading]);

  // Configurar intervalo para atualizar o token
  useEffect(() => {
    if (isAuthenticated && refreshTokenValue) {
      const interval = setInterval(() => {
        dispatch(refreshToken());
      }, process.env.REACT_APP_TOKEN_REFRESH_INTERVAL || 30 * 60 * 1000); // 30 minutos por padrão
      
      return () => clearInterval(interval);
    }
  }, [dispatch, isAuthenticated, refreshTokenValue]);

  // Função para fazer login
  const handleLogin = useCallback(
    (credentials) => dispatch(login(credentials)),
    [dispatch]
  );

  // Função para registro
  const handleRegister = useCallback(
    (userData) => dispatch(register(userData)),
    [dispatch]
  );

  // Função para logout
  const handleLogout = useCallback(() => dispatch(logout()), [dispatch]);

  // Verificar se o usuário tem uma função específica
  const hasRole = useCallback(
    (role) => {
      if (!user) return false;
      
      if (Array.isArray(role)) {
        return role.includes(user.role);
      }
      
      return user.role === role;
    },
    [user]
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    hasRole
  };
};

export default useAuth;