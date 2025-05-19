/**
 * Utilitários para gerenciamento de armazenamento local
 * Funções para trabalhar com localStorage e sessionStorage
 */

/**
 * Salva um item no localStorage com suporte a objetos
 * @param {string} key - Chave para o item
 * @param {any} value - Valor a ser armazenado
 * @returns {boolean} True se o item foi salvo com sucesso
 */
export const setLocalItem = (key, value) => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.error(`Erro ao salvar item '${key}' no localStorage:`, error);
    return false;
  }
};

/**
 * Recupera um item do localStorage com suporte a objetos
 * @param {string} key - Chave do item
 * @param {any} defaultValue - Valor padrão caso o item não exista
 * @returns {any} Valor recuperado ou valor padrão
 */
export const getLocalItem = (key, defaultValue = null) => {
  try {
    const serializedValue = localStorage.getItem(key);
    if (serializedValue === null) return defaultValue;
    return JSON.parse(serializedValue);
  } catch (error) {
    console.error(`Erro ao obter item '${key}' do localStorage:`, error);
    return defaultValue;
  }
};

/**
 * Remove um item do localStorage
 * @param {string} key - Chave do item a ser removido
 * @returns {boolean} True se o item foi removido com sucesso
 */
export const removeLocalItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Erro ao remover item '${key}' do localStorage:`, error);
    return false;
  }
};

/**
 * Salva um item no sessionStorage com suporte a objetos
 * @param {string} key - Chave para o item
 * @param {any} value - Valor a ser armazenado
 * @returns {boolean} True se o item foi salvo com sucesso
 */
export const setSessionItem = (key, value) => {
  try {
    const serializedValue = JSON.stringify(value);
    sessionStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.error(`Erro ao salvar item '${key}' no sessionStorage:`, error);
    return false;
  }
};

/**
 * Recupera um item do sessionStorage com suporte a objetos
 * @param {string} key - Chave do item
 * @param {any} defaultValue - Valor padrão caso o item não exista
 * @returns {any} Valor recuperado ou valor padrão
 */
export const getSessionItem = (key, defaultValue = null) => {
  try {
    const serializedValue = sessionStorage.getItem(key);
    if (serializedValue === null) return defaultValue;
    return JSON.parse(serializedValue);
  } catch (error) {
    console.error(`Erro ao obter item '${key}' do sessionStorage:`, error);
    return defaultValue;
  }
};

/**
 * Remove um item do sessionStorage
 * @param {string} key - Chave do item a ser removido
 * @returns {boolean} True se o item foi removido com sucesso
 */
export const removeSessionItem = (key) => {
  try {
    sessionStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Erro ao remover item '${key}' do sessionStorage:`, error);
    return false;
  }
};

/**
 * Limpa todos os itens do localStorage
 * @returns {boolean} True se a operação foi bem-sucedida
 */
export const clearLocalStorage = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Erro ao limpar localStorage:', error);
    return false;
  }
};

/**
 * Limpa todos os itens do sessionStorage
 * @returns {boolean} True se a operação foi bem-sucedida
 */
export const clearSessionStorage = () => {
  try {
    sessionStorage.clear();
    return true;
  } catch (error) {
    console.error('Erro ao limpar sessionStorage:', error);
    return false;
  }
};

/**
 * Verifica se o navegador suporta localStorage
 * @returns {boolean} True se localStorage é suportado
 */
export const isLocalStorageSupported = () => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Obtém o espaço utilizado no localStorage em bytes
 * @returns {number} Espaço utilizado em bytes
 */
export const getLocalStorageUsage = () => {
  try {
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      totalSize += key.length + value.length;
    }
    return totalSize;
  } catch (error) {
    console.error('Erro ao calcular uso do localStorage:', error);
    return 0;
  }
};

export default {
  setLocalItem,
  getLocalItem,
  removeLocalItem,
  setSessionItem,
  getSessionItem,
  removeSessionItem,
  clearLocalStorage,
  clearSessionStorage,
  isLocalStorageSupported,
  getLocalStorageUsage
};