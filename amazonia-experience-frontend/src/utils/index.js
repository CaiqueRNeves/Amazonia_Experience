/**
 * Exportação centralizada de todos os utilitários
 * Facilita a importação de funções em outros módulos
 */

// Importação de todos os utilitários
import * as api from './api';
import * as analytics from './analytics';
import * as authStorage from './authStorage';
import * as constants from './constants';
import * as dateUtils from './dateUtils';
import * as formatters from './formatters';
import * as geo from './geo';
import * as permissions from './permissions';
import * as storageUtils from './storageUtils';
import * as validators from './validators';

// Hooks personalizados
import hooks from '../hooks';

// Exportação agrupada
export {
  api,
  analytics,
  authStorage,
  constants,
  dateUtils,
  formatters,
  geo,
  permissions,
  storageUtils,
  validators,
  hooks
};

// Exportação individual para facilitar importações específicas
export { default as api } from './api';
export { default as analytics } from './analytics';
export { default as authStorage } from './authStorage';
export { default as constants } from './constants';
export { default as dateUtils } from './dateUtils';
export { default as formatters } from './formatters';
export { default as geo } from './geo';
export { default as permissions } from './permissions';
export { default as storageUtils } from './storageUtils';
export { default as validators } from './validators';

// Exportação padrão com todos os utilitários
export default {
  api,
  analytics,
  authStorage,
  constants,
  dateUtils,
  formatters,
  geo,
  permissions,
  storageUtils,
  validators,
  hooks
};