import React from 'react';
import PropTypes from 'prop-types';

// Ícones
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Componente de paginação
 * @param {Object} props - Propriedades do componente
 * @param {number} props.currentPage - Página atual
 * @param {number} props.totalPages - Total de páginas
 * @param {Function} props.onPageChange - Função chamada quando a página muda
 * @param {boolean} props.showPageNumbers - Se deve mostrar números de página
 * @param {number} props.maxPageButtons - Número máximo de botões de página a serem exibidos
 * @param {string} props.className - Classes adicionais
 */
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  showPageNumbers = true,
  maxPageButtons = 5,
  className = ''
}) => {
  // Se houver apenas uma página, não mostrar a paginação
  if (totalPages <= 1) {
    return null;
  }
  
  // Função para gerar array de números de página a serem exibidos
  const getPageNumbers = () => {
    let pages = [];
    
    // Se o número total de páginas é menor ou igual ao máximo de botões
    if (totalPages <= maxPageButtons) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }
    
    // Se há mais páginas que o máximo, mostrar algumas páginas e "..."
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = startPage + maxPageButtons - 1;
    
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    
    // Adicionar primeira página
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }
    
    // Adicionar páginas intermediárias
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Adicionar última página
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  // Função para navegar para a página anterior
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };
  
  // Função para navegar para a próxima página
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };
  
  // Obter array de números de página
  const pageNumbers = showPageNumbers ? getPageNumbers() : [];
  
  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      {/* Botão para página anterior */}
      <button
        onClick={goToPreviousPage}
        disabled={currentPage === 1}
        className={`p-2 rounded-md ${
          currentPage === 1 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        aria-label="Página anterior"
      >
        <ChevronLeft size={16} />
      </button>
      
      {/* Números de página */}
      {showPageNumbers && pageNumbers.map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="px-2 text-gray-500">...</span>
          ) : (
            <button
              onClick={() => page !== currentPage && onPageChange(page)}
              className={`px-3 py-1 rounded-md ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}
      
      {/* Botão para próxima página */}
      <button
        onClick={goToNextPage}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-md ${
          currentPage === totalPages 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        aria-label="Próxima página"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  showPageNumbers: PropTypes.bool,
  maxPageButtons: PropTypes.number,
  className: PropTypes.string
};

export default Pagination;