/**
 * Índice de slices do Redux
 * Exporta todos os slices de um único lugar
 */

// Importação dos slices
import authReducer from './authSlice';
import userReducer from './userSlice';
import eventsReducer from './eventsSlice';
import placesReducer from './placesSlice';
import quizzesReducer from './quizzesSlice';
import rewardsReducer from './rewardsSlice';
import emergencyReducer from './emergencySlice';
import connectivityReducer from './connectivitySlice';
import chatReducer from './chatSlice';
import uiReducer from './uiSlice';

// Exportação por categoria
export const reducers = {
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
};

// Exportação individual para uso específico
export {
  authReducer,
  userReducer,
  eventsReducer,
  placesReducer,
  quizzesReducer,
  rewardsReducer,
  emergencyReducer,
  connectivityReducer,
  chatReducer,
  uiReducer
};

// Exportação das actions
export * from './authSlice';
export * from './userSlice';
export * from './eventsSlice';
export * from './placesSlice';
export * from './quizzesSlice';
export * from './rewardsSlice';
export * from './emergencySlice';
export * from './connectivitySlice';
export * from './chatSlice';
export * from './uiSlice';

// Exportação padrão
export default reducers;