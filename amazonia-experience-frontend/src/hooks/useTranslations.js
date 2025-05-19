import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

/**
 * Hook personalizado que estende o hook useTranslation do i18next
 * Adiciona funções utilitárias para facilitar o trabalho com traduções
 * 
 * @param {string} ns - Namespace para traduções (opcional)
 * @returns {Object} Objeto com funções e dados de tradução expandidos
 */
const useTranslations = (ns) => {
  // Usa o hook básico do i18next
  const { t, i18n } = useTranslation(ns);

  /**
   * Traduz um texto com interpolação de variáveis formatadas
   * @param {string} key - Chave de tradução
   * @param {Object} options - Opções incluindo variáveis para interpolação
   * @returns {string} Texto traduzido e formatado
   */
  const tFormat = useCallback((key, options = {}) => {
    const formattedOptions = { ...options };
    
    // Verifica se há valores para formatar
    if (options.formatParams) {
      for (const param of options.formatParams) {
        if (options[param] !== undefined && typeof options[param] === 'number') {
          // Formata números de acordo com o locale atual
          formattedOptions[param] = new Intl.NumberFormat(i18n.language).format(options[param]);
        } else if (options[param] instanceof Date) {
          // Formata datas de acordo com o locale atual
          formattedOptions[param] = new Intl.DateTimeFormat(i18n.language).format(options[param]);
        }
      }
    }
    
    return t(key, formattedOptions);
  }, [t, i18n.language]);

  /**
   * Formata uma data de acordo com o locale atual
   * @param {Date} date - Data para formatar
   * @param {Object} options - Opções de formatação
   * @returns {string} Data formatada
   */
  const formatDate = useCallback((date, options = {}) => {
    return new Intl.DateTimeFormat(i18n.language, options).format(date);
  }, [i18n.language]);

  /**
   * Formata um número de acordo com o locale atual
   * @param {number} number - Número para formatar
   * @param {Object} options - Opções de formatação
   * @returns {string} Número formatado
   */
  const formatNumber = useCallback((number, options = {}) => {
    return new Intl.NumberFormat(i18n.language, options).format(number);
  }, [i18n.language]);

  /**
   * Formata um valor monetário de acordo com o locale atual
   * @param {number} amount - Valor para formatar
   * @param {string} currency - Código da moeda (ex: 'BRL', 'USD')
   * @returns {string} Valor monetário formatado
   */
  const formatCurrency = useCallback((amount, currency = 'BRL') => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency
    }).format(amount);
  }, [i18n.language]);

  /**
   * Traduz um texto com plural baseado na quantidade
   * @param {string} key - Chave base de tradução
   * @param {number} count - Quantidade para determinar o plural
   * @param {Object} options - Opções adicionais
   * @returns {string} Texto traduzido com o plural correto
   */
  const tPlural = useCallback((key, count, options = {}) => {
    return t(key, {
      count,
      ...options
    });
  }, [t]);

  /**
   * Verifica se uma chave de tradução existe
   * @param {string} key - Chave de tradução
   * @returns {boolean} Verdadeiro se a chave existir
   */
  const exists = useCallback((key) => {
    const value = t(key, { returnObjects: true });
    return key !== value && value !== undefined;
  }, [t]);

  return {
    t,
    i18n,
    tFormat,
    formatDate,
    formatNumber,
    formatCurrency,
    tPlural,
    exists,
    currentLanguage: i18n.language,
    changeLanguage: i18n.changeLanguage,
    languages: i18n.languages
  };
};

export default useTranslations;