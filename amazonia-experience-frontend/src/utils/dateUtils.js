/**
 * Utilitários para manipulação de datas
 * Contém funções para formatar, manipular e validar datas
 */

/**
 * Formata uma data no formato local brasileiro (DD/MM/AAAA)
 * @param {Date|string} date - Data a ser formatada
 * @returns {string} Data formatada
 */
export const formatLocalDate = (date) => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    console.error('Data inválida:', date);
    return '';
  }
  
  return dateObj.toLocaleDateString('pt-BR');
};

/**
 * Formata uma data com horário no formato local brasileiro (DD/MM/AAAA HH:MM)
 * @param {Date|string} date - Data a ser formatada
 * @returns {string} Data e hora formatadas
 */
export const formatLocalDateTime = (date) => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    console.error('Data inválida:', date);
    return '';
  }
  
  return dateObj.toLocaleDateString('pt-BR') + ' ' + 
         dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Formata uma data no formato ISO (AAAA-MM-DD)
 * @param {Date|string} date - Data a ser formatada
 * @returns {string} Data formatada em ISO
 */
export const formatISODate = (date) => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    console.error('Data inválida:', date);
    return '';
  }
  
  return dateObj.toISOString().split('T')[0];
};

/**
 * Formata a hora no formato de 24 horas (HH:MM)
 * @param {Date|string} date - Data a ser formatada
 * @returns {string} Hora formatada
 */
export const formatTime = (date) => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    console.error('Data inválida:', date);
    return '';
  }
  
  return dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Retorna a diferença entre duas datas em dias
 * @param {Date|string} date1 - Primeira data
 * @param {Date|string} date2 - Segunda data
 * @returns {number} Diferença em dias
 */
export const getDaysDifference = (date1, date2) => {
  const d1 = date1 instanceof Date ? date1 : new Date(date1);
  const d2 = date2 instanceof Date ? date2 : new Date(date2);
  
  // Verificar se as datas são válidas
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    console.error('Datas inválidas:', date1, date2);
    return 0;
  }
  
  // Calcular a diferença em dias
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Verifica se uma data é hoje
 * @param {Date|string} date - Data a ser verificada
 * @returns {boolean} True se a data for hoje
 */
export const isToday = (date) => {
  const today = new Date();
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    console.error('Data inválida:', date);
    return false;
  }
  
  return dateObj.getDate() === today.getDate() && 
         dateObj.getMonth() === today.getMonth() && 
         dateObj.getFullYear() === today.getFullYear();
};

/**
 * Verifica se uma data está no futuro
 * @param {Date|string} date - Data a ser verificada
 * @returns {boolean} True se a data estiver no futuro
 */
export const isFutureDate = (date) => {
  const now = new Date();
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    console.error('Data inválida:', date);
    return false;
  }
  
  return dateObj > now;
};

/**
 * Verifica se uma data está no passado
 * @param {Date|string} date - Data a ser verificada
 * @returns {boolean} True se a data estiver no passado
 */
export const isPastDate = (date) => {
  const now = new Date();
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    console.error('Data inválida:', date);
    return false;
  }
  
  return dateObj < now;
};

/**
 * Adiciona dias a uma data
 * @param {Date|string} date - Data base
 * @param {number} days - Número de dias a adicionar
 * @returns {Date} Nova data
 */
export const addDays = (date, days) => {
  const dateObj = date instanceof Date ? new Date(date) : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    console.error('Data inválida:', date);
    return new Date();
  }
  
  dateObj.setDate(dateObj.getDate() + days);
  return dateObj;
};

/**
 * Formata uma data de forma relativa (ex: hoje, ontem, amanhã, há 2 dias, etc.)
 * @param {Date|string} date - Data a ser formatada
 * @returns {string} Data formatada em formato relativo
 */
export const formatRelativeDate = (date) => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    console.error('Data inválida:', date);
    return '';
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const targetDate = new Date(dateObj);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffDays = Math.round((targetDate - today) / (1000 * 60 * 60 * 24));
  
  switch (diffDays) {
    case -1:
      return 'Ontem';
    case 0:
      return 'Hoje';
    case 1:
      return 'Amanhã';
    default:
      if (diffDays < 0) {
        return `Há ${Math.abs(diffDays)} dias`;
      } else {
        return `Em ${diffDays} dias`;
      }
  }
};

/**
 * Obtém nome do dia da semana
 * @param {Date|string} date - Data
 * @param {boolean} abbreviated - Se deve retornar forma abreviada
 * @returns {string} Nome do dia da semana
 */
export const getDayOfWeek = (date, abbreviated = false) => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    console.error('Data inválida:', date);
    return '';
  }
  
  const options = { weekday: abbreviated ? 'short' : 'long' };
  return dateObj.toLocaleDateString('pt-BR', options);
};

/**
 * Obtém nome do mês
 * @param {Date|string|number} date - Data ou número do mês (1-12)
 * @param {boolean} abbreviated - Se deve retornar forma abreviada
 * @returns {string} Nome do mês
 */
export const getMonthName = (date, abbreviated = false) => {
  // Se for um número, assumimos que é o mês (1-12)
  if (typeof date === 'number') {
    const tempDate = new Date();
    tempDate.setMonth(date - 1);
    date = tempDate;
  }
  
  // Se não for uma data
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    console.error('Data inválida:', date);
    return '';
  }
  
  const options = { month: abbreviated ? 'short' : 'long' };
  return dateObj.toLocaleDateString('pt-BR', options);
};

/**
 * Verifica se uma data é válida
 * @param {Date|string} date - Data a ser verificada
 * @returns {boolean} True se a data for válida
 */
export const isValidDate = (date) => {
  if (!date) return false;
  
  const dateObj = date instanceof Date ? date : new Date(date);
  return !isNaN(dateObj.getTime());
};

/**
 * Converte uma string de data em um objeto Date
 * @param {string} dateString - String de data
 * @param {string} format - Formato da data (default: 'YYYY-MM-DD')
 * @returns {Date} Objeto Date
 */
export const parseDate = (dateString, format = 'YYYY-MM-DD') => {
  if (!dateString) return null;
  
  // Tenta converter diretamente primeiro
  let date = new Date(dateString);
  
  // Se a conversão direta falhar, tenta parser baseado no formato
  if (isNaN(date.getTime())) {
    const parts = dateString.split(/[-\/]/);
    
    switch (format) {
      case 'YYYY-MM-DD':
        date = new Date(parts[0], parts[1] - 1, parts[2]);
        break;
      case 'DD-MM-YYYY':
        date = new Date(parts[2], parts[1] - 1, parts[0]);
        break;
      case 'MM-DD-YYYY':
        date = new Date(parts[2], parts[0] - 1, parts[1]);
        break;
      default:
        date = new Date(dateString);
    }
  }
  
  return date;
};

export default {
  formatLocalDate,
  formatLocalDateTime,
  formatISODate,
  formatTime,
  getDaysDifference,
  isToday,
  isFutureDate,
  isPastDate,
  addDays,
  formatRelativeDate,
  getDayOfWeek,
  getMonthName,
  isValidDate,
  parseDate
};