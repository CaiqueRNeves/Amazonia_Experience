import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/auth';
import { getAuthTokens } from '../../utils/authStorage';

// Thunks para operações assíncronas

/**
 * Login de usuário
 */
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await authService.login(credentials);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao fazer login'
      );
    }
  }
);

/**
 * Registro de novo usuário
 */
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      return await authService.register(userData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao registrar usuário'
      );
    }
  }
);

/**
 * Obter perfil do usuário
 */
export const getUserProfile = createAsyncThunk(
  'auth/getUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getUserProfile();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao obter perfil do usuário'
      );
    }
  }
);

/**
 * Atualizar token
 */
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.refreshToken();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao atualizar token'
      );
    }
  }
);

/**
 * Atualizar perfil
 */
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      return await authService.updateProfile(userData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao atualizar perfil'
      );
    }
  }
);

/**
 * Alterar senha
 */
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      return await authService.changePassword(passwordData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao alterar senha'
      );
    }
  }
);

/**
 * Atualizar preferências de notificação
 */
export const updateNotificationPreferences = createAsyncThunk(
  'auth/updateNotificationPreferences',
  async (preferences, { rejectWithValue }) => {
    try {
      return await authService.updateNotificationPreferences(preferences);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao atualizar preferências'
      );
    }
  }
);

// Recuperar tokens salvos para inicialização
const { token, refreshToken: savedRefreshToken } = getAuthTokens();

// Estado inicial
const initialState = {
  isAuthenticated: !!token,
  user: null,
  token: token || null,
  refreshToken: savedRefreshToken || null,
  isLoading: false,
  error: null
};

// Slice de autenticação
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Ação para logout
    logout: (state) => {
      authService.logout();
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.error = null;
    },
    
    // Limpar mensagens de erro
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
    
    // Registro
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
    
    // Perfil do usuário
    builder
      .addCase(getUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // Se falhar ao obter o perfil, provavelmente o token é inválido
        if (action.error.name === 'UnauthorizedError') {
          state.isAuthenticated = false;
          state.token = null;
          state.refreshToken = null;
          authService.logout();
        }
      });
    
    // Refresh token
    builder
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // Se falhar ao atualizar o token, fazer logout
        state.isAuthenticated = false;
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        authService.logout();
      });
    
    // Atualizar perfil
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
    
    // Alterar senha
    builder
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
    
    // Atualizar preferências de notificação
    builder
      .addCase(updateNotificationPreferences.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateNotificationPreferences.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user) {
          state.user.notification_preferences = action.payload.notification_preferences;
        }
      })
      .addCase(updateNotificationPreferences.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

// Exportar ações e reducer
export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;