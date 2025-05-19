import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { getContextEntities } from '../../redux/slices/chatSlice';

// Componentes e ícones
import { Calendar, MapPin, AlertTriangle, Wifi, Search, X } from 'lucide-react';
import Loader from '../common/Loader';

/**
 * Componente que exibe opções de contexto para o chat
 * @param {Object} props - Propriedades do componente
 * @param {Function} props.onSelect - Função chamada quando um contexto é selecionado
 * @param {Function} props.onClose - Função para fechar o painel de opções
 */
const ChatOptions = ({ onSelect, onClose }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  // Estados do Redux
  const { contextEntities, isLoading, error } = useSelector((state) => state.chat);
  
  // Estados locais
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('events');
  
  // Carregar entidades de contexto quando o componente for montado
  useEffect(() => {
    dispatch(getContextEntities(activeTab));
  }, [dispatch, activeTab]);
  
  // Filtrar entidades com base no termo de busca
  const getFilteredEntities = () => {
    if (!contextEntities.data || !contextEntities.data[activeTab]) {
      return [];
    }
    
    if (!searchTerm) {
      return contextEntities.data[activeTab];
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return contextEntities.data[activeTab].filter(entity => 
      entity.name.toLowerCase().includes(lowerSearchTerm) ||
      (entity.description && entity.description.toLowerCase().includes(lowerSearchTerm))
    );
  };
  
  // Obter ícone para o tipo de entidade
  const getEntityIcon = (entityType) => {
    switch (entityType) {
      case 'events':
        return <Calendar size={16} />;
      case 'places':
        return <MapPin size={16} />;
      case 'emergency':
        return <AlertTriangle size={16} />;
      case 'connectivity':
        return <Wifi size={16} />;
      default:
        return null;
    }
  };
  
  // Selecionar contexto
  const handleSelectContext = (entity) => {
    onSelect({
      type: activeTab === 'events' ? 'event' : 
            activeTab === 'places' ? 'place' : activeTab,
      id: entity.id,
      name: entity.name,
      description: entity.description
    });
  };
  
  // Renderizar tab
  const renderTab = (tab, label) => {
    return (
      <button
        className={`px-4 py-2 text-sm font-medium ${
          activeTab === tab 
            ? 'text-blue-600 border-b-2 border-blue-600' 
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => setActiveTab(tab)}
      >
        {label}
      </button>
    );
  };
  
  return (
    <div className="absolute bottom-full left-0 right-0 bg-white border-t shadow-lg max-h-96 overflow-hidden flex flex-col">
      {/* Cabeçalho */}
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-bold">{t('chat.contextSelector.title')}</h3>
        <button
          className="p-1 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-200"
          onClick={onClose}
          aria-label={t('common.close')}
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Tabs de categorias */}
      <div className="border-b overflow-x-auto">
        <div className="flex">
          {renderTab('events', t('chat.contextSelector.tabs.events'))}
          {renderTab('places', t('chat.contextSelector.tabs.places'))}
          {renderTab('emergency', t('chat.contextSelector.tabs.emergency'))}
          {renderTab('connectivity', t('chat.contextSelector.tabs.connectivity'))}
        </div>
      </div>
      
      {/* Barra de busca */}
      <div className="p-3 border-b">
        <div className="relative">
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('chat.contextSelector.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          {searchTerm && (
            <button
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              onClick={() => setSearchTerm('')}
              aria-label={t('common.clear')}
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>
      
      {/* Lista de entidades */}
      <div className="overflow-y-auto flex-1">
        {isLoading ? (
          <div className="p-4 flex justify-center">
            <Loader size="sm" message={t('common.loading')} />
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-600">
            {error}
          </div>
        ) : getFilteredEntities().length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm
              ? t('chat.contextSelector.noSearchResults')
              : t('chat.contextSelector.noEntities')}
          </div>
        ) : (
          <ul className="divide-y">
            {getFilteredEntities().map((entity) => (
              <li key={entity.id}>
                <button
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start"
                  onClick={() => handleSelectContext(entity)}
                >
                  <div className="text-blue-600 mt-0.5 mr-3">
                    {getEntityIcon(activeTab)}
                  </div>
                  <div>
                    <div className="font-medium">{entity.name}</div>
                    {entity.description && (
                      <div className="text-sm text-gray-600 line-clamp-2">
                        {entity.description}
                      </div>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChatOptions;