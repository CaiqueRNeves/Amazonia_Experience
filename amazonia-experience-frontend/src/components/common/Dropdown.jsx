import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown } from 'lucide-react';

/**
 * Componente de dropdown menu
 * @param {Object} props - Propriedades do componente
 * @param {React.ReactNode} props.trigger - Elemento que aciona o dropdown
 * @param {Array} props.items - Itens do menu [{ id, label, onClick, icon, disabled, danger }]
 * @param {string} props.className - Classes adicionais para o container
 * @param {string} props.menuClassName - Classes adicionais para o menu
 * @param {string} props.triggerClassName - Classes adicionais para o trigger
 * @param {string} props.placement - Posicionamento do menu: 'bottom-left', 'bottom-right', 'top-left', 'top-right'
 * @param {boolean} props.closeOnItemClick - Se deve fechar ao clicar em um item
 * @param {string} props.label - Texto para o botão padrão (usado se trigger não for fornecido)
 */
const Dropdown = ({
  trigger,
  items,
  className = '',
  menuClassName = '',
  triggerClassName = '',
  placement = 'bottom-left',
  closeOnItemClick = true,
  label = 'Opções'
}) => {
  // Estado para controlar se o menu está aberto
  const [isOpen, setIsOpen] = useState(false);
  
  // Refs para elementos DOM
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  
  // Alternar estado do menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  // Fechar menu
  const closeMenu = () => {
    setIsOpen(false);
  };
  
  // Tratar clique em item
  const handleItemClick = (item) => {
    if (item.onClick) {
      item.onClick();
    }
    
    if (closeOnItemClick) {
      closeMenu();
    }
  };
  
  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        triggerRef.current && 
        !triggerRef.current.contains(event.target)
      ) {
        closeMenu();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Determinar classes para posicionamento do menu
  const getPlacementClasses = () => {
    switch (placement) {
      case 'bottom-right':
        return 'right-0 mt-2';
      case 'top-left':
        return 'left-0 bottom-full mb-2';
      case 'top-right':
        return 'right-0 bottom-full mb-2';
      case 'bottom-left':
      default:
        return 'left-0 mt-2';
    }
  };
  
  // Trigger padrão se não for fornecido
  const defaultTrigger = (
    <button 
      className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${triggerClassName}`}
    >
      {label}
      <ChevronDown className="-mr-1 ml-2 h-4 w-4" />
    </button>
  );
  
  return (
    <div className={`relative inline-block text-left ${className}`}>
      {/* Trigger */}
      <div ref={triggerRef} onClick={toggleMenu}>
        {trigger || defaultTrigger}
      </div>
      
      {/* Menu */}
      {isOpen && (
        <div 
          ref={dropdownRef}
          className={`absolute z-10 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 ${getPlacementClasses()} ${menuClassName}`}
        >
          <div className="py-1" role="menu" aria-orientation="vertical">
            {items.map((item) => (
              <div key={item.id}>
                {item.divider ? (
                  <div className="border-t border-gray-100 my-1"></div>
                ) : (
                  <button
                    className={`
                      w-full text-left px-4 py-2 text-sm
                      ${item.disabled 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : item.danger 
                          ? 'text-red-600 hover:bg-red-50' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                    onClick={() => !item.disabled && handleItemClick(item)}
                    disabled={item.disabled}
                    role="menuitem"
                  >
                    <div className="flex items-center">
                      {item.icon && (
                        <span className="mr-2">{item.icon}</span>
                      )}
                      {item.label}
                    </div>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

Dropdown.propTypes = {
  trigger: PropTypes.node,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func,
      icon: PropTypes.node,
      disabled: PropTypes.bool,
      danger: PropTypes.bool,
      divider: PropTypes.bool
    })
  ).isRequired,
  className: PropTypes.string,
  menuClassName: PropTypes.string,
  triggerClassName: PropTypes.string,
  placement: PropTypes.oneOf(['bottom-left', 'bottom-right', 'top-left', 'top-right']),
  closeOnItemClick: PropTypes.bool,
  label: PropTypes.string
};

export default Dropdown;