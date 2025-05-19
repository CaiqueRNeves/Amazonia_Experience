/**
 * Exporta funções e componentes do Redux
 */

import store from './store';
import reducers, * as slices from './slices';

// Exporta o store
export { store };

// Exporta reducers combinados
export { reducers };

// Exporta todos os slices individuais e suas actions
export * from './slices';

// Exportação padrão do store
export default store;