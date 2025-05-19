import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import LoadingIndicator from '../common/LoadingIndicator';
import Icon from '../common/Icon';
import EmptyState from '../common/EmptyState';
import Accordion from '../common/Accordion';
import SearchInput from '../common/SearchInput';

/**
 * Componente que exibe frases úteis em situações de emergência
 * Organizadas por categoria e com opção de busca
 * 
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.phrases - Objeto com frases organizadas por categorias
 * @param {boolean} props.isLoading - Flag indicando se os dados estão sendo carregados
 */
const EmergencyPhrases = ({ phrases, isLoading }) => {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Renderiza loader enquanto carrega
  if (isLoading) {
    return <LoadingIndicator message={t('emergency.loadingPhrases')} />;
  }
  
  // Se não houver frases
  if (!phrases || Object.keys(phrases).length === 0) {
    return (
      <EmptyState
        icon="chat-bubble-bottom"
        title={t('emergency.noPhrases')}
        message={t('emergency.noPhrasesMessage')}
      />
    );
  }
  
  // Filtra frases com base no termo de busca
  const filterPhrases = (categoryPhrases) => {
    if (!searchTerm) return categoryPhrases;
    
    return categoryPhrases.filter(phrase => 
      phrase.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phrase.translation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phrase.pronunciation?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  
  // Filtra categorias com base no termo de busca e retorna apenas as não vazias
  const filteredCategories = Object.entries(phrases).reduce((acc, [category, categoryPhrases]) => {
    const filtered = filterPhrases(categoryPhrases);
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {});
  
  // Se não houver resultados para a busca
  const hasNoResults = Object.keys(filteredCategories).length === 0;
  
  // Renderiza uma frase
  const renderPhrase = (phrase) => (
    <div key={phrase.id} className="phrase-item p-3 border-b border-gray-100 last:border-b-0">
      <div className="phrase-text mb-1 font-medium">{phrase.text}</div>
      
      {phrase.translation && (
        <div className="phrase-translation text-sm text-gray-700">
          {phrase.translation}
        </div>
      )}
      
      {phrase.pronunciation && (
        <div className="phrase-pronunciation text-sm text-gray-500 italic mt-1">
          {phrase.pronunciation}
        </div>
      )}
    </div>
  );
  
  // Mapeamento de ícones para categorias
  const categoryIcons = {
    medical: 'heart-pulse',
    police: 'shield-exclamation',
    transportation: 'truck',
    accommodation: 'home',
    general: 'chat-bubble-bottom',
    emergencies: 'bell-alert'
  };
  
  // Mapeamento de nomes de categorias
  const getCategoryName = (category) => {
    return t(`emergency.phraseCategories.${category}`) || category;
  };
  
  return (
    <div className="emergency-phrases">
      <p className="text-base text-gray-700 mb-4">
        {t('emergency.phrasesDescription')}
      </p>
      
      {/* Campo de busca */}
      <div className="search-container mb-4">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder={t('emergency.searchPhrases')}
        />
      </div>
      
      {/* Sem resultados */}
      {hasNoResults && (
        <EmptyState
          icon="search"
          title={t('common.noSearchResults')}
          message={t('emergency.noPhrasesSearchResults', { term: searchTerm })}
        />
      )}
      
      {/* Lista de categorias */}
      <div className="categories-list">
        {Object.entries(filteredCategories).map(([category, categoryPhrases]) => (
          <Accordion
            key={category}
            title={getCategoryName(category)}
            icon={categoryIcons[category] || 'chat-bubble-bottom'}
            defaultOpen={Object.keys(filteredCategories).length === 1}
          >
            <div className="phrases-list bg-gray-50 rounded-lg">
              {categoryPhrases.map(phrase => renderPhrase(phrase))}
            </div>
          </Accordion>
        ))}
      </div>
      
      {/* Nota sobre idioma */}
      <div className="note text-sm text-gray-500 bg-gray-50 p-3 rounded-lg mt-4">
        <Icon name="information-circle" className="inline-block mr-1" />
        {t('emergency.phraseLanguageNote')}
      </div>
    </div>
  );
};

EmergencyPhrases.propTypes = {
  phrases: PropTypes.object,
  isLoading: PropTypes.bool
};

EmergencyPhrases.defaultProps = {
  phrases: {},
  isLoading: false
};

export default EmergencyPhrases;