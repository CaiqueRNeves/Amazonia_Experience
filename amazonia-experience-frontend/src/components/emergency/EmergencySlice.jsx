import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import emergencyService from '../../services/emergencyService';

/**
 * Actions assíncronas para buscar dados de serviços de emergência
 */

/**
 * Obter todos os serviços de emergência
 */
export const getEmergencyServices = createAsyncThunk(
  'emergency/getServices',
  async (params = {}, { rejectWithValue }) => {
    try {
      const result = await emergencyService.getEmergencyServices(params);
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

/**
 * Obter serviços de emergência por tipo
 */
export const getServicesByType = createAsyncThunk(
  'emergency/getServicesByType',
  async ({ type, params = {} }, { rejectWithValue }) => {
    try {
      const result = await emergencyService.getServicesByType(type, params);
      return { type, data: result };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

/**
 * Obter serviços de emergência próximos
 */
export const getNearbyServices = createAsyncThunk(
  'emergency/getNearbyServices',
  async ({ latitude, longitude, radius = 5, type = null, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const result = await emergencyService.getNearbyServices(
        latitude,
        longitude,
        radius,
        type,
        { page, limit }
      );
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
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
      const result = await emergencyService.getContactsByLanguage(language);
      return { language, data: result };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

/**
 * Obter frases úteis por idioma
 */
export const getPhrasesByLanguage = createAsyncThunk(
  'emergency/getPhrasesByLanguage',
  async (language, { rejectWithValue }) => {
    try {
      const result = await emergencyService.getPhrasesByLanguage(language);
      return { language, data: result };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

/**
 * Obter detalhes de um serviço específico
 */
export const getServiceById = createAsyncThunk(
  'emergency/getServiceById',
  async (id, { rejectWithValue }) => {
    try {
      const result = await emergencyService.getServiceById(id);
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

/**
 * Estado inicial do slice
 */
const initialState = {
  // Serviços de emergência
  services: {
    data: [],
    isLoading: false,
    error: null
  },
  // Filtro por tipo de serviço
  servicesByType: {
    data: [],
    isLoading: false,
    error: null
  },
  // Serviços próximos
  nearbyServices: {
    data: [],
    isLoading: false,
    error: null
  },
  // Contatos de emergência
  contacts: {
    data: {},
    language: null,
    isLoading: false,
    error: null
  },
  // Frases úteis
  phrases: {
    data: {},
    language: null,
    isLoading: false,
    error: null
  },
  // Serviço selecionado
  selectedService: null,
  // Filtros ativos
  activeFilters: {
    type: null,
    is24h: false,
    languages: []
  }
};

/**
 * Slice de emergência para gerenciar serviços, contatos e frases
 */
const emergencySlice = createSlice({
  name: 'emergency',
  initialState,
  reducers: {
    /**
     * Selecionar um serviço para ver detalhes
     */
    setSelectedService: (state, action) => {
      state.selectedService = action.payload;
    },
    
    /**
     * Limpar serviço selecionado
     */
    clearSelectedService: (state) => {
      state.selectedService = null;
    },
    
    /**
     * Definir filtros para serviços
     */
    setFilters: (state, action) => {
      state.activeFilters = {
        ...state.activeFilters,
        ...action.payload
      };
    },
    
    /**
     * Limpar todos os filtros
     */
    clearFilters: (state) => {
      state.activeFilters = {
        type: null,
        is24h: false,
        languages: []
      };
    }
  },
  extraReducers: (builder) => {
    // Manipuladores para getEmergencyServices
    builder
      .addCase(getEmergencyServices.pending, (state) => {
        state.services.isLoading = true;
        state.services.error = null;
      })
      .addCase(getEmergencyServices.fulfilled, (state, action) => {
        state.services.isLoading = false;
        state.services.data = action.payload.services || [];
      })
      .addCase(getEmergencyServices.rejected, (state, action) => {
        state.services.isLoading = false;
        state.services.error = action.payload || { message: 'Erro desconhecido' };
      })
      
      // Manipuladores para getServicesByType
      .addCase(getServicesByType.pending, (state) => {
        state.servicesByType.isLoading = true;
        state.servicesByType.error = null;
      })
      .addCase(getServicesByType.fulfilled, (state, action) => {
        state.servicesByType.isLoading = false;
        state.servicesByType.data = action.payload.data.services || [];
        // Atualizar filtro ativo
        state.activeFilters.type = action.payload.type;
      })
      .addCase(getServicesByType.rejected, (state, action) => {
        state.servicesByType.isLoading = false;
        state.servicesByType.error = action.payload || { message: 'Erro desconhecido' };
      })
      
      // Manipuladores para getNearbyServices
      .addCase(getNearbyServices.pending, (state) => {
        state.nearbyServices.isLoading = true;
        state.nearbyServices.error = null;
      })
      .addCase(getNearbyServices.fulfilled, (state, action) => {
        state.nearbyServices.isLoading = false;
        state.nearbyServices.data = action.payload.services || [];
      })
      .addCase(getNearbyServices.rejected, (state, action) => {
        state.nearbyServices.isLoading = false;
        state.nearbyServices.error = action.payload || { message: 'Erro desconhecido' };
      })
      
      // Manipuladores para getContactsByLanguage
      .addCase(getContactsByLanguage.pending, (state) => {
        state.contacts.isLoading = true;
        state.contacts.error = null;
      })
      .addCase(getContactsByLanguage.fulfilled, (state, action) => {
        state.contacts.isLoading = false;
        state.contacts.data = action.payload.data.contacts || {};
        state.contacts.language = action.payload.language;
      })
      .addCase(getContactsByLanguage.rejected, (state, action) => {
        state.contacts.isLoading = false;
        state.contacts.error = action.payload || { message: 'Erro desconhecido' };
      })
      
      // Manipuladores para getPhrasesByLanguage
      .addCase(getPhrasesByLanguage.pending, (state) => {
        state.phrases.isLoading = true;
        state.phrases.error = null;
      })
      .addCase(getPhrasesByLanguage.fulfilled, (state, action) => {
        state.phrases.isLoading = false;
        state.phrases.data = action.payload.data.phrases || {};
        state.phrases.language = action.payload.language;
      })
      .addCase(getPhrasesByLanguage.rejected, (state, action) => {
        state.phrases.isLoading = false;
        state.phrases.error = action.payload || { message: 'Erro desconhecido' };
      })
      
      // Manipuladores para getServiceById
      .addCase(getServiceById.fulfilled, (state, action) => {
        state.selectedService = action.payload;
      });
  }
});

// Exportar ações e reducer
export const { 
  setSelectedService,
  clearSelectedService,
  setFilters,
  clearFilters
} = emergencySlice.actions;

export default emergencySlice.reducer;