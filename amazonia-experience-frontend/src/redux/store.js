import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

// Importar reducers
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import eventsReducer from './slices/eventsSlice';
import placesReducer from './slices/placesSlice';
import quizzesReducer from './slices/quizzesSlice';
import rewardsReducer from './slices/rewardsSlice';
import emergencyReducer from './slices/emergencySlice';
import connectivityReducer from './slices/connectivitySlice';
import chatReducer from './slices/chatSlice';
import uiReducer from './slices/uiSlice';

// Combinar reducers
const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  events: eventsReducer,
  places: placesReducer,
  quizzes: quizzesReducer,
  rewards: rewardsReducer,
  emergency: emergencyReducer,
  connectivity: connectivityReducer,
  chat: chatReducer,
  ui: uiReducer
});

// Configurar store
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore essas actions para verificação de serializabilidade
        ignoredActions: ['ui/setModal', 'chat/setMessages'],
        // Ignore esses caminhos em determinadas actions
        ignoredActionPaths: ['payload.timestamp', 'meta.arg'],
        // Ignore esses caminhos no state
        ignoredPaths: ['ui.modal', 'chat.messages']
      }
    }),
  devTools: process.env.NODE_ENV !== 'production'
});

export default store;