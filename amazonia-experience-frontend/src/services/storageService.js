import errorService from './errorService';

/**
 * Serviço para gerenciamento de armazenamento local
 * Fornece métodos para acessar localStorage, sessionStorage e IndexedDB
 */
const storageService = {
  /**
   * Configuração de prefixo para chaves
   */
  prefix: 'amazonia_experience_',

  /**
   * Define o valor de uma chave no localStorage
   * @param {string} key - Chave para armazenar o valor
   * @param {any} value - Valor a ser armazenado
   * @returns {boolean} Sucesso da operação
   */
  set(key, value) {
    try {
      const prefixedKey = this.prefix + key;
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(prefixedKey, serializedValue);
      return true;
    } catch (error) {
      errorService.logError({
        message: `Erro ao salvar ${key} no localStorage`,
        error,
        category: errorService.categories.STORAGE
      });
      return false;
    }
  },

  /**
   * Obtém o valor de uma chave do localStorage
   * @param {string} key - Chave do valor a ser obtido
   * @param {any} defaultValue - Valor padrão caso a chave não exista
   * @returns {any} Valor armazenado ou valor padrão
   */
  get(key, defaultValue = null) {
    try {
      const prefixedKey = this.prefix + key;
      const serializedValue = localStorage.getItem(prefixedKey);
      
      if (serializedValue === null) {
        return defaultValue;
      }
      
      return JSON.parse(serializedValue);
    } catch (error) {
      errorService.logError({
        message: `Erro ao obter ${key} do localStorage`,
        error,
        category: errorService.categories.STORAGE
      });
      return defaultValue;
    }
  },

  /**
   * Remove uma chave do localStorage
   * @param {string} key - Chave a ser removida
   * @returns {boolean} Sucesso da operação
   */
  remove(key) {
    try {
      const prefixedKey = this.prefix + key;
      localStorage.removeItem(prefixedKey);
      return true;
    } catch (error) {
      errorService.logError({
        message: `Erro ao remover ${key} do localStorage`,
        error,
        category: errorService.categories.STORAGE
      });
      return false;
    }
  },

  /**
   * Verifica se uma chave existe no localStorage
   * @param {string} key - Chave a ser verificada
   * @returns {boolean} Verdadeiro se a chave existir
   */
  has(key) {
    try {
      const prefixedKey = this.prefix + key;
      return localStorage.getItem(prefixedKey) !== null;
    } catch (error) {
      errorService.logError({
        message: `Erro ao verificar ${key} no localStorage`,
        error,
        category: errorService.categories.STORAGE
      });
      return false;
    }
  },

  /**
   * Define o valor de uma chave no sessionStorage
   * @param {string} key - Chave para armazenar o valor
   * @param {any} value - Valor a ser armazenado
   * @returns {boolean} Sucesso da operação
   */
  setSession(key, value) {
    try {
      const prefixedKey = this.prefix + key;
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(prefixedKey, serializedValue);
      return true;
    } catch (error) {
      errorService.logError({
        message: `Erro ao salvar ${key} no sessionStorage`,
        error,
        category: errorService.categories.STORAGE
      });
      return false;
    }
  },

  /**
   * Obtém o valor de uma chave do sessionStorage
   * @param {string} key - Chave do valor a ser obtido
   * @param {any} defaultValue - Valor padrão caso a chave não exista
   * @returns {any} Valor armazenado ou valor padrão
   */
  getSession(key, defaultValue = null) {
    try {
      const prefixedKey = this.prefix + key;
      const serializedValue = sessionStorage.getItem(prefixedKey);
      
      if (serializedValue === null) {
        return defaultValue;
      }
      
      return JSON.parse(serializedValue);
    } catch (error) {
      errorService.logError({
        message: `Erro ao obter ${key} do sessionStorage`,
        error,
        category: errorService.categories.STORAGE
      });
      return defaultValue;
    }
  },

  /**
   * Remove uma chave do sessionStorage
   * @param {string} key - Chave a ser removida
   * @returns {boolean} Sucesso da operação
   */
  removeSession(key) {
    try {
      const prefixedKey = this.prefix + key;
      sessionStorage.removeItem(prefixedKey);
      return true;
    } catch (error) {
      errorService.logError({
        message: `Erro ao remover ${key} do sessionStorage`,
        error,
        category: errorService.categories.STORAGE
      });
      return false;
    }
  },
  
  /**
   * Verifica se o localStorage está disponível
   * @returns {boolean} Verdadeiro se disponível
   */
  isLocalStorageAvailable() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Limpa todas as chaves do localStorage que pertencem à aplicação
   * @returns {boolean} Sucesso da operação
   */
  clearAll() {
    try {
      const keys = Object.keys(localStorage);
      
      for (const key of keys) {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      }
      
      return true;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao limpar localStorage',
        error,
        category: errorService.categories.STORAGE
      });
      return false;
    }
  },

  /**
   * Obtém o tamanho total utilizado no localStorage pela aplicação
   * @returns {number} Tamanho em bytes
   */
  getStorageSize() {
    try {
      let totalSize = 0;
      const keys = Object.keys(localStorage);
      
      for (const key of keys) {
        if (key.startsWith(this.prefix)) {
          totalSize += localStorage.getItem(key).length;
        }
      }
      
      return totalSize;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao calcular tamanho do localStorage',
        error,
        category: errorService.categories.STORAGE
      });
      return 0;
    }
  },

  /**
   * Abre o banco de dados IndexedDB
   * @param {string} dbName - Nome do banco de dados
   * @param {number} version - Versão do banco de dados
   * @param {Function} upgradeCallback - Função chamada ao criar/atualizar o banco
   * @returns {Promise<IDBDatabase>} Objeto do banco de dados
   */
  async openIndexedDB(dbName = 'amazonia_experience_db', version = 1, upgradeCallback) {
    return new Promise((resolve, reject) => {
      try {
        if (!('indexedDB' in window)) {
          throw new Error('IndexedDB não é suportado neste navegador');
        }
        
        const prefixedDBName = this.prefix + dbName;
        const request = indexedDB.open(prefixedDBName, version);
        
        request.onerror = (event) => {
          errorService.logError({
            message: `Erro ao abrir IndexedDB: ${event.target.error}`,
            error: event.target.error,
            category: errorService.categories.STORAGE
          });
          reject(event.target.error);
        };
        
        request.onsuccess = (event) => {
          resolve(event.target.result);
        };
        
        // Chamado quando o banco é criado ou atualizado
        if (upgradeCallback && typeof upgradeCallback === 'function') {
          request.onupgradeneeded = (event) => {
            upgradeCallback(event.target.result);
          };
        }
      } catch (error) {
        errorService.logError({
          message: 'Erro ao configurar IndexedDB',
          error,
          category: errorService.categories.STORAGE
        });
        reject(error);
      }
    });
  },

  /**
   * Armazena um objeto no IndexedDB
   * @param {string} storeName - Nome do store
   * @param {Object} data - Dados a serem armazenados
   * @param {string|number} key - Chave (opcional para stores com autoIncrement)
   * @returns {Promise<any>} Chave do objeto armazenado
   */
  async storeInIndexedDB(storeName, data, key = null) {
    try {
      const db = await this.openIndexedDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        
        transaction.onerror = (event) => {
          errorService.logError({
            message: `Erro na transação do IndexedDB: ${event.target.error}`,
            error: event.target.error,
            category: errorService.categories.STORAGE
          });
          reject(event.target.error);
        };
        
        const store = transaction.objectStore(storeName);
        let request;
        
        if (key !== null) {
          request = store.put(data, key);
        } else {
          request = store.put(data);
        }
        
        request.onsuccess = (event) => {
          resolve(event.target.result);
        };
        
        request.onerror = (event) => {
          errorService.logError({
            message: `Erro ao armazenar no IndexedDB: ${event.target.error}`,
            error: event.target.error,
            category: errorService.categories.STORAGE
          });
          reject(event.target.error);
        };
      });
    } catch (error) {
      errorService.logError({
        message: `Erro ao armazenar no IndexedDB (${storeName})`,
        error,
        category: errorService.categories.STORAGE
      });
      throw error;
    }
  },

  /**
   * Obtém um objeto do IndexedDB
   * @param {string} storeName - Nome do store
   * @param {string|number} key - Chave do objeto
   * @returns {Promise<any>} Objeto armazenado
   */
  async getFromIndexedDB(storeName, key) {
    try {
      const db = await this.openIndexedDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);
        
        request.onsuccess = (event) => {
          resolve(event.target.result);
        };
        
        request.onerror = (event) => {
          errorService.logError({
            message: `Erro ao obter do IndexedDB: ${event.target.error}`,
            error: event.target.error,
            category: errorService.categories.STORAGE
          });
          reject(event.target.error);
        };
      });
    } catch (error) {
      errorService.logError({
        message: `Erro ao obter do IndexedDB (${storeName}, ${key})`,
        error,
        category: errorService.categories.STORAGE
      });
      throw error;
    }
  },

  /**
   * Remove um objeto do IndexedDB
   * @param {string} storeName - Nome do store
   * @param {string|number} key - Chave do objeto
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async removeFromIndexedDB(storeName, key) {
    try {
      const db = await this.openIndexedDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);
        
        request.onsuccess = () => {
          resolve(true);
        };
        
        request.onerror = (event) => {
          errorService.logError({
            message: `Erro ao remover do IndexedDB: ${event.target.error}`,
            error: event.target.error,
            category: errorService.categories.STORAGE
          });
          reject(event.target.error);
        };
      });
    } catch (error) {
      errorService.logError({
        message: `Erro ao remover do IndexedDB (${storeName}, ${key})`,
        error,
        category: errorService.categories.STORAGE
      });
      throw error;
    }
  },

  /**
   * Limpa todos os dados de um store no IndexedDB
   * @param {string} storeName - Nome do store
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async clearIndexedDBStore(storeName) {
    try {
      const db = await this.openIndexedDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => {
          resolve(true);
        };
        
        request.onerror = (event) => {
          errorService.logError({
            message: `Erro ao limpar store do IndexedDB: ${event.target.error}`,
            error: event.target.error,
            category: errorService.categories.STORAGE
          });
          reject(event.target.error);
        };
      });
    } catch (error) {
      errorService.logError({
        message: `Erro ao limpar store do IndexedDB (${storeName})`,
        error,
        category: errorService.categories.STORAGE
      });
      throw error;
    }
  }
};

export default storageService;