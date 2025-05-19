import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as usersApi from '../../api/users';

// Thunks para operações assíncronas

/**
 * Obter histórico de visitas
 */
export const getVisitHistory = createAsyncThunk(
  'user/getVisitHistory',
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      return await usersApi.getVisits({ page, limit });
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao obter histórico de visitas'
      );
    }
  }
);

/**
 * Obter alertas
 */
export const getAlerts = createAsyncThunk(
  'user/getAlerts',
  async ({ includeRead = false, page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      return await usersApi.getAlerts(includeRead, page, limit);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao obter alertas'
      );
    }
  }
);

/**
 * Marcar alerta como lido
 */
export const markAlertAsRead = createAsyncThunk(
  'user/markAlertAsRead',
  async (alertId, { rejectWithValue }) => {
    try {
      await usersApi.markAlertAsRead(alertId);
      return alertId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao marcar alerta como lido'
      );
    }
  }
);

/**
 * Obter histórico de resgates
 */
export const getRedemptionHistory = createAsyncThunk(
  'user/getRedemptionHistory',
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await usersApi.getRedemptions({ page, limit });
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao obter histórico de resgates'
      );
    }
  }
);

// Estado inicial
const initialState = {
  visits: {
    data: [],
    pagination: { page: 1, totalPages: 1 },
    isLoading: false,
    error: null
  },
  alerts: {
    data: [],
    unreadCount: 0,
    pagination: { page: 1, totalPages: 1 },
    isLoading: false,
    error: null
  },
  redemptions: {
    data: [],
    pagination: { page: 1, totalPages: 1 },
    isLoading: false,
    error: null
  }
};

// Slice do usuário
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Limpar mensagens de erro
    clearError: (state, action) => {
      const section = action.payload; // 'visits', 'alerts', 'redemptions'
      if (section && state[section]) {
        state[section].error = null;
      } else {
        // Limpar todos os erros se não houver seção específica
        state.visits.error = null;
        state.alerts.error = null;
        state.redemptions.error = null;
      }
    },
    
    // Resetar estado (útil para logout)
    resetUserState: () => initialState
  },
  extraReducers: (builder) => {
    // Histórico de visitas
    builder
      .addCase(getVisitHistory.pending, (state) => {
        state.visits.isLoading = true;
        state.visits.error = null;
      })
      .addCase(getVisitHistory.fulfilled, (state, action) => {
        state.visits.isLoading = false;
        state.visits.data = action.payload.visits;
        state.visits.pagination = action.payload.pagination;
      })
      .addCase(getVisitHistory.rejected, (state, action) => {
        state.visits.isLoading = false;
        state.visits.error = action.payload;
      });
    
    // Alertas
    builder
      .addCase(getAlerts.pending, (state) => {
        state.alerts.isLoading = true;
        state.alerts.error = null;
      })
      .addCase(getAlerts.fulfilled, (state, action) => {
        state.alerts.isLoading = false;
        state.alerts.data = action.payload.alerts;
        state.alerts.unreadCount = action.payload.alerts.filter(alert => !alert.is_read).length;
        state.alerts.pagination = action.payload.pagination;
      })
      .addCase(getAlerts.rejected, (state, action) => {
        state.alerts.isLoading = false;
        state.alerts.error = action.payload;
      });
    
    // Marcar alerta como lido
    builder
      .addCase(markAlertAsRead.fulfilled, (state, action) => {
        // Encontrar e atualizar o alerta específico
        const alertId = action.payload;
        const alertIndex = state.alerts.data.findIndex(alert => alert.id === alertId);
        
        if (alertIndex !== -1) {
          state.alerts.data[alertIndex].is_read = true;
          
          // Atualizar contador de não lidos
          state.alerts.unreadCount = state.alerts.data.filter(alert => !alert.is_read).length;
        }
      });
    
    // Histórico de resgates
    builder
      .addCase(getRedemptionHistory.pending, (state) => {
        state.redemptions.isLoading = true;
        state.redemptions.error = null;
      })
      .addCase(getRedemptionHistory.fulfilled, (state, action) => {
        state.redemptions.isLoading = false;
        state.redemptions.data = action.payload.redemptions;
        state.redemptions.pagination = action.payload.pagination;
      })
      .addCase(getRedemptionHistory.rejected, (state, action) => {
        state.redemptions.isLoading = false;
        state.redemptions.error = action.payload;
      });
  }
});

// Exportar ações e reducer
export const { clearError, resetUserState } = userSlice.actions;
export default userSlice.reducer;