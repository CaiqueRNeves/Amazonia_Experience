import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as placesApi from '../../api/places';

// Thunks para operações assíncronas

/**
 * Obter lista de locais
 */
export const getPlaces = createAsyncThunk(
  'places/getPlaces',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await placesApi.getPlaces(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao obter locais'
      );
    }
  }
);

/**
 * Obter detalhes de um local
 */
export const getPlaceById = createAsyncThunk(
  'places/getPlaceById',
  async (id, { rejectWithValue }) => {
    try {
      return await placesApi.getPlace(id);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao obter detalhes do local'
      );
    }
  }
);

/**
 * Obter locais próximos por geolocalização
 */
export const getNearbyPlaces = createAsyncThunk(
  'places/getNearbyPlaces',
  async ({ latitude, longitude, radius = 5, page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      return await placesApi.getNearbyPlaces(latitude, longitude, radius, page, limit);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao obter locais próximos'
      );
    }
  }
);

/**
 * Realizar check-in em um local
 */
export const checkInPlace = createAsyncThunk(
  'places/checkInPlace',
  async (placeId, { rejectWithValue }) => {
    try {
      return await placesApi.checkInPlace(placeId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao realizar check-in'
      );
    }
  }
);

// Estado inicial
const initialState = {
  places: {
    data: [],
    pagination: { page: 1, totalPages: 1 },
    isLoading: false,
    error: null
  },
  currentPlace: {
    data: null,
    isLoading: false,
    error: null
  },
  nearbyPlaces: {
    data: [],
    pagination: { page: 1, totalPages: 1 },
    isLoading: false,
    error: null
  },
  checkIn: {
    data: null,
    isLoading: false,
    error: null,
    success: false
  },
  filters: {
    type: null,
    partnerId: null,
    wifiAvailable: null,
    search: ''
  }
};

// Slice de locais
const placesSlice = createSlice({
  name: 'places',
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
      const section = action.payload; // 'places', 'currentPlace', 'nearbyPlaces', etc.
      if (section && state[section]) {
        state[section].error = null;
      } else {
        // Limpar todos os erros se não houver seção específica
        state.places.error = null;
        state.currentPlace.error = null;
        state.nearbyPlaces.error = null;
        state.checkIn.error = null;
      }
    },
    
    // Resetar estado de check-in
    resetCheckIn: (state) => {
      state.checkIn = { ...initialState.checkIn };
    },
    
    // Resetar estado (útil para logout)
    resetPlacesState: () => initialState
  },
  extraReducers: (builder) => {
    // Obter locais
    builder
      .addCase(getPlaces.pending, (state) => {
        state.places.isLoading = true;
        state.places.error = null;
      })
      .addCase(getPlaces.fulfilled, (state, action) => {
        state.places.isLoading = false;
        state.places.data = action.payload.places;
        state.places.pagination = action.payload.pagination;
      })
      .addCase(getPlaces.rejected, (state, action) => {
        state.places.isLoading = false;
        state.places.error = action.payload;
      });
    
    // Obter detalhes de um local
    builder
      .addCase(getPlaceById.pending, (state) => {
        state.currentPlace.isLoading = true;
        state.currentPlace.error = null;
      })
      .addCase(getPlaceById.fulfilled, (state, action) => {
        state.currentPlace.isLoading = false;
        state.currentPlace.data = action.payload.place;
      })
      .addCase(getPlaceById.rejected, (state, action) => {
        state.currentPlace.isLoading = false;
        state.currentPlace.error = action.payload;
      });
    
    // Obter locais próximos
    builder
      .addCase(getNearbyPlaces.pending, (state) => {
        state.nearbyPlaces.isLoading = true;
        state.nearbyPlaces.error = null;
      })
      .addCase(getNearbyPlaces.fulfilled, (state, action) => {
        state.nearbyPlaces.isLoading = false;
        state.nearbyPlaces.data = action.payload.places;
        state.nearbyPlaces.pagination = action.payload.pagination;
      })
      .addCase(getNearbyPlaces.rejected, (state, action) => {
        state.nearbyPlaces.isLoading = false;
        state.nearbyPlaces.error = action.payload;
      });
    
    // Check-in em local
    builder
      .addCase(checkInPlace.pending, (state) => {
        state.checkIn.isLoading = true;
        state.checkIn.error = null;
        state.checkIn.success = false;
        state.checkIn.data = null;
      })
      .addCase(checkInPlace.fulfilled, (state, action) => {
        state.checkIn.isLoading = false;
        state.checkIn.data = action.payload;
        state.checkIn.success = true;
      })
      .addCase(checkInPlace.rejected, (state, action) => {
        state.checkIn.isLoading = false;
        state.checkIn.error = action.payload;
        state.checkIn.success = false;
      });
  }
});

// Exportar ações e reducer
export const { 
  setFilters, 
  clearFilters, 
  clearError, 
  resetCheckIn,
  resetPlacesState
} = placesSlice.actions;

export default placesSlice.reducer;