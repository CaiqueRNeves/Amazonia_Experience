import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as eventsApi from '../../api/events';

// Thunks para operações assíncronas

/**
 * Obter lista de eventos
 */
export const getEvents = createAsyncThunk(
  'events/getEvents',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await eventsApi.getEvents(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao obter eventos'
      );
    }
  }
);

/**
 * Obter detalhes de um evento
 */
export const getEventById = createAsyncThunk(
  'events/getEventById',
  async (id, { rejectWithValue }) => {
    try {
      return await eventsApi.getEvent(id);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao obter detalhes do evento'
      );
    }
  }
);

/**
 * Obter eventos próximos por geolocalização
 */
export const getNearbyEvents = createAsyncThunk(
  'events/getNearbyEvents',
  async ({ latitude, longitude, radius = 5, page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      return await eventsApi.getNearbyEvents(latitude, longitude, radius, page, limit);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao obter eventos próximos'
      );
    }
  }
);

/**
 * Realizar check-in em um evento
 */
export const checkInEvent = createAsyncThunk(
  'events/checkInEvent',
  async (eventId, { rejectWithValue }) => {
    try {
      return await eventsApi.checkInEvent(eventId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao realizar check-in'
      );
    }
  }
);

/**
 * Obter eventos em andamento
 */
export const getOngoingEvents = createAsyncThunk(
  'events/getOngoingEvents',
  async (_, { rejectWithValue }) => {
    try {
      return await eventsApi.getOngoingEvents();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao obter eventos em andamento'
      );
    }
  }
);

// Estado inicial
const initialState = {
  events: {
    data: [],
    pagination: { page: 1, totalPages: 1 },
    isLoading: false,
    error: null
  },
  currentEvent: {
    data: null,
    isLoading: false,
    error: null
  },
  nearbyEvents: {
    data: [],
    pagination: { page: 1, totalPages: 1 },
    isLoading: false,
    error: null
  },
  ongoingEvents: {
    data: [],
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
    featured: null,
    startDate: null,
    endDate: null,
    search: ''
  }
};

// Slice de eventos
const eventsSlice = createSlice({
  name: 'events',
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
      const section = action.payload; // 'events', 'currentEvent', 'nearbyEvents', etc.
      if (section && state[section]) {
        state[section].error = null;
      } else {
        // Limpar todos os erros se não houver seção específica
        state.events.error = null;
        state.currentEvent.error = null;
        state.nearbyEvents.error = null;
        state.ongoingEvents.error = null;
        state.checkIn.error = null;
      }
    },
    
    // Resetar estado de check-in
    resetCheckIn: (state) => {
      state.checkIn = { ...initialState.checkIn };
    },
    
    // Resetar estado (útil para logout)
    resetEventsState: () => initialState
  },
  extraReducers: (builder) => {
    // Obter eventos
    builder
      .addCase(getEvents.pending, (state) => {
        state.events.isLoading = true;
        state.events.error = null;
      })
      .addCase(getEvents.fulfilled, (state, action) => {
        state.events.isLoading = false;
        state.events.data = action.payload.events;
        state.events.pagination = action.payload.pagination;
      })
      .addCase(getEvents.rejected, (state, action) => {
        state.events.isLoading = false;
        state.events.error = action.payload;
      });
    
    // Obter detalhes de um evento
    builder
      .addCase(getEventById.pending, (state) => {
        state.currentEvent.isLoading = true;
        state.currentEvent.error = null;
      })
      .addCase(getEventById.fulfilled, (state, action) => {
        state.currentEvent.isLoading = false;
        state.currentEvent.data = action.payload.event;
      })
      .addCase(getEventById.rejected, (state, action) => {
        state.currentEvent.isLoading = false;
        state.currentEvent.error = action.payload;
      });
    
    // Obter eventos próximos
    builder
      .addCase(getNearbyEvents.pending, (state) => {
        state.nearbyEvents.isLoading = true;
        state.nearbyEvents.error = null;
      })
      .addCase(getNearbyEvents.fulfilled, (state, action) => {
        state.nearbyEvents.isLoading = false;
        state.nearbyEvents.data = action.payload.events;
        state.nearbyEvents.pagination = action.payload.pagination;
      })
      .addCase(getNearbyEvents.rejected, (state, action) => {
        state.nearbyEvents.isLoading = false;
        state.nearbyEvents.error = action.payload;
      });
    
    // Obter eventos em andamento
    builder
      .addCase(getOngoingEvents.pending, (state) => {
        state.ongoingEvents.isLoading = true;
        state.ongoingEvents.error = null;
      })
      .addCase(getOngoingEvents.fulfilled, (state, action) => {
        state.ongoingEvents.isLoading = false;
        state.ongoingEvents.data = action.payload.events;
      })
      .addCase(getOngoingEvents.rejected, (state, action) => {
        state.ongoingEvents.isLoading = false;
        state.ongoingEvents.error = action.payload;
      });
    
    // Check-in em evento
    builder
      .addCase(checkInEvent.pending, (state) => {
        state.checkIn.isLoading = true;
        state.checkIn.error = null;
        state.checkIn.success = false;
        state.checkIn.data = null;
      })
      .addCase(checkInEvent.fulfilled, (state, action) => {
        state.checkIn.isLoading = false;
        state.checkIn.data = action.payload;
        state.checkIn.success = true;
      })
      .addCase(checkInEvent.rejected, (state, action) => {
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
  resetEventsState
} = eventsSlice.actions;

export default eventsSlice.reducer;