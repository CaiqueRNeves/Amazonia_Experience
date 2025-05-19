import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Componente de abas
 * @param {Object} props - Propriedades do componente
 * @param {Array} props.tabs - Lista de abas [{ id, label, content, disabled }]
 * @param {string} props.defaultTabId - ID da aba padrão
 * @param {Function} props.onChange - Função chamada quando a aba ativa muda
 * @param {string} props.className - Classes adicionais para o container
 * @param {string} props.tabsClassName - Classes adicionais para a lista de abas
 * @param {string} props.contentClassName - Classes adicionais para o conteúdo
 * @param {string} props.orientation - Orientação das abas: 'horizontal', 'vertical'
 * @param {boolean} props.bordered - Se deve mostrar bordas em volta do conteúdo
 */
const Tabs = ({
  tabs,
  defaultTabId,
  onChange,
  className = '',
  tabsClassName = '',
  contentClassName = '',
  orientation = 'horizontal',
  bordered = true
}) => {
  // Estado para controlar a aba ativa
  const [activeTabId, setActiveTabId] = useState(defaultTabId || (tabs.length > 0 ? tabs[0].id : ''));
  
  // Função para trocar de aba
  const handleTabChange = (tabId) => {
    setActiveTabId(tabId);
    
    if (onChange) {
      onChange(tabId);
    }
  };
  
  // Aba ativa
  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];
  
  // Classes para orientação
  const isVertical = orientation === 'vertical';
  const containerClasses = `${isVertical ? 'flex' : ''} ${className}`;
  
  // Classes para a lista de abas
  const tabListClasses = `
    ${tabsClassName}
    ${isVertical 
      ? 'flex-shrink-0 border-r' 
      : 'flex border-b'
    }
  `;
  
  // Classes para o conteúdo
  const contentClasses = `
    ${contentClassName}
    ${isVertical ? 'flex-1 ml-6' : 'pt-4'}
    ${bordered && !isVertical ? 'px-4 py-5 border-l border-r border-b rounded-b-lg' : ''}
  `;
  
  return (
    <div className={containerClasses}>
      {/* Lista de abas */}
      <div className={tabListClasses}>
        <div className={`${isVertical ? 'flex flex-col space-y-1' : 'flex space-x-2'}`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`
                ${isVertical 
                  ? 'px-3 py-2 text-left' 
                  : 'px-3 py-2'
                }
                text-sm font-medium focus:outline-none
                ${activeTabId === tab.id
                  ? 'text-blue-600 border-blue-600 ' + (isVertical ? 'border-r-2' : 'border-b-2')
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 ' + (isVertical ? 'border-r-0' : 'border-b-0')
                }
                ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={() => !tab.disabled && handleTabChange(tab.id)}
              disabled={tab.disabled}
              aria-selected={activeTabId === tab.id}
              role="tab"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Conteúdo da aba ativa */}
      <div className={contentClasses}>
        {activeTab && activeTab.content}
      </div>
    </div>
  );
};

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.node.isRequired,
      content: PropTypes.node.isRequired,
      disabled: PropTypes.bool
    })
  ).isRequired,
  defaultTabId: PropTypes.string,
  onChange: PropTypes.func,
  className: PropTypes.string,
  tabsClassName: PropTypes.string,
  contentClassName: PropTypes.string,
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  bordered: PropTypes.bool
};

export default Tabs;