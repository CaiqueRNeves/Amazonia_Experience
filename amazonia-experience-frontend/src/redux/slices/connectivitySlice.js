import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as connectivityApi from '../../api/connectivity';

// Thunks para operações assíncronas

/**
 * Obter pontos de conectividade
 */
export const getConnectivitySpots = createAsyncThunk(
  'connectivity/getConnectivitySpots',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await connectivityApi.getConnectivitySpots(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao obter pontos de conectividade'
      );
    }
  }
);

/**
 * Obter pontos de conectividade próximos
 */
export const getNearbySpots = createAsyncThunk(
  'connectivity/getNearbySpots',
  async ({ latitude, longitude, radius = 5, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      return await connectivityApi.getNearbySpots(latitude, longitude, radius, page, limit);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao obter pontos de conectividade próximos'
      );
    }
  }
);

/**
 * Reportar informações sobre ponto de conectividade
 */
export const reportSpot = createAsyncThunk(
  'connectivity/reportSpot',
  async ({ spotId, reportData }, { rejectWithValue }) => {
    try {
      return await connectivityApi.reportSpot(spotId, reportData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao reportar ponto de conectividade'
      );
    }
  }
);

/**
 * Obter mapa de calor de qualidade de sinal
 */
export const getHeatmap = createAsyncThunk(
  'connectivity/getHeatmap',
  async (_, { rejectWithValue }) => {
    try {
      return await connectivityApi.getHeatmap();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao obter mapa de calor'
      );
    }
  }
);

// Estado inicial
const initialState = {
  spots: {
    data: [],
    pagination: { page: 1, totalPages: 1 },
    isLoading: false,
    error: null
  },
  nearbySpots: {
    data: [],
    pagination: { page: 1, totalPages: 1 },
    isLoading: false,
    error: null
  },
  report: {
    data: null,
    isLoading: false,
    error: null,
    success: false
  },
  heatmap: {
    data: [],
    isLoading: false,
    error: null
  },
  filters: {
    isFree: null,
    wifiSpeed: null,
    isVerified: null,
    search: ''
  }
};

// Slice de conectividade
const connectivitySlice = createSlice({
  name: 'connectivity',
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
      const section = action.payload; // 'spots', 'nearbySpots', 'report', etc.
      if (section && state[section]) {
        state[section].error = null;
      } else {
        // Limpar todos os erros se não houver seção específica
        state.spots.error = null;
        state.nearbySpots.error = null;
        state.report.error = null;
        state.heatmap.error = null;
      }
    },
    
    // Resetar estado de relatório
    resetReport: (state) => {
      state.report = { ...initialState.report };
    },
    
    // Resetar estado (útil para logout)
    resetConnectivityState: () => initialState
  },
  extraReducers: (builder) => {
    // Obter pontos de conectividade
    builder
      .addCase(getConnectivitySpots.pending, (state) => {
        state.spots.isLoading = true;
        state.spots.error = null;
      })
      .addCase(getConnectivitySpots.fulfilled, (state, action) => {
        state.spots.isLoading = false;
        state.spots.data = action.payload.spots;
        state.spots.pagination = action.payload.pagination;
      })
      .addCase(getConnectivitySpots.rejected, (state, action) => {
        state.spots.isLoading = false;
        state.spots.error = action.payload;
      });
    
    // Obter pontos de conectividade próximos
    builder
      .addCase(getNearbySpots.pending, (state) => {
        state.nearbySpots.isLoading = true;
        state.nearbySpots.error = null;
      })
      .addCase(getNearbySpots.fulfilled, (state, action) => {
        state.nearbySpots.isLoading = false;
        state.nearbySpots.data = action.payload.spots;
        state.nearbySpots.pagination = action.payload.pagination;
      })
      .addCase(getNearbySpots.rejected, (state, action) => {
        state.nearbySpots.isLoading = false;
        state.nearbySpots.error = action.payload;
      });
    
    // Reportar ponto de conectividade
    builder
      .addCase(reportSpot.pending, (state) => {
        state.report.isLoading = true;
        state.report.error = null;
        state.report.success = false;
        state.report.data = null;
      })
      .addCase(reportSpot.fulfilled, (state, action) => {
        state.report.isLoading = false;
        state.report.data = action.payload;
        state.report.success = true;
      })
      .addCase(reportSpot.rejected, (state, action) => {
        state.report.isLoading = false;
        state.report.error = action.payload;
        state.report.success = false;
      });
    
    // Obter mapa de calor
    builder
      .addCase(getHeatmap.pending, (state) => {
        state.heatmap.isLoading = true;
        state.heatmap.error = null;
      })
      .addCase(getHeatmap.fulfilled, (state, action) => {
        state.heatmap.isLoading = false;
        state.heatmap.data = action.payload.heatmap;
      })
      .addCase(getHeatmap.rejected, (state, action) => {
        state.heatmap.isLoading = false;
        state.heatmap.error = action.payload;
      });
  }
});

// Exportar ações e reducer
export const { 
  setFilters, 
  clearFilters, 
  clearError, 
  resetReport,
  resetConnectivityState
} = connectivitySlice.actions;

export default connectivitySlice.reducer;