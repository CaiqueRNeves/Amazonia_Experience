import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as emergencyApi from '../../api/emergency';

// Thunks para operações assíncronas

/**
 * Obter serviços de emergência
 */
export const getEmergencyServices = createAsyncThunk(
  'emergency/getEmergencyServices',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await emergencyApi.getEmergencyServices(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao obter serviços de emergência'
      );
    }
  }
);

/**
 * Obter serviços por tipo
 */
export const getServicesByType = createAsyncThunk(
  'emergency/getServicesByType',
  async ({ type, params = {} }, { rejectWithValue }) => {
    try {
      return await emergencyApi.getServicesByType(type, params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao obter serviços por tipo'
      );
    }
  }
);

/**
 * Obter serviços próximos
 */
export const getNearbyServices = createAsyncThunk(
  'emergency/getNearbyServices',
  async ({ latitude, longitude, radius = 5, type = null, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      return await emergencyApi.getNearbyServices(latitude, longitude, radius, type, page, limit);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao obter serviços próximos'
      );
    }
  }
);

/**
 * Obter contatos de emergência por idioma
 */
export const getContactsByLanguage = createAsyncThunk(
  'emergency/getContactsByLanguage',
  async (language, { rejectWithValue }) => {
    try {
      return await emergencyApi.getContactsByLanguage(language);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao obter contatos de emergência'
      );
    }
  }
);

/**
 * Obter frases de emergência por idioma
 */
export const getPhrasesByLanguage = createAsyncThunk(
  'emergency/getPhrasesByLanguage',
  async (language, { rejectWithValue }) => {
    try {
      return await emergencyApi.getPhrasesByLanguage(language);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao obter frases de emergência'
      );
    }
  }
);

// Estado inicial
const initialState = {
  services: {
    data: [],
    pagination: { page: 1, totalPages: 1 },
    isLoading: false,
    error: null
  },
  servicesByType: {
    data: [],
    type: null,
    pagination: { page: 1, totalPages: 1 },
    isLoading: false,
    error: null
  },
  nearbyServices: {
    data: [],
    pagination: { page: 1, totalPages: 1 },
    isLoading: false,
    error: null
  },
  contacts: {
    data: null,
    language: null,
    isLoading: false,
    error: null
  },
  phrases: {
    data: null,
    language: null,
    isLoading: false,
    error: null
  },
  filters: {
    is24h: null,
    language: null,
    search: ''
  }
};

// Slice de serviços de emergência
const emergencySlice = createSlice({
  name: 'emergency',
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
      const section = action.payload; // 'services', 'nearbyServices', 'contacts', etc.
      if (section && state[section]) {
        state[section].error = null;
      } else {
        // Limpar todos os erros se não houver seção específica
        state.services.error = null;
        state.servicesByType.error = null;
        state.nearbyServices.error = null;
        state.contacts.error = null;
        state.phrases.error = null;
      }
    },
    
    // Resetar estado (útil para logout)
    resetEmergencyState: () => initialState
  },
  extraReducers: (builder) => {
    // Obter serviços de emergência
    builder
      .addCase(getEmergencyServices.pending, (state) => {
        state.services.isLoading = true;
        state.services.error = null;
      })
      .addCase(getEmergencyServices.fulfilled, (state, action) => {
        state.services.isLoading = false;
        state.services.data = action.payload.services;
        state.services.pagination = action.payload.pagination;
      })
      .addCase(getEmergencyServices.rejected, (state, action) => {
        state.services.isLoading = false;
        state.services.error = action.payload;
      });
    
    // Obter serviços por tipo
    builder
      .addCase(getServicesByType.pending, (state) => {
        state.servicesByType.isLoading = true;
        state.servicesByType.error = null;
      })
      .addCase(getServicesByType.fulfilled, (state, action) => {
        state.servicesByType.isLoading = false;
        state.servicesByType.data = action.payload.services;
        state.servicesByType.type = action.meta.arg.type;
        state.servicesByType.pagination = action.payload.pagination;
      })
      .addCase(getServicesByType.rejected, (state, action) => {
        state.servicesByType.isLoading = false;
        state.servicesByType.error = action.payload;
      });
    
    // Obter serviços próximos
    builder
      .addCase(getNearbyServices.pending, (state) => {
        state.nearbyServices.isLoading = true;
        state.nearbyServices.error = null;
      })
      .addCase(getNearbyServices.fulfilled, (state, action) => {
        state.nearbyServices.isLoading = false;
        state.nearbyServices.data = action.payload.services;
        state.nearbyServices.pagination = action.payload.pagination;
      })
      .addCase(getNearbyServices.rejected, (state, action) => {
        state.nearbyServices.isLoading = false;
        state.nearbyServices.error = action.payload;
      });
    
    // Obter contatos de emergência
    builder
      .addCase(getContactsByLanguage.pending, (state) => {
        state.contacts.isLoading = true;
        state.contacts.error = null;
      })
      .addCase(getContactsByLanguage.fulfilled, (state, action) => {
        state.contacts.isLoading = false;
        state.contacts.data = action.payload.contacts;
        state.contacts.language = action.meta.arg; // O idioma solicitado
      })
      .addCase(getContactsByLanguage.rejected, (state, action) => {
        state.contacts.isLoading = false;
        state.contacts.error = action.payload;
      });
    
    // Obter frases de emergência
    builder
      .addCase(getPhrasesByLanguage.pending, (state) => {
        state.phrases.isLoading = true;
        state.phrases.error = null;
      })
      .addCase(getPhrasesByLanguage.fulfilled, (state, action) => {
        state.phrases.isLoading = false;
        state.phrases.data = action.payload.phrases;
        state.phrases.language = action.meta.arg; // O idioma solicitado
      })
      .addCase(getPhrasesByLanguage.rejected, (state, action) => {
        state.phrases.isLoading = false;
        state.phrases.error = action.payload;
      });
  }
});

// Exportar ações e reducer
export const { 
  setFilters, 
  clearFilters, 
  clearError,
  resetEmergencyState
} = emergencySlice.actions;

export default emergencySlice.reducer;