import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as quizzesApi from '../../api/quizzes';

// Thunks para operações assíncronas

/**
 * Obter lista de quizzes
 */
export const getQuizzes = createAsyncThunk(
  'quizzes/getQuizzes',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await quizzesApi.getQuizzes(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao obter quizzes'
      );
    }
  }
);

/**
 * Obter detalhes de um quiz
 */
export const getQuizById = createAsyncThunk(
  'quizzes/getQuizById',
  async (id, { rejectWithValue }) => {
    try {
      return await quizzesApi.getQuiz(id);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao obter detalhes do quiz'
      );
    }
  }
);

/**
 * Iniciar uma tentativa de quiz
 */
export const startQuiz = createAsyncThunk(
  'quizzes/startQuiz',
  async (quizId, { rejectWithValue }) => {
    try {
      return await quizzesApi.startQuiz(quizId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao iniciar quiz'
      );
    }
  }
);

/**
 * Responder uma pergunta de quiz
 */
export const answerQuiz = createAsyncThunk(
  'quizzes/answerQuiz',
  async ({ attemptId, questionId, answer }, { rejectWithValue }) => {
    try {
      return await quizzesApi.answerQuiz(attemptId, questionId, answer);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao responder pergunta'
      );
    }
  }
);

/**
 * Finalizar uma tentativa de quiz
 */
export const submitQuiz = createAsyncThunk(
  'quizzes/submitQuiz',
  async (attemptId, { rejectWithValue }) => {
    try {
      return await quizzesApi.submitQuiz(attemptId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao finalizar quiz'
      );
    }
  }
);

/**
 * Obter histórico de tentativas de quiz
 */
export const getQuizAttempts = createAsyncThunk(
  'quizzes/getQuizAttempts',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await quizzesApi.getQuizAttempts(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao obter histórico de tentativas'
      );
    }
  }
);

/**
 * Obter leaderboard de quizzes
 */
export const getLeaderboard = createAsyncThunk(
  'quizzes/getLeaderboard',
  async ({ quizId = null, page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      return await quizzesApi.getLeaderboard(quizId, page, limit);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Falha ao obter ranking'
      );
    }
  }
);

// Estado inicial
const initialState = {
  quizzes: {
    data: [],
    pagination: { page: 1, totalPages: 1 },
    isLoading: false,
    error: null
  },
  currentQuiz: {
    data: null,
    questions: [],
    isLoading: false,
    error: null
  },
  attempts: {
    data: [],
    pagination: { page: 1, totalPages: 1 },
    isLoading: false,
    error: null
  },
  leaderboard: {
    data: [],
    pagination: { page: 1, totalPages: 1 },
    isLoading: false,
    error: null
  },
  currentAttempt: {
    data: null,
    answers: [],
    isLoading: false,
    error: null,
    status: null // 'in_progress', 'completed', 'expired'
  },
  currentAnswer: {
    isLoading: false,
    error: null,
    data: null
  },
  result: {
    data: null,
    isLoading: false,
    error: null
  },
  filters: {
    difficulty: null,
    topic: null,
    search: ''
  }
};

// Slice de quizzes
const quizzesSlice = createSlice({
  name: 'quizzes',
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
    
    // Adicionar resposta ao histórico local
    addAnswer: (state, action) => {
      const { questionId, answer, isCorrect } = action.payload;
      state.currentAttempt.answers.push({
        questionId,
        answer,
        isCorrect,
        answeredAt: new Date().toISOString()
      });
    },
    
    // Limpar tentativa atual
    clearCurrentAttempt: (state) => {
      state.currentAttempt = { ...initialState.currentAttempt };
      state.result = { ...initialState.result };
    },
    
    // Limpar mensagens de erro
    clearError: (state, action) => {
      const section = action.payload; // 'quizzes', 'currentQuiz', 'attempts', etc.
      if (section && state[section]) {
        state[section].error = null;
      } else {
        // Limpar todos os erros se não houver seção específica
        state.quizzes.error = null;
        state.currentQuiz.error = null;
        state.attempts.error = null;
        state.leaderboard.error = null;
        state.currentAttempt.error = null;
        state.currentAnswer.error = null;
        state.result.error = null;
      }
    },
    
    // Resetar estado (útil para logout)
    resetQuizzesState: () => initialState
  },
  extraReducers: (builder) => {
    // Obter quizzes
    builder
      .addCase(getQuizzes.pending, (state) => {
        state.quizzes.isLoading = true;
        state.quizzes.error = null;
      })
      .addCase(getQuizzes.fulfilled, (state, action) => {
        state.quizzes.isLoading = false;
        state.quizzes.data = action.payload.quizzes;
        state.quizzes.pagination = action.payload.pagination;
      })
      .addCase(getQuizzes.rejected, (state, action) => {
        state.quizzes.isLoading = false;
        state.quizzes.error = action.payload;
      });
    
    // Obter detalhes de um quiz
    builder
      .addCase(getQuizById.pending, (state) => {
        state.currentQuiz.isLoading = true;
        state.currentQuiz.error = null;
      })
      .addCase(getQuizById.fulfilled, (state, action) => {
        state.currentQuiz.isLoading = false;
        state.currentQuiz.data = action.payload.quiz;
        state.currentQuiz.questions = action.payload.questions;
      })
      .addCase(getQuizById.rejected, (state, action) => {
        state.currentQuiz.isLoading = false;
        state.currentQuiz.error = action.payload;
      });
    
    // Iniciar tentativa de quiz
    builder
      .addCase(startQuiz.pending, (state) => {
        state.currentAttempt.isLoading = true;
        state.currentAttempt.error = null;
      })
      .addCase(startQuiz.fulfilled, (state, action) => {
        state.currentAttempt.isLoading = false;
        state.currentAttempt.data = action.payload.attempt;
        state.currentAttempt.status = 'in_progress';
        state.currentAttempt.answers = [];
      })
      .addCase(startQuiz.rejected, (state, action) => {
        state.currentAttempt.isLoading = false;
        state.currentAttempt.error = action.payload;
      });
    
    // Responder pergunta
    builder
      .addCase(answerQuiz.pending, (state) => {
        state.currentAnswer.isLoading = true;
        state.currentAnswer.error = null;
      })
      .addCase(answerQuiz.fulfilled, (state, action) => {
        state.currentAnswer.isLoading = false;
        state.currentAnswer.data = action.payload;
        
        // Adicionar resposta ao histórico
        state.currentAttempt.answers.push({
          questionId: action.payload.question_id,
          isCorrect: action.payload.is_correct,
          answeredAt: new Date().toISOString()
        });
      })
      .addCase(answerQuiz.rejected, (state, action) => {
        state.currentAnswer.isLoading = false;
        state.currentAnswer.error = action.payload;
      });
    
    // Finalizar quiz
    builder
      .addCase(submitQuiz.pending, (state) => {
        state.result.isLoading = true;
        state.result.error = null;
      })
      .addCase(submitQuiz.fulfilled, (state, action) => {
        state.result.isLoading = false;
        state.result.data = action.payload;
        state.currentAttempt.status = 'completed';
      })
      .addCase(submitQuiz.rejected, (state, action) => {
        state.result.isLoading = false;
        state.result.error = action.payload;
      });
    
    // Obter histórico de tentativas
    builder
      .addCase(getQuizAttempts.pending, (state) => {
        state.attempts.isLoading = true;
        state.attempts.error = null;
      })
      .addCase(getQuizAttempts.fulfilled, (state, action) => {
        state.attempts.isLoading = false;
        state.attempts.data = action.payload.attempts;
        state.attempts.pagination = action.payload.pagination;
      })
      .addCase(getQuizAttempts.rejected, (state, action) => {
        state.attempts.isLoading = false;
        state.attempts.error = action.payload;
      });
    
    // Obter leaderboard
    builder
      .addCase(getLeaderboard.pending, (state) => {
        state.leaderboard.isLoading = true;
        state.leaderboard.error = null;
      })
      .addCase(getLeaderboard.fulfilled, (state, action) => {
        state.leaderboard.isLoading = false;
        state.leaderboard.data = action.payload.leaderboard;
        state.leaderboard.pagination = action.payload.pagination;
      })
      .addCase(getLeaderboard.rejected, (state, action) => {
        state.leaderboard.isLoading = false;
        state.leaderboard.error = action.payload;
      });
  }
});

// Exportar ações e reducer
export const { 
  setFilters, 
  clearFilters, 
  addAnswer, 
  clearCurrentAttempt,
  clearError,
  resetQuizzesState
} = quizzesSlice.actions;

export default quizzesSlice.reducer;