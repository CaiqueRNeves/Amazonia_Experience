import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import errorService from './errorService';
import storageService from './storageService';

/**
 * Serviço para internacionalização (i18n)
 * Gerencia tradução, detecção de idioma e recursos de internacionalização
 */
const i18nService = {
  /**
   * Inicializa o serviço de i18n
   * @returns {Object} Instância do i18n
   */
  init() {
    try {
      i18n
        // Carrega traduções de backend (locais ou remotos)
        .use(Backend)
        // Detecta o idioma do navegador
        .use(LanguageDetector)
        // Integração com React
        .use(initReactI18next)
        // Inicializa o i18n
        .init({
          // Idioma de fallback
          fallbackLng: 'pt-BR',
          // Idiomas suportados
          supportedLngs: ['pt-BR', 'en-US', 'es-ES', 'fr-FR', 'de-DE', 'zh-CN', 'ru-RU'],
          // Detecção de idioma
          detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            lookupLocalStorage: 'i18nextLng',
            caches: ['localStorage']
          },
          // Interpolação
          interpolation: {
            escapeValue: false // React já escapa por padrão
          },
          // Namespace padrão
          defaultNS: 'common',
          // Namespaces a serem carregados
          ns: ['common', 'errors', 'auth', 'events', 'places', 'quizzes', 'rewards', 'chat', 'emergency'],
          // Cache de backend
          backend: {
            loadPath: '/locales/{{lng}}/{{ns}}.json'
          },
          // Não recarrega se idioma já existe
          react: {
            useSuspense: true,
            wait: true
          }
        });

      return i18n;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao inicializar serviço de i18n',
        error
      });
      
      // Retorna instância mesmo se houver erro
      return i18n;
    }
  },

  /**
   * Altera o idioma atual
   * @param {string} language - Código do idioma (pt-BR, en-US, etc)
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async changeLanguage(language) {
    try {
      // Verifica se é um idioma suportado
      if (!this.isLanguageSupported(language)) {
        throw new Error(`Idioma não suportado: ${language}`);
      }
      
      // Altera o idioma
      await i18n.changeLanguage(language);
      
      // Salva a preferência do usuário
      storageService.set('i18nextLng', language);
      
      return true;
    } catch (error) {
      errorService.logError({
        message: `Erro ao alterar idioma para ${language}`,
        error
      });
      return false;
    }
  },

  /**
   * Obtém o idioma atual
   * @returns {string} Código do idioma
   */
  getCurrentLanguage() {
    return i18n.language;
  },

  /**
   * Obtém lista de idiomas suportados
   * @returns {string[]} Lista de códigos de idioma
   */
  getSupportedLanguages() {
    return i18n.options.supportedLngs;
  },

  /**
   * Verifica se um idioma é suportado
   * @param {string} language - Código do idioma
   * @returns {boolean} Verdadeiro se suportado
   */
  isLanguageSupported(language) {
    return i18n.options.supportedLngs.includes(language);
  },

  /**
   * Traduz um texto
   * @param {string} key - Chave de tradução
   * @param {Object} options - Opções de tradução
   * @returns {string} Texto traduzido
   */
  translate(key, options = {}) {
    return i18n.t(key, options);
  },

  /**
   * Formata uma data conforme o idioma atual
   * @param {Date} date - Data para formatar
   * @param {Object} options - Opções de formatação
   * @returns {string} Data formatada
   */
  formatDate(date, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    const formatOptions = { ...defaultOptions, ...options };
    
    return new Intl.DateTimeFormat(this.getCurrentLanguage(), formatOptions).format(date);
  },

  /**
   * Formata um número conforme o idioma atual
   * @param {number} number - Número para formatar
   * @param {Object} options - Opções de formatação
   * @returns {string} Número formatado
   */
  formatNumber(number, options = {}) {
    return new Intl.NumberFormat(this.getCurrentLanguage(), options).format(number);
  },

  /**
   * Formata um valor monetário conforme o idioma atual
   * @param {number} amount - Valor para formatar
   * @param {string} currency - Código da moeda (BRL, USD, etc)
   * @returns {string} Valor monetário formatado
   */
  formatCurrency(amount, currency = 'BRL') {
    return new Intl.NumberFormat(this.getCurrentLanguage(), {
      style: 'currency',
      currency
    }).format(amount);
  },

  /**
   * Verifica se o idioma atual é da direita para a esquerda (RTL)
   * @returns {boolean} Verdadeiro se for RTL
   */
  isRTL() {
    // Lista de idiomas RTL
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    
    // Verifica se o idioma atual está na lista
    const currentLang = this.getCurrentLanguage().split('-')[0];
    return rtlLanguages.includes(currentLang);
  },

  /**
   * Obtém a direção do texto para o idioma atual
   * @returns {string} 'rtl' ou 'ltr'
   */
  getTextDirection() {
    return this.isRTL() ? 'rtl' : 'ltr';
  },

  /**
   * Obtém os recursos de um namespace em um idioma específico
   * @param {string} namespace - Namespace a ser carregado
   * @param {string} language - Código do idioma
   * @returns {Promise<Object>} Recursos do namespace
   */
  async getResourceBundle(namespace, language = this.getCurrentLanguage()) {
    try {
      return await i18n.loadNamespaces(namespace).then(() => {
        return i18n.getResourceBundle(language, namespace);
      });
    } catch (error) {
      errorService.logError({
        message: `Erro ao carregar namespace ${namespace} para idioma ${language}`,
        error
      });
      return {};
    }
  },

  /**
   * Adiciona recursos ao i18n
   * @param {string} language - Código do idioma
   * @param {string} namespace - Namespace a ser adicionado
   * @param {Object} resources - Recursos a serem adicionados
   */
  addResources(language, namespace, resources) {
    i18n.addResourceBundle(language, namespace, resources, true, true);
  }
};

export default i18nService;