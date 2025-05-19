import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as rewardsApi from '../../api/rewards';

// Thunks para operações assíncronas

/**
 * Obter lista de recompensas
 */
export const getRewards = createAsyncThunk(
  'rewards/getRewards',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await rewardsApi.getRewards(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao obter recompensas'
      );
    }
  }
);

/**
 * Obter recompensas físicas
 */
export const getPhysicalRewards = createAsyncThunk(
  'rewards/getPhysicalRewards',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await rewardsApi.getPhysicalRewards(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao obter recompensas físicas'
      );
    }
  }
);

/**
 * Obter recompensas digitais
 */
export const getDigitalRewards = createAsyncThunk(
  'rewards/getDigitalRewards',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await rewardsApi.getDigitalRewards(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao obter recompensas digitais'
      );
    }
  }
);

/**
 * Obter detalhes de uma recompensa
 */
export const getRewardById = createAsyncThunk(
  'rewards/getRewardById',
  async (id, { rejectWithValue }) => {
    try {
      return await rewardsApi.getReward(id);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao obter detalhes da recompensa'
      );
    }
  }
);

/**
 * Resgatar uma recompensa
 */
export const redeemReward = createAsyncThunk(
  'rewards/redeemReward',
  async (rewardId, { rejectWithValue }) => {
    try {
      return await rewardsApi.redeemReward(rewardId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao resgatar recompensa'
      );
    }
  }
);

/**
 * Obter histórico de resgates
 */
export const getRedemptions = createAsyncThunk(
  'rewards/getRedemptions',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await rewardsApi.getRedemptions(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao obter histórico de resgates'
      );
    }
  }
);

// Estado inicial
const initialState = {
  rewards: {
    data: [],
    pagination: { page: 1, totalPages: 1 },
    isLoading: false,
    error: null
  },
  physicalRewards: {
    data: [],
    pagination: { page: 1, totalPages: 1 },
    isLoading: false,
    error: null
  },
  digitalRewards: {
    data: [],
    pagination: { page: 1, totalPages: 1 },
    isLoading: false,
    error: null
  },
  currentReward: {
    data: null,
    isLoading: false,
    error: null
  },
  redemption: {
    data: null,
    isLoading: false,
    error: null,
    success: false
  },
  redemptions: {
    data: [],
    pagination: { page: 1, totalPages: 1 },
    isLoading: false,
    error: null
  },
  filters: {
    rewardType: null,
    partnerId: null,
    maxCost: null,
    inStock: true,
    search: ''
  }
};

// Slice de recompensas
const rewardsSlice = createSlice({
  name: 'rewards',
  initialState,
  reducers: {
    // Atualizar filtros
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Limpar filtros
    clearFilters: (state) => {
      state.filters = { ...initialState.filters };
    },
    
    // Limpar mensagens de erro
    clearError: (state, action) => {
      const section = action.payload; // 'rewards', 'currentReward', 'redemption', etc.
      if (section && state[section]) {
        state[section].error = null;
      } else {
        // Limpar todos os erros se não houver seção específica
        state.rewards.error = null;
        state.physicalRewards.error = null;
        state.digitalRewards.error = null;
        state.currentReward.error = null;
        state.redemption.error = null;
        state.redemptions.error = null;
      }
    },
    
    // Resetar estado de resgate
    resetRedemption: (state) => {
      state.redemption = { ...initialState.redemption };
    },
    
    // Resetar estado (útil para logout)
    resetRewardsState: () => initialState
  },
  extraReducers: (builder) => {
    // Obter todas as recompensas
    builder
      .addCase(getRewards.pending, (state) => {
        state.rewards.isLoading = true;
        state.rewards.error = null;
      })
      .addCase(getRewards.fulfilled, (state, action) => {
        state.rewards.isLoading = false;
        state.rewards.data = action.payload.rewards;
        state.rewards.pagination = action.payload.pagination;
      })
      .addCase(getRewards.rejected, (state, action) => {
        state.rewards.isLoading = false;
        state.rewards.error = action.payload;
      });
    
    // Obter recompensas físicas
    builder
      .addCase(getPhysicalRewards.pending, (state) => {
        state.physicalRewards.isLoading = true;
        state.physicalRewards.error = null;
      })
      .addCase(getPhysicalRewards.fulfilled, (state, action) => {
        state.physicalRewards.isLoading = false;
        state.physicalRewards.data = action.payload.rewards;
        state.physicalRewards.pagination = action.payload.pagination;
      })
      .addCase(getPhysicalRewards.rejected, (state, action) => {
        state.physicalRewards.isLoading = false;
        state.physicalRewards.error = action.payload;
      });
    
    // Obter recompensas digitais
    builder
      .addCase(getDigitalRewards.pending, (state) => {
        state.digitalRewards.isLoading = true;
        state.digitalRewards.error = null;
      })
      .addCase(getDigitalRewards.fulfilled, (state, action) => {
        state.digitalRewards.isLoading = false;
        state.digitalRewards.data = action.payload.rewards;
        state.digitalRewards.pagination = action.payload.pagination;
      })
      .addCase(getDigitalRewards.rejected, (state, action) => {
        state.digitalRewards.isLoading = false;
        state.digitalRewards.error = action.payload;
      });
    
    // Obter detalhes de uma recompensa
    builder
      .addCase(getRewardById.pending, (state) => {
        state.currentReward.isLoading = true;
        state.currentReward.error = null;
      })
      .addCase(getRewardById.fulfilled, (state, action) => {
        state.currentReward.isLoading = false;
        state.currentReward.data = action.payload.reward;
      })
      .addCase(getRewardById.rejected, (state, action) => {
        state.currentReward.isLoading = false;
        state.currentReward.error = action.payload;
      });
    
    // Resgatar recompensa
    builder
      .addCase(redeemReward.pending, (state) => {
        state.redemption.isLoading = true;
        state.redemption.error = null;
        state.redemption.success = false;
        state.redemption.data = null;
      })
      .addCase(redeemReward.fulfilled, (state, action) => {
        state.redemption.isLoading = false;
        state.redemption.data = action.payload;
        state.redemption.success = true;
      })
      .addCase(redeemReward.rejected, (state, action) => {
        state.redemption.isLoading = false;
        state.redemption.error = action.payload;
        state.redemption.success = false;
      });
    
    // Obter histórico de resgates
    builder
      .addCase(getRedemptions.pending, (state) => {
        state.redemptions.isLoading = true;
        state.redemptions.error = null;
      })
      .addCase(getRedemptions.fulfilled, (state, action) => {
        state.redemptions.isLoading = false;
        state.redemptions.data = action.payload.redemptions;
        state.redemptions.pagination = action.payload.pagination;
      })
      .addCase(getRedemptions.rejected, (state, action) => {
        state.redemptions.isLoading = false;
        state.redemptions.error = action.payload;
      });
  }
});

// Exportar ações e reducer
export const { 
  setFilters, 
  clearFilters, 
  clearError, 
  resetRedemption,
  resetRewardsState
} = rewardsSlice.actions;

export default rewardsSlice.reducer;