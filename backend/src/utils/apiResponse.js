/**
 * Utilitário para padronizar as respostas da API
 * Garante consistência em todos os endpoints
 */

/**
 * Formata uma resposta de sucesso
 * @param {Object} res - Objeto de resposta do Express
 * @param {Object} data - Dados a serem retornados
 * @param {number} statusCode - Código de status HTTP (default: 200)
 * @returns {Object} Resposta formatada
 */
export const success = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    status: 'success',
    data
  });
};

/**
 * Formata uma resposta de erro
 * @param {Object} res - Objeto de resposta do Express
 * @param {string} message - Mensagem de erro
 * @param {number} statusCode - Código de status HTTP (default: 500)
 * @returns {Object} Resposta formatada
 */
export const error = (res, message, statusCode = 500) => {
  return res.status(statusCode).json({
    status: 'error',
    message
  });
};

/**
 * Formata uma resposta para paginação
 * @param {Object} res - Objeto de resposta do Express
 * @param {Array} items - Itens da página atual
 * @param {number} page - Número da página atual
 * @param {number} limit - Limite de itens por página
 * @param {number} total - Total de itens
 * @param {string} itemName - Nome dos itens (opcional)
 * @returns {Object} Resposta formatada com informações de paginação
 */
export const paginated = (res, items, page, limit, total, itemName = 'items') => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  const data = {
    pagination: {
      page,
      limit,
      total,
      total_pages: totalPages,
      has_next_page: hasNextPage,
      has_prev_page: hasPrevPage
    }
  };
  
  // Adicionar os itens dinamicamente com o nome fornecido
  data[itemName] = items;
  
  return res.json({
    status: 'success',
    data
  });
};

/**
 * Formata uma resposta de criação
 * @param {Object} res - Objeto de resposta do Express
 * @param {Object} data - Dados criados
 * @param {string} message - Mensagem personalizada (opcional)
 * @returns {Object} Resposta formatada com código 201
 */
export const created = (res, data, message = 'Recurso criado com sucesso') => {
  return res.status(201).json({
    status: 'success',
    message,
    data
  });
};

/**
 * Formata uma resposta sem conteúdo
 * @param {Object} res - Objeto de resposta do Express
 * @returns {Object} Resposta com código 204
 */
export const noContent = (res) => {
  return res.status(204).send();
};