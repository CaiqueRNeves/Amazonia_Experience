import React, { createContext, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalStorage } from '../hooks';
import { APP_CONFIG } from '../utils/constants';

// Criação do contexto
export const LanguageContext = createContext(null);

/**
 * Provedor de idioma da aplicação
 * Gerencia o idioma atual e traduções
 */
export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  
  // Usar hook de localStorage para persistir a preferência de idioma
  const [storedLanguage, setStoredLanguage] = useLocalStorage(
    'amazonia_language',
    getDefaultLanguage()
  );

  // Definir idioma quando o componente for montado
  useEffect(() => {
    if (storedLanguage) {
      changeLanguage(storedLanguage);
    }
  }, [storedLanguage]);

  /**
   * Obtém o idioma padrão com base nas preferências do navegador
   * @returns {string} Código do idioma
   */
  function getDefaultLanguage() {
    // Verificar idiomas suportados pela aplicação
    const supportedLanguages = APP_CONFIG.SUPPORTED_LANGUAGES;
    
    // Obter idioma do navegador
    const browserLanguages = navigator.languages || [navigator.language || navigator.userLanguage];
    
    // Verificar se algum dos idiomas do navegador é suportado
    for (const lang of browserLanguages) {
      // Verificar correspondência exata (pt-BR)
      if (supportedLanguages.includes(lang)) {
        return lang;
      }
      
      // Verificar correspondência de idioma base (pt)
      const baseLang = lang.split('-')[0];
      const matchedLang = supportedLanguages.find(
        supported => supported.startsWith(baseLang + '-')
      );
      
      if (matchedLang) {
        return matchedLang;
      }
    }
    
    // Retornar idioma padrão da aplicação
    return APP_CONFIG.DEFAULT_LANGUAGE;
  }

  /**
   * Muda o idioma da aplicação
   * @param {string} language - Código do idioma
   * @returns {Promise<boolean>} Sucesso da operação
   */
  const changeLanguage = useCallback(async (language) => {
    if (!APP_CONFIG.SUPPORTED_LANGUAGES.includes(language)) {
      console.warn(`Idioma não suportado: ${language}`);
      return false;
    }
    
    try {
      await i18n.changeLanguage(language);
      setStoredLanguage(language);
      
      // Atualizar atributo lang do HTML
      document.documentElement.lang = language.split('-')[0];
      
      return true;
    } catch (error) {
      console.error('Erro ao mudar idioma:', error);
      return false;
    }
  }, [i18n, setStoredLanguage]);

  /**
   * Formata um texto para exibição no idioma atual
   * Útil para internacionalizar conteúdo obtido da API
   * @param {Object} translations - Objeto com traduções em diferentes idiomas
   * @param {string} defaultLanguage - Idioma padrão caso não haja tradução
   * @returns {string} Texto traduzido
   */
  const getLocalizedText = useCallback((translations, defaultLanguage = APP_CONFIG.DEFAULT_LANGUAGE) => {
    if (!translations) return '';
    
    const currentLanguage = i18n.language;
    
    // Verificar se há tradução para o idioma atual
    if (translations[currentLanguage]) {
      return translations[currentLanguage];
    }
    
    // Verificar se há tradução para o idioma base (pt de pt-BR)
    const baseLang = currentLanguage.split('-')[0];
    const baseMatch = Object.keys(translations).find(key => key.startsWith(baseLang + '-'));
    
    if (baseMatch && translations[baseMatch]) {
      return translations[baseMatch];
    }
    
    // Retornar tradução no idioma padrão ou primeira tradução disponível
    return translations[defaultLanguage] || Object.values(translations)[0] || '';
  }, [i18n.language]);

  // Valores expostos pelo contexto
  const value = {
    currentLanguage: i18n.language,
    supportedLanguages: APP_CONFIG.SUPPORTED_LANGUAGES,
    changeLanguage,
    getLocalizedText,
    
    // Mapeamento de códigos de idioma para nomes legíveis
    languageNames: {
      'pt-BR': 'Português',
      'en-US': 'English',
      'es-ES': 'Español',
      'fr-FR': 'Français'
    }
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook personalizado para usar o contexto de idioma
export const useLanguage = () => {
  const context = React.useContext(LanguageContext);
  
  if (!context) {
    throw new Error('useLanguage deve ser usado dentro de um LanguageProvider');
  }
  
  return context;
};

export default { LanguageContext, LanguageProvider, useLanguage };